import fs from "node:fs";
import path from "node:path";
import { parseJsonObject } from "./schema.mjs";

export class CapReachedError extends Error {}

// Daily call counter + token totals, persisted so the cap holds across runs on the same day.
export function makeMeter({ stateDir, today, cap }) {
  const file = path.join(stateDir, "usage.json");
  let u = { date: today, calls: 0, tokens: {} };
  try { const prev = JSON.parse(fs.readFileSync(file, "utf8")); if (prev.date === today) u = prev; } catch {}
  const run = { calls: 0, tokens: {} };
  return {
    remaining: () => Math.max(0, cap - u.calls),
    record(model, usage) {
      u.calls++; run.calls++;
      for (const t of [u.tokens, run.tokens]) {
        t[model] ??= { input: 0, output: 0 };
        t[model].input += usage?.input_tokens || 0;
        t[model].output += usage?.output_tokens || 0;
      }
    },
    assertCanCall() { if (u.calls >= cap) throw new CapReachedError(`daily cap of ${cap} calls reached`); },
    save() { fs.mkdirSync(stateDir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(u, null, 2)); },
    run,
  };
}

// One JSON-returning call, validated, with exactly one retry that tells Claude what was wrong.
export async function jsonCall({ client, meter, model, system, user, validate, maxTokens = 4000 }) {
  let feedback = "";
  let lastErrors = [];
  for (let attempt = 1; attempt <= 2; attempt++) {
    meter.assertCanCall();
    const res = await client.messages.create({
      model,
      max_tokens: maxTokens,
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: user + feedback }],
    });
    meter.record(model, res.usage);
    try {
      const text = res.content.filter(b => b.type === "text").map(b => b.text).join("");
      const obj = parseJsonObject(text);
      const v = validate(obj);
      if (v.ok) return obj;
      lastErrors = v.errors;
    } catch (e) {
      lastErrors = [e.message];
    }
    feedback = `\n\nYour previous reply was rejected: ${lastErrors.join("; ")}. Reply again with ONLY the corrected JSON object.`;
  }
  const err = new Error(`invalid output after retry: ${lastErrors.join("; ")}`);
  err.invalid = true;
  throw err;
}
