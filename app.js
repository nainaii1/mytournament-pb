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

// ── Date & badge helpers ──────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Returns {month: "MAY", day: "22–24"} for display in the date block.
function formatDateBlock(startStr, endStr) {
  if (!startStr || !DATE_RE.test(startStr)) return { month: "", day: "TBD" };
  const parts = startStr.split("-").map(Number);
  const sy = parts[0], sm = parts[1], sd = parts[2];
  const month = MONTHS[sm - 1].toUpperCase();
  if (!endStr || !DATE_RE.test(endStr) || endStr === startStr) {
    return { month, day: String(sd) };
  }
  const eParts = endStr.split("-").map(Number);
  const em = eParts[1], ed = eParts[2];
  if (sm !== em) return { month, day: String(sd) }; // cross-month: show start day only
  return { month, day: `${sd}–${ed}` };
}

// Returns "May 17" from "2026-05-17".
function formatShortDate(s) {
  if (!s || !DATE_RE.test(s)) return s;
  const parts = s.split("-").map(Number);
  return `${MONTHS[parts[1] - 1]} ${parts[2]}`;
}

// Returns {cls: "soon"|"open"|"closed", text: "..."} for the reg deadline badge.
function regBadgeInfo(t, todayStr) {
  const raw = (t["Reg Deadline"] || "").trim();
  const lower = raw.toLowerCase();

  if (t.isClosed) {
    if (lower === "once full") return { cls: "closed", text: "Reg closed · Closes once full" };
    const startDays = daysUntil(t["Start Date"] || "", todayStr);
    const endDays   = daysUntil(t["End Date"]   || "", todayStr);
    if (startDays !== null && startDays > 0) {
      return { cls: "closed", text: `Reg closed · Tournament starts in ${startDays} day${startDays === 1 ? "" : "s"}` };
    }
    if (endDays !== null && endDays >= 0) {
      return { cls: "closed", text: "Reg closed · Happening now" };
    }
    return { cls: "closed", text: "Reg closed" };
  }

  const days = daysUntil(raw, todayStr);
  if (days !== null && days <= 7) {
    if (days === 0) return { cls: "soon", text: `⚡ Closes today · ${formatShortDate(raw)}` };
    if (days === 1) return { cls: "soon", text: `⚡ Closes tomorrow · ${formatShortDate(raw)}` };
    return { cls: "soon", text: `⚡ Closes ${formatShortDate(raw)} · ${days} days left` };
  }
  if (days !== null) {
    return { cls: "open", text: `Closes ${formatShortDate(raw)} · ${days} days left` };
  }
  return { cls: "open", text: raw || "Open" };
}

// ── Bucketing & sort ──────────────────────────────────────────────────────

function parseMoney(s) {
  return parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
}

// Returns a new sorted array. mode: "deadline" | "date" | "prize"
function sortTournaments(tournaments, mode) {
  const arr = [...tournaments];
  if (mode === "deadline") {
    arr.sort((a, b) => {
      const ad = a["Reg Deadline"] || "", bd = b["Reg Deadline"] || "";
      const aOk = DATE_RE.test(ad), bOk = DATE_RE.test(bd);
      if (!aOk && !bOk) return 0;
      if (!aOk) return 1;
      if (!bOk) return -1;
      return ad < bd ? -1 : ad > bd ? 1 : 0;
    });
  } else if (mode === "date") {
    arr.sort((a, b) => {
      const ad = a["Start Date"] || "", bd = b["Start Date"] || "";
      if (!ad && !bd) return 0;
      if (!ad) return 1;
      if (!bd) return -1;
      return ad < bd ? -1 : ad > bd ? 1 : 0;
    });
  } else if (mode === "prize") {
    arr.sort((a, b) => parseMoney(b["Prize Pool (RM)"]) - parseMoney(a["Prize Pool (RM)"]));
  }
  return arr;
}

// Splits tournaments into three display sections. Hides past-end-date entries.
function bucketTournaments(tournaments, todayStr) {
  const closingSoon = [], comingUp = [], regClosed = [];
  for (const t of tournaments) {
    const endDate = t["End Date"] || "";
    if (endDate && DATE_RE.test(endDate) && isPastDate(endDate, todayStr)) continue;
    if (t.isClosed) {
      regClosed.push(t);
    } else if (t.isClosingSoon) {
      closingSoon.push(t);
    } else {
      comingUp.push(t);
    }
  }
  return { closingSoon, comingUp, regClosed };
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
