const SHEET_ID = "1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg";
const SHEET_NAME = "Tournaments";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Skill level parser ────────────────────────────────────────────────────
const BUCKET_NOVICE = "Novice <3";
const BUCKET_INTER  = "Intermediate <3.5";
const BUCKET_ADV    = "Advanced <4.0";
const BUCKET_OPEN   = "Open";
const BUCKET_ALL    = "ALL";

function numToBucket(n) {
  if (n < 3.0) return BUCKET_NOVICE;
  if (n < 3.5) return BUCKET_INTER;
  if (n < 4.0) return BUCKET_ADV;
  return BUCKET_OPEN;
}

// Returns [{bucket, combinedCap?}] — combinedCap is the original combined number string.
function parseSkillLevel(raw) {
  if (!raw || !raw.trim()) return [];
  const seen = new Set();
  const result = [];
  const fragments = raw.split(",").map(f => f.trim()).filter(Boolean);
  for (const f of fragments) {
    let bucket, combinedCap;
    if (/all/i.test(f)) {
      bucket = BUCKET_ALL;
    } else if (/open/i.test(f)) {
      bucket = BUCKET_OPEN;
    } else if (/intermediate/i.test(f) || /<3\.5/i.test(f)) {
      bucket = BUCKET_INTER;
    } else if (/novice/i.test(f) || /<3(?!\.)/i.test(f) || /<3\.0/i.test(f)) {
      bucket = BUCKET_NOVICE;
    } else if (/advanced/i.test(f) || /<4(\.0)?/i.test(f)) {
      bucket = BUCKET_ADV;
    } else {
      const numMatch = f.match(/(\d+(?:\.\d+)?)/);
      if (!numMatch) continue;
      const numStr = numMatch[1];
      const n = parseFloat(numStr);
      if (n > 4.5) {
        combinedCap = numStr;
        bucket = numToBucket(n / 2);
      } else {
        bucket = numToBucket(n);
      }
    }
    if (!seen.has(bucket)) {
      seen.add(bucket);
      result.push(combinedCap !== undefined ? { bucket, combinedCap } : { bucket });
    }
  }
  return result;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip, \n handles row break */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function rowsToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  // Sheet row 0 has the title text concatenated into the first cell, ending in "Status".
  if (headers[0] && headers[0] !== "Status" && headers[0].endsWith("Status")) {
    headers[0] = "Status";
  }
  return rows.slice(1).map(r => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = (r[i] ?? "").trim();
    }
    return obj;
  });
}

function todayUTCString() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isPastDate(s, todayStr) {
  if (!s || !DATE_RE.test(s)) return false;
  return s < todayStr;
}

function daysUntil(s, todayStr) {
  if (!s || !DATE_RE.test(s)) return null;
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const [sy, sm, sd] = s.split("-").map(Number);
  const tMs = Date.UTC(ty, tm - 1, td);
  const sMs = Date.UTC(sy, sm - 1, sd);
  return Math.round((sMs - tMs) / 86400000);
}

function annotate(t, todayStr) {
  const raw = (t["Reg Deadline"] || "").trim();
  const lower = raw.toLowerCase();
  const isClosedString = lower === "closed" || lower === "once full";
  const isClosed = isClosedString || isPastDate(raw, todayStr);
  const days = daysUntil(raw, todayStr);
  const isClosingSoon = !isClosed && days !== null && days >= 0 && days <= 7;
  return { ...t, isClosed, isClosingSoon };
}

async function fetchTournaments() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  const rows = parseCSV(text);
  const objects = rowsToObjects(rows);
  const filtered = objects.filter(t => t.Status === "Verified" || t.Status === "Published");
  filtered.sort((a, b) => {
    const aD = a["Start Date"] || "";
    const bD = b["Start Date"] || "";
    if (!aD && !bD) return 0;
    if (!aD) return 1;
    if (!bD) return -1;
    return aD < bD ? -1 : aD > bD ? 1 : 0;
  });
  const todayStr = todayUTCString();
  return filtered.map(t => annotate(t, todayStr));
}

fetchTournaments()
  .then(rows => console.log(`Loaded ${rows.length} tournaments`, rows))
  .catch(err => console.error("fetchTournaments failed:", err));
