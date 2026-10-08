import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { jsonCall, CapReachedError } from "./claude.mjs";
import { validateExtraction, validateNote, REQUIRED_FOR_AUTO } from "./schema.mjs";

const EXTRACT_SYSTEM = `You extract structured data from one Malaysian pickleball tournament listing.
Reply with ONLY one JSON object, no prose, with exactly these keys:
name (string|null), venue (string|null), state (string|null), start_date, end_date, reg_open, reg_close (each "YYYY-MM-DD" or null),
categories (array of category strings exactly as the listing states them), fee_myr (number in MYR or null),
url (string|null), confidence (0 to 1: how sure you are every non-null value is stated in the text), missing_fields (array of key names that are null).
Rules: use null for anything not clearly stated, never guess or infer. If the year is not stated, use null for that date.
fee_myr only if the fee is in MYR/RM; otherwise null. state is the Malaysian state; use "Klang Valley" for Kuala Lumpur or Selangor.`;

const EDITORIAL_SYSTEM = `You write a short note (1-2 sentences, at most 280 characters) about one pickleball tournament for Malaysian players.
Use ONLY the facts in the JSON you are given. Do not add any detail, number, price, prize or quality judgement that is not in the facts.
Plain, friendly tone. No hype words like "premier" or "ultimate", no rankings, no promises.
Reply with ONLY a JSON object: {"note": "..."}`;

const sha = s => crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
export const slug = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const dedupeKey = r => `${slug(r.name)}|${r.start_date || ""}`;

