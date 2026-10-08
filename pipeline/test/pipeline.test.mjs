import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig } from "../lib/config.mjs";
import { makeMeter } from "../lib/claude.mjs";
import { validateExtraction, validateNote } from "../lib/schema.mjs";
import { runPipeline, toSheetDate } from "../lib/process.mjs";

const fx = n => fs.readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8");
const cfg = loadConfig({});
const today = "2026-10-09";

const good = {
  name: "SUNRISE PICKLE OPEN 2026", venue: "Example Pickle Hall, Petaling Jaya", state: "Klang Valley",
  start_date: "2026-03-14", end_date: "2026-03-15", reg_open: null, reg_close: "2026-03-01",
  categories: ["Men's Doubles <3.5", "Mixed Doubles <3.5"], fee_myr: 180, url: "https://example.com/sunrise-pickle-open",
  confidence: 0.95, missing_fields: ["reg_open"],
};
const reply = obj => ({ content: [{ type: "text", text: typeof obj === "string" ? obj : JSON.stringify(obj) }], usage: { input_tokens: 100, output_tokens: 50 } });

// Mock client: replies come from a queue; every call is recorded.
function mock(replies) {
  const calls = [];
  return { calls, messages: { create: async args => { calls.push(args); const r = replies.shift(); if (!r) throw new Error("mock queue empty"); return r; } } };
}
function setup(files, cap = 40) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pb-"));
  const paths = { inboxDir: path.join(dir, "inbox"), holdDir: path.join(dir, "hold"), seenFile: path.join(dir, "state/seen.json"),
    runLog: path.join(dir, "state/runs.jsonl"), notesFile: path.join(dir, "data/ai-notes.json"), postsDir: path.join(dir, "posts") };
  fs.mkdirSync(paths.inboxDir, { recursive: true });
  for (const [n, t] of Object.entries(files)) fs.writeFileSync(path.join(paths.inboxDir, n), t);
  return { paths, meter: makeMeter({ stateDir: path.join(dir, "state"), today, cap }) };
}
const run = (o) => runPipeline({ cfg, today, log: () => {}, ...o });

test("schema accepts a good extraction and rejects bad ones", () => {
  assert.equal(validateExtraction(good).ok, true);
  assert.equal(validateExtraction({ ...good, start_date: "14 Mar 2026" }).ok, false);
  assert.equal(validateExtraction({ ...good, confidence: 2 }).ok, false);
  assert.equal(validateExtraction("nope").ok, false);
});

test("editorial note may not contain numbers missing from the facts", () => {
  assert.equal(validateNote({ note: "Two doubles brackets at RM180 per team in Petaling Jaya." }, good).ok, true);
  assert.equal(validateNote({ note: "A big RM5000 prize pool awaits the winners here." }, good).ok, false);
});

test("clear fixture: extract + editorial, writes notes and CSV, uses configured models", async () => {
  const { paths, meter } = setup({ "a.txt": fx("fixture-1-clear.txt") });
  const client = mock([reply(good), reply({ note: "Men's and mixed doubles brackets in Petaling Jaya, RM180 per team." })]);
  const s = await run({ client, paths, meter });
  assert.equal(s.accepted, 1);
  assert.equal(client.calls[0].model, "claude-haiku-5-5");
  assert.equal(client.calls[1].model, "claude-sonnet-5-5");
  const notes = JSON.parse(fs.readFileSync(paths.notesFile, "utf8"));
  assert.equal(notes.notes.length, 1);
  const csv = fs.readFileSync(path.join(paths.postsDir, `new-tournaments-${today}.csv`), "utf8");
  assert.match(csv, /14-Mar-2026/);
  assert.match(csv, /"Draft"/);
  assert.equal(meter.run.tokens["claude-haiku-5-5"].input, 100);
  assert.equal(fs.readFileSync(paths.runLog, "utf8").trim().split("\n").length, 1);
});

test("messy fixture: bad JSON triggers exactly one retry, then succeeds", async () => {
  const { paths, meter } = setup({ "b.txt": fx("fixture-2-messy.txt") });
  const messy = { ...good, name: "BAYVIEW SMASH CHALLENGE", state: "Penang", start_date: "2026-06-20", end_date: "2026-06-20", reg_close: "2026-06-10", fee_myr: 120, categories: ["Women's doubles open"], url: "https://example.com/bayview" };
  const client = mock([reply("Sure! here it is"), reply(messy), reply({ note: "A one-day event in Penang, RM120 per team, on 20 June." })]);
  const s = await run({ client, paths, meter });
  assert.equal(s.accepted, 1);
  assert.equal(client.calls.length, 3);
  assert.match(client.calls[1].messages[0].content, /rejected/);
});

test("two bad replies in a row: record fails, no third attempt", async () => {
  const { paths, meter } = setup({ "b.txt": "x" });
  const client = mock([reply("nope"), reply("still nope")]);
  const s = await run({ client, paths, meter });
  assert.equal(s.failed, 1);
  assert.equal(client.calls.length, 2);
});

test("vague fixture: low confidence goes on hold, no editorial call", async () => {
  const { paths, meter } = setup({ "c.txt": fx("fixture-3-vague.txt") });
  const vague = { name: null, venue: null, state: "Johor", start_date: null, end_date: null, reg_open: null, reg_close: null, categories: [], fee_myr: null, url: null, confidence: 0.2, missing_fields: ["name", "venue", "start_date"] };
  const client = mock([reply(vague)]);
  const s = await run({ client, paths, meter });
  assert.equal(s.held, 1);
  assert.equal(client.calls.length, 1);
  assert.equal(fs.readdirSync(paths.holdDir).length, 1);
  assert.equal(fs.existsSync(paths.notesFile), false);
});

test("dedupe: same text twice, and same event already on the sheet", async () => {
  const { paths, meter } = setup({ "a.txt": "same", "b.txt": "same" });
  const c1 = mock([reply(good), reply({ note: "Men's and mixed doubles in Petaling Jaya, RM180 per team." })]);
  const s1 = await run({ client: c1, paths, meter });
  assert.equal(s1.accepted, 1); assert.equal(s1.duplicates, 1);
  const { paths: p2, meter: m2 } = setup({ "z.txt": "other text" });
  const c2 = mock([reply(good)]);
  const s2 = await run({ client: c2, paths: p2, meter: m2, knownKeys: new Set(["sunrise pickle open 2026|2026-03-14"]) });
  assert.equal(s2.duplicates, 1); assert.equal(c2.calls.length, 1);
});

test("daily cap stops the run and leaves later files for tomorrow", async () => {
  const { paths, meter } = setup({ "a.txt": "one", "b.txt": "two" }, 2);
  const client = mock([reply(good), reply({ note: "Men's and mixed doubles in Petaling Jaya, RM180 per team." }), reply(good)]);
  const s = await run({ client, paths, meter });
  assert.equal(s.capReached, true);
  assert.equal(client.calls.length, 2);
});

test("dry run makes zero API calls and writes nothing", async () => {
  const { paths, meter } = setup({ "a.txt": "one" });
  const client = mock([]);
  const s = await run({ client, paths, meter, dryRun: true });
  assert.equal(client.calls.length, 0);
  assert.deepEqual(s.wouldProcess, ["a.txt"]);
  assert.equal(fs.existsSync(paths.seenFile), false);
});

test("date helper matches the sheet's DD-Mon-YYYY format", () => assert.equal(toSheetDate("2026-07-01"), "1-Jul-2026"));
