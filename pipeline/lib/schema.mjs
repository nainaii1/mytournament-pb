// Hand-rolled validation: no extra dependency, and the errors are fed back to Claude on retry.
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const STR_OR_NULL = ["name", "venue", "state", "url"];
const DATE_KEYS = ["start_date", "end_date", "reg_open", "reg_close"];
export const REQUIRED_FOR_AUTO = ["name", "start_date", "state"];

export function validateExtraction(o) {
  const errors = [];
  if (!o || typeof o !== "object" || Array.isArray(o)) return { ok: false, errors: ["not a JSON object"] };
  for (const k of STR_OR_NULL) {
    if (!(k in o)) errors.push(`missing key: ${k}`);
    else if (o[k] !== null && typeof o[k] !== "string") errors.push(`${k} must be string or null`);
  }
  for (const k of DATE_KEYS) {
    if (!(k in o)) errors.push(`missing key: ${k}`);
    else if (o[k] !== null && !(typeof o[k] === "string" && ISO.test(o[k]))) errors.push(`${k} must be YYYY-MM-DD or null`);
  }
  if (!("fee_myr" in o)) errors.push("missing key: fee_myr");
  else if (o.fee_myr !== null && !(typeof o.fee_myr === "number" && o.fee_myr >= 0)) errors.push("fee_myr must be a number >= 0 or null");
  if (!Array.isArray(o.categories) || o.categories.some(c => typeof c !== "string")) errors.push("categories must be an array of strings");
  if (!Array.isArray(o.missing_fields) || o.missing_fields.some(c => typeof c !== "string")) errors.push("missing_fields must be an array of strings");
  if (typeof o.confidence !== "number" || o.confidence < 0 || o.confidence > 1) errors.push("confidence must be a number between 0 and 1");
  return errors.length ? { ok: false, errors } : { ok: true, errors: [] };
}

// The editorial note may only use numbers that appear in the extracted facts.
export function validateNote(o, facts) {
  const errors = [];
  if (!o || typeof o.note !== "string") return { ok: false, errors: ['expected {"note": "..."}'] };
  const note = o.note.trim();
  if (note.length < 20 || note.length > 300) errors.push("note must be 20-300 characters");
  const norm = s => s.replace(/,/g, "");
  const haystack = norm(JSON.stringify(facts));
  for (const tok of norm(note).match(/\d+(?:\.\d+)?/g) || []) {
    if (!haystack.includes(tok)) errors.push(`number "${tok}" is not in the facts`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, errors: [] };
}

export function parseJsonObject(text) {
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("no JSON object in reply");
  return JSON.parse(text.slice(a, b + 1));
}