const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const toSheetDate = iso => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}-${MON[m - 1]}-${y}`;
};
const csvCell = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
const CSV_HEADER = ["Status","ID","Tournament Name","Organizer","Title Sponsor","Start Date","End Date","Reg Deadline","State","Venue","Entry Fee (RM) per team","Prize Pool (RM)","Cash Prize (RM)","Merch Value (RM)","Prize Pool Note","Skill Level","Event Type","Age Group","Pick Priority","Editorial Angle","Format Note","Player Note","Source Platform","Registration URL","Date Added","Last Checked","Notes"];

export function csvRow(r, note, today) {
  const c = Object.fromEntries(CSV_HEADER.map(h => [h, ""]));
  Object.assign(c, {
    Status: "Draft", "Tournament Name": r.name, "Start Date": toSheetDate(r.start_date), "End Date": toSheetDate(r.end_date),
    "Reg Deadline": toSheetDate(r.reg_close), State: r.state, Venue: r.venue, "Entry Fee (RM) per team": r.fee_myr ?? "",
    "Skill Level": r.categories.join(", "), "Editorial Angle": note, "Registration URL": r.url, "Date Added": toSheetDate(today),
    Notes: `AI-extracted (confidence ${r.confidence}); missing: ${r.missing_fields.join(", ") || "none"}. Verify against source before setting Status to Verified.`,
  });
  return CSV_HEADER.map(h => csvCell(c[h])).join(",");
}

function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJson(file, obj) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n"); }

// Editorial note + outputs for one accepted record.
async function finalize({ record, client, meter, cfg, paths, today, csvLines }) {
  const note = (await jsonCall({
    client, meter, model: cfg.editorialModel, system: EDITORIAL_SYSTEM,
    user: `Facts:\n${JSON.stringify(record)}`, validate: o => validateNote(o, record), maxTokens: 2000,
  })).note.trim();
  const notes = readJson(paths.notesFile, { updated: null, notes: [] });
  const key = dedupeKey(record);
  notes.notes = notes.notes.filter(n => n.key !== key);
  notes.notes.push({ key, name: record.name, state: record.state, start_date: record.start_date, url: record.url, note, drafted_by: cfg.editorialModel, date: today });
  notes.updated = today;
  writeJson(paths.notesFile, notes);
  csvLines.push(csvRow(record, note, today));
}

export async function runPipeline({ client, cfg, paths, meter, today, dryRun = false, knownKeys = new Set(), log = console.log }) {
  const summary = { processed: 0, accepted: 0, held: 0, duplicates: 0, failed: 0, capReached: false, wouldProcess: [] };
  fs.mkdirSync(paths.inboxDir, { recursive: true });
  const seen = readJson(paths.seenFile, { hashes: {}, keys: {} });
  const files = fs.readdirSync(paths.inboxDir).filter(f => f.endsWith(".txt")).sort();
  const csvLines = [];

  for (const f of files) {
    const text = fs.readFileSync(path.join(paths.inboxDir, f), "utf8");
    const h = sha(text);
    if (seen.hashes[h]) { summary.duplicates++; log(`skip ${f}: same text already processed`); continue; }
    if (dryRun) { summary.wouldProcess.push(f); log(`[dry-run] would extract ${f} with ${cfg.extractModel} (${meter.remaining()} calls left today)`); continue; }
    try {
      const record = await jsonCall({ client, meter, model: cfg.extractModel, system: EXTRACT_SYSTEM, user: `Listing text:\n"""\n${text}\n"""`, validate: validateExtraction });
      summary.processed++;
      const key = dedupeKey(record);
      if (record.name && (seen.keys[key] || knownKeys.has(key))) { summary.duplicates++; seen.hashes[h] = f; log(`skip ${f}: ${record.name} already known`); continue; }
      const weak = record.confidence < cfg.minConfidence || REQUIRED_FOR_AUTO.some(k => !record[k]);
      if (weak) {
        writeJson(path.join(paths.holdDir, `${h}.json`), { source_file: f, reason: record.confidence < cfg.minConfidence ? "low confidence" : "required field missing", record });
        seen.hashes[h] = f; summary.held++; log(`HOLD ${f}: needs your approval (${path.join(paths.holdDir, h + ".json")})`);
        continue;
      }
      await finalize({ record, client, meter, cfg, paths, today, csvLines });
      seen.hashes[h] = f; seen.keys[key] = f; summary.accepted++; log(`ok   ${f}: ${record.name}`);
    } catch (e) {
      if (e instanceof CapReachedError) { summary.capReached = true; log(`STOP: ${e.message}. Remaining files wait for tomorrow.`); break; }
      summary.failed++; log(`FAIL ${f}: ${e.message}`);
    }
  }
  finish({ csvLines, paths, today, seen, meter, summary, dryRun });
  return summary;
}

// You review a held record, then approve it: it skips the confidence check but still gets an editorial note.
export async function approveHeld({ holdFile, client, cfg, paths, meter, today, log = console.log }) {
  const held = readJson(holdFile, null);
  if (!held) throw new Error(`cannot read ${holdFile}`);
  const csvLines = [];
  await finalize({ record: held.record, client, meter, cfg, paths, today, csvLines });
  const seen = readJson(paths.seenFile, { hashes: {}, keys: {} });
  seen.keys[dedupeKey(held.record)] = held.source_file;
  fs.rmSync(holdFile);
  finish({ csvLines, paths, today, seen, meter, summary: { approved: 1 }, dryRun: false });
  log(`approved ${held.record.name}`);
}

function finish({ csvLines, paths, today, seen, meter, summary, dryRun }) {
  if (dryRun) return;
  if (csvLines.length) {
    const out = path.join(paths.postsDir, `new-tournaments-${today}.csv`);
    fs.mkdirSync(paths.postsDir, { recursive: true });
    const exists = fs.existsSync(out);
    fs.appendFileSync(out, (exists ? "" : CSV_HEADER.map(csvCell).join(",") + "\n") + csvLines.join("\n") + "\n");
  }
  writeJson(paths.seenFile, seen);
  meter.save();
  fs.mkdirSync(path.dirname(paths.runLog), { recursive: true });
  fs.appendFileSync(paths.runLog, JSON.stringify({ date: today, summary, calls: meter.run.calls, tokens: meter.run.tokens }) + "\n");
}
