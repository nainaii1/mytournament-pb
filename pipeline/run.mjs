#!/usr/bin/env node
// Usage:
//   node run.mjs --dry-run          show what would happen; makes no API calls
//   node run.mjs                    process every .txt in inbox/
//   node run.mjs approve hold/X.json   approve a held (low-confidence) record after you checked it
import path from "node:path";
import url from "node:url";
import fs from "node:fs";
import { loadConfig, todayMYT } from "./lib/config.mjs";
import { makeMeter } from "./lib/claude.mjs";
import { runPipeline, approveHeld, slug, toSheetDate } from "./lib/process.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(here, "..");
for (const f of [path.join(here, ".env")]) { if (fs.existsSync(f)) process.loadEnvFile(f); }

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const cfg = loadConfig();
const today = todayMYT();
const paths = {
  inboxDir: path.join(here, "inbox"), holdDir: path.join(here, "hold"), seenFile: path.join(here, "state/seen.json"),
  runLog: path.join(here, "state/runs.jsonl"), notesFile: path.join(root, "data/ai-notes.json"), postsDir: path.join(root, "posts"),
};
const meter = makeMeter({ stateDir: path.join(here, "state"), today, cap: cfg.dailyCallCap });

let client = null;
if (!dryRun) {
  if (!process.env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY is not set. Put it in pipeline/.env (see .env.example) or run with --dry-run."); process.exit(2); }
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  client = new Anthropic();
}

// Names already on the live sheet, so we never re-add them (fails soft if offline).
async function sheetKeys() {
  const keys = new Set();
  try {
    const res = await fetch(cfg.sheetCsvUrl); if (!res.ok) throw new Error(res.status);
    const rows = parseCsv(await res.text());
    const h = rows[0].map(x => x.trim());
    const iN = h.indexOf("Tournament Name"), iS = h.indexOf("Start Date");
    for (const r of rows.slice(1)) {
      const m = /^(\d{1,2})-(\w{3})-(\d{4})$/.exec(r[iS] || "");
      const mon = m ? ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(m[2].toLowerCase()) + 1 : 0;
      keys.add(`${slug(r[iN])}|${m && mon ? `${m[3]}-${String(mon).padStart(2,"0")}-${m[1].padStart(2,"0")}` : ""}`);
    }
  } catch (e) { console.warn(`(could not read the live sheet for de-duplication: ${e.message})`); }
  return keys;
}
function parseCsv(t) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i+1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; } else if (c !== "\r") f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}

if (args[0] === "approve") {
  if (!args[1]) { console.error("Usage: node run.mjs approve hold/<file>.json"); process.exit(2); }
  await approveHeld({ holdFile: path.resolve(args[1]), client, cfg, paths, meter, today });
} else {
  const s = await runPipeline({ client, cfg, paths, meter, today, dryRun, knownKeys: dryRun ? new Set() : await sheetKeys() });
  console.log(JSON.stringify(s));
  console.log(`API calls this run: ${meter.run.calls} | tokens: ${JSON.stringify(meter.run.tokens)}`);
}
