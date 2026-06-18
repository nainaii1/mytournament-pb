const SHEET_ID = "1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg";
const SHEET_NAME = "Tournaments";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

// Partner matching board — reads a separate public "Partners" tab (same spreadsheet).
// Private contact is NEVER imported into this tab (see plan: two-file QUERY/IMPORTRANGE bridge).
const PARTNERS_SHEET_NAME = "Partners";
const PARTNERS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PARTNERS_SHEET_NAME)}`;
// TODO(founder): replace with the real Google Form share link once created.
const PARTNERS_FORM_URL = "https://forms.gle/REPLACE_WITH_YOUR_FORM";
const PARTNER_GENERAL_TTL_DAYS = 30; // general listings auto-hide after this many days

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Normalises "23-May-2026" or "2-May-2026" → "2026-05-23". Passes through
// already-correct YYYY-MM-DD strings unchanged.
const MONTH_MAP = {
  jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
  jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12"
};
function normalizeDate(s) {
  if (!s) return s;
  s = s.trim();
  if (DATE_RE.test(s)) return s;
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3,})-(\d{4})$/);
  if (m) {
    const mon = MONTH_MAP[m[2].slice(0,3).toLowerCase()];
    if (mon) return `${m[3]}-${mon}-${m[1].padStart(2,"0")}`;
  }
  return s; // unknown format — return as-is so text values ("Closed") pass through
}

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

// Splits tournaments into display sections. Hides past-end-date entries.
function bucketTournaments(tournaments, todayStr) {
  const closingSoon = [], comingUp = [];
  for (const t of tournaments) {
    const endDate = t["End Date"] || "";
    if (endDate && DATE_RE.test(endDate) && isPastDate(endDate, todayStr)) continue;
    if (t.isClosingSoon) { closingSoon.push(t); continue; }
    comingUp.push(t); // includes open-reg, closed-reg, and live tournaments
  }
  return { closingSoon, comingUp };
}

// ── Render helpers ────────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function bucketToCls(bucket) {
  if (bucket === BUCKET_NOVICE) return "novice";
  if (bucket === BUCKET_INTER)  return "intermediate";
  if (bucket === BUCKET_ADV)    return "advanced";
  return "open";
}

function bucketToLabel(bucket) {
  return bucket === BUCKET_ALL ? "Open" : bucket;
}

function renderEventPills(raw) {
  if (!raw || !raw.trim()) return "";
  if (/^all/i.test(raw.trim())) {
    const rest = raw.trim().replace(/^all\s*[·\-,]?\s*/i, "").trim();
    const label = rest ? `ALL · ${rest.toUpperCase()}` : "ALL";
    return `<div class="events"><span class="event-pill all">${escapeHtml(label)}</span></div>`;
  }
  const types = raw.split(/[,\/]/).map(t => t.trim().toUpperCase()).filter(Boolean);
  if (!types.length) return "";
  return `<div class="events">${types.map(t => `<span class="event-pill">${escapeHtml(t)}</span>`).join("")}</div>`;
}

function renderAgePills(raw) {
  if (!raw || !raw.trim()) return "";
  const groups = raw.split(",").map(s => s.trim()).filter(Boolean);
  if (!groups.length) return "";
  return `<div class="age-groups">${groups.map(g => `<span class="age-pill">${escapeHtml(g)}</span>`).join("")}</div>`;
}

function renderSkillChips(raw) {
  const brackets = parseSkillLevel(raw);
  if (!brackets.length) return "";
  const chips = brackets.map(s => {
    const cls   = bucketToCls(s.bucket);
    const label = bucketToLabel(s.bucket);
    const sub   = s.combinedCap
      ? `<div class="skill-combined">(combined ${escapeHtml(s.combinedCap)})</div>`
      : "";
    return `<div class="skill-entry"><span class="skill ${cls}">${escapeHtml(label)}</span>${sub}</div>`;
  }).join("");
  return `<div class="skill-stack">${chips}</div>`;
}

// Prefix a money value with "RM" when it's numeric and not already prefixed.
// Leaves "—", "Free", "Charity", etc. untouched.
function withRM(val) {
  const s = (val == null ? "" : String(val)).trim();
  if (!s || s === "—") return "—";
  if (/rm/i.test(s)) return s;   // already has RM
  if (!/\d/.test(s)) return s;   // non-numeric label
  return "RM" + s;
}

function renderCard(t, todayStr) {
  const { month, day } = formatDateBlock(t["Start Date"], t["End Date"]);
  const badge    = regBadgeInfo(t, todayStr);
  const isClosed = t.isClosed;
  const id       = escapeAttr(t["ID"] || "");

  const orgParts = [t["Venue"], t["State"]].filter(Boolean);
  const orgLine  = orgParts.map(escapeHtml).join(" · ");

  const regURL      = escapeAttr(t["Registration URL"] || "#");
  const platform    = (t["Source Platform"] || "").trim();
  const platformKey = platform.toLowerCase().replace(/\s+/g, "-");
  const isPick      = (t["Pick Priority"] || "").startsWith("1");
  const btnLabel    = platform ? `Register · ${escapeHtml(platform)} →` : `Register →`;
  const dotHTML = platformKey
    ? `<span class="platform-dot" data-platform="${escapeAttr(platformKey)}"></span>`
    : "";
  const hasURL  = regURL && regURL !== "#" && regURL !== "undefined";
  const btnHTML = isClosed
    ? (hasURL
        ? `<a class="btn-register closed-link" href="${regURL}" target="_blank" rel="noopener">${dotHTML}Reg closed · ${escapeHtml(platform || "View")} →</a>`
        : `<button class="btn-register closed" disabled>Reg closed</button>`)
    : `<a class="btn-register" href="${regURL}" target="_blank" rel="noopener">${dotHTML}${btnLabel}</a>`;

  const cardClasses = ["card",
    isClosed ? "closed-reg" : "",
    isPick   ? "pick"       : ""
  ].filter(Boolean).join(" ");

  return `
<div class="${cardClasses}" id="${id}" data-platform="${escapeAttr(platformKey)}">
  <div class="date-block${isClosed ? " grey" : ""}">
    <div class="date-month${isClosed ? " muted" : ""}">${month}</div>
    <div class="date-day${isClosed ? " muted" : ""}">${day}</div>
  </div>
  <div class="card-body">
    <div class="card-name">${escapeHtml(t["Tournament Name"] || "")}</div>
    <div class="card-org">${orgLine}</div>
    <span class="reg-badge ${badge.cls}">${badge.text}</span>
    <div class="meta-row">
      <div class="pairs">
        <div class="pair"><div class="k">Entry</div><div class="v">${escapeHtml(withRM(t["Entry Fee (RM)"]))}</div></div>
        <div class="pair"><div class="k">Prize</div><div class="v">${escapeHtml(withRM(t["Prize Pool (RM)"]))}</div></div>
      </div>
      ${renderSkillChips(t["Skill Level"] || "")}
    </div>
    ${renderEventPills(t["Event Type"] || "")}
    ${renderAgePills(t["Age Group"] || "")}
    <div class="card-actions">
      ${btnHTML}
      <button class="btn-share" aria-label="Share ${escapeAttr(t["Tournament Name"] || "")}" data-id="${id}">⤴ Share</button>
    </div>
  </div>
</div>`.trim();
}

function renderSection(anchorId, titleHTML, titleCls, dividerCls, cards, todayStr, addGap, sectionKey) {
  const count       = cards.length;
  const gap         = addGap ? " gap" : "";
  const anchor      = anchorId ? ` id="${anchorId}"` : "";
  const isCollapsed = sectionCollapsed[sectionKey] || false;
  const chevronCls  = isCollapsed ? " collapsed" : "";
  const cardsHTML   = cards.map(t => renderCard(t, todayStr)).join("\n");
  return `
<div class="section-head${gap}"${anchor}>
  <div class="section-title${titleCls ? ` ${titleCls}` : ""}">${titleHTML}</div>
  <button class="section-toggle-btn" data-section="${sectionKey}" aria-expanded="${!isCollapsed}">
    <span class="section-count">${count} event${count !== 1 ? "s" : ""}</span>
    <span class="section-chevron${chevronCls}">▾</span>
  </button>
</div>
<div class="section-divider-bar${dividerCls ? ` ${dividerCls}` : ""}"></div>
<div class="cards-wrap" id="cards-wrap-${sectionKey}"${isCollapsed ? " hidden" : ""}>
${cardsHTML}
</div>`.trim();
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

const DATE_FIELDS = new Set(["Start Date", "End Date", "Reg Deadline"]);

// Maps actual sheet header names → canonical names used throughout the app.
// Add entries here whenever the sheet renames a column.
const HEADER_ALIASES = {
  "Entry Fee (RM) per team": "Entry Fee (RM)",
  "Merch Value (RM)":        "Merch (RM)",
};

function rowsToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => {
    const trimmed = h.trim();
    return HEADER_ALIASES[trimmed] ?? trimmed;
  });
  // Sheet row 0 has the title text concatenated into the first cell, ending in "Status".
  if (headers[0] && headers[0] !== "Status" && headers[0].endsWith("Status")) {
    headers[0] = "Status";
  }
  return rows.slice(1).map(r => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      const val = (r[i] ?? "").trim();
      obj[key] = DATE_FIELDS.has(key) ? normalizeDate(val) : val;
    }
    return obj;
  });
}

function todayUTCString() {
  // Use MYT (UTC+8) — all tournaments are in Malaysia
  const myt = new Date(Date.now() + 8 * 3600 * 1000);
  return myt.toISOString().slice(0, 10);
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
  const sStr = (t["Start Date"] || "").trim();
  const eStr = (t["End Date"]   || "").trim();
  // Auto-infer closed: once a tournament has started, registration is always closed
  const tournamentStarted = DATE_RE.test(sStr) && todayStr >= sStr;
  const isClosed = isClosedString || isPastDate(raw, todayStr) || tournamentStarted;
  const days = daysUntil(raw, todayStr);
  const isClosingSoon = !isClosed && days !== null && days >= 0 && days <= 7;
  const isLive = DATE_RE.test(sStr) && DATE_RE.test(eStr)
    && todayStr >= sStr && todayStr <= eStr;
  return { ...t, isClosed, isClosingSoon, isLive };
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

// ── State ─────────────────────────────────────────────────────────────────
let allTournaments = [];
let sortMode      = "date";
let skillFilters  = new Set(); // empty = show all; values: "novice"|"intermediate"|"advanced"|"open"
let monthFilter   = null;      // null = ALL; "YYYY-MM" string when active
let stateFilter   = null;      // null = ALL; state string (e.g. "Klang Valley") when active
let searchQuery   = "";        // empty = show all; lowercase string when active
const sectionCollapsed = { closing: false, coming: false, closed: false };
let calendarMode = false;
let aboutMode    = false;
let partnersMode = false;

// Partner board state
let allPartners       = [];
let partnerEventFilter = null;   // "mens" | "womens" | "mixed" | null
let partnerTypeFilter  = "all";  // "all" | "tournament" | "general"
let partnerDuprBand    = null;   // "lt3" | "3-3.5" | "3.5-4" | "4plus" | null
let yourDupr           = null;   // number when set

function matchesSkillFilter(t) {
  if (skillFilters.size === 0) return true;
  const raw = (t["Skill Level"] || "").trim();
  if (!raw) return true;
  const brackets = parseSkillLevel(raw);
  if (!brackets.length) return true; // Veteran etc. — no bucket = always show
  return brackets.some(s =>
    s.bucket === BUCKET_ALL || skillFilters.has(bucketToCls(s.bucket))
  );
}

function matchesMonthFilter(t) {
  if (!monthFilter) return true;
  const start = t["Start Date"] || "";
  if (!DATE_RE.test(start)) return true;
  return start.startsWith(monthFilter);
}

function matchesStateFilter(t) {
  if (!stateFilter) return true;
  return (t["State"] || "").trim() === stateFilter;
}

function matchesSearchFilter(t) {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return [
    t["Tournament Name"] || "",
    t["Venue"]           || "",
    t["State"]           || "",
    t["Skill Level"]     || "",
    t["Organizer"]       || "",
  ].some(f => f.toLowerCase().includes(q));
}

function buildMonthChips(tournaments) {
  const monthRow = document.getElementById("month-row");
  if (!monthRow) return;

  const seen = new Set();
  for (const t of tournaments) {
    const s = t["Start Date"] || "";
    if (DATE_RE.test(s)) seen.add(s.slice(0, 7));
  }
  const months = [...seen].sort();

  const LABELS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const label  = ym => LABELS[parseInt(ym.slice(5, 7), 10) - 1] || ym;

  monthRow.innerHTML =
    `<button class="month-tab on" data-month="ALL" aria-pressed="true">ALL</button>` +
    months.map(ym =>
      `<button class="month-tab" data-month="${ym}" aria-pressed="false">${label(ym)}</button>`
    ).join("");

  monthRow.querySelectorAll("button[data-month]").forEach(btn => {
    btn.addEventListener("click", () => {
      // Switching to list mode if currently in calendar
      if (calendarMode) {
        calendarMode = false;
        syncNavState();
      }

      monthFilter = btn.dataset.month === "ALL" ? null
                  : monthFilter === btn.dataset.month ? null
                  : btn.dataset.month;

      monthRow.querySelectorAll("[data-month]").forEach(b => {
        const active = b.dataset.month === "ALL"
          ? monthFilter === null
          : b.dataset.month === monthFilter;
        b.classList.toggle("on", active);
        b.setAttribute("aria-pressed", String(active));
      });
      renderAll();
    });
  });
}

function buildStateChips(tournaments) {
  const stateRow = document.getElementById("state-row");
  if (!stateRow) return;

  const seen = new Set();
  for (const t of tournaments) {
    const s = (t["State"] || "").trim();
    if (s) seen.add(s);
  }
  const PRIORITY_STATES = ['Klang Valley', 'Penang', 'Johor'];
  const LABEL_MAP = {};
  const all = [...seen];
  const states = [
    ...PRIORITY_STATES.filter(s => all.includes(s)),
    ...all.filter(s => !PRIORITY_STATES.includes(s)).sort()
  ];

  const locationSection = document.getElementById("location-section");
  if (states.length <= 1) {
    stateRow.hidden = true;
    if (locationSection) locationSection.hidden = true;
    return;
  }
  stateRow.hidden = false;
  if (locationSection) locationSection.hidden = false;
  stateRow.innerHTML =
    `<button class="month-tab on" data-state="ALL" aria-pressed="true">All</button>` +
    states.map(s => {
      const label = LABEL_MAP[s] || s;
      return `<button class="month-tab" data-state="${escapeAttr(s)}" aria-pressed="false">${escapeHtml(label)}</button>`;
    }).join("");

  stateRow.querySelectorAll("button[data-state]").forEach(btn => {
    btn.addEventListener("click", () => {
      stateFilter = btn.dataset.state === "ALL" ? null
                  : stateFilter === btn.dataset.state ? null
                  : btn.dataset.state;
      stateRow.querySelectorAll("[data-state]").forEach(b => {
        const active = b.dataset.state === "ALL"
          ? stateFilter === null
          : b.dataset.state === stateFilter;
        b.classList.toggle("on", active);
        b.setAttribute("aria-pressed", String(active));
      });
      renderAll();
    });
  });
}

// ── Nav state sync ────────────────────────────────────────────────────────
function syncNavState() {
  const navHome  = document.getElementById("nav-home");
  const navCal   = document.getElementById("nav-calendar");
  const navAbout = document.getElementById("nav-about");
  const navPart  = document.getElementById("nav-partners");
  if (navHome)  navHome.classList.toggle("on",  !calendarMode && !aboutMode && !partnersMode);
  if (navCal)   navCal.classList.toggle("on",   calendarMode);
  if (navAbout) navAbout.classList.toggle("on",  aboutMode);
  if (navPart)  navPart.classList.toggle("on",  partnersMode);
}

// ── Filter panel (drawer on mobile, sidebar on desktop) ───────────────────
function isDesktop() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function openFilterPanel() {
  if (isDesktop()) return;
  const panel   = document.getElementById("filter-panel");
  const overlay = document.getElementById("filter-overlay");
  if (!panel) return;
  panel.removeAttribute("hidden");
  panel.removeAttribute("aria-hidden");
  document.body.classList.add("filter-open");
  requestAnimationFrame(() => {
    panel.classList.add("open");
    if (overlay) overlay.classList.add("open");
  });
  document.getElementById("filter-btn")?.setAttribute("aria-expanded", "true");
}

function closeFilterPanel() {
  if (isDesktop()) return;
  const panel   = document.getElementById("filter-panel");
  const overlay = document.getElementById("filter-overlay");
  if (!panel) return;
  panel.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
  document.body.classList.remove("filter-open");
  document.getElementById("filter-btn")?.setAttribute("aria-expanded", "false");
  setTimeout(() => {
    panel.setAttribute("hidden", "");
    panel.setAttribute("aria-hidden", "true");
  }, 300);
}

// ── Filter badge count ────────────────────────────────────────────────────
function updateFilterBadge() {
  const total = skillFilters.size + (monthFilter ? 1 : 0) + (stateFilter ? 1 : 0);
  const badge = document.getElementById("filter-badge");
  const btn   = document.getElementById("filter-btn");
  if (badge) { badge.hidden = total === 0; badge.textContent = total; }
  if (btn)   btn.classList.toggle("filter-btn-active", total > 0);
}

// ── renderAll ─────────────────────────────────────────────────────────────
function renderAll() {
  const todayStr = todayUTCString();

  syncNavState();
  document.body.classList.toggle("calendar-mode", calendarMode);
  document.body.classList.toggle("about-mode",    aboutMode);
  document.body.classList.toggle("partners-mode", partnersMode);

  // ── Partners mode ─────────────────────────────────────────────────────────
  if (partnersMode) {
    document.getElementById("urgency-strip").hidden   = true;
    document.getElementById("section-closing").hidden = true;
    document.getElementById("section-coming").hidden  = true;
    document.getElementById("section-closed").hidden  = true;
    document.getElementById("calendar-view").hidden   = true;
    document.getElementById("section-about").hidden   = true;
    document.getElementById("section-partners").hidden = false;
    renderPartners();
    return;
  }
  document.getElementById("section-partners").hidden = true;

  // ── About mode ──────────────────────────────────────────────────────────
  if (aboutMode) {
    document.getElementById("urgency-strip").hidden   = true;
    document.getElementById("section-closing").hidden = true;
    document.getElementById("section-coming").hidden  = true;
    document.getElementById("section-closed").hidden  = true;
    document.getElementById("calendar-view").hidden   = true;
    document.getElementById("section-about").hidden   = false;
    return;
  }
  document.getElementById("section-about").hidden = true;

  // ── Calendar mode ───────────────────────────────────────────────────────
  if (calendarMode) {
    document.getElementById("urgency-strip").hidden    = true;
    document.getElementById("section-closing").hidden  = true;
    document.getElementById("section-coming").hidden   = true;
    document.getElementById("section-closed").hidden   = true;
    document.getElementById("section-about").hidden    = true;
    const calEl = document.getElementById("calendar-view");
    calEl.hidden = false;
    // Calendar always shows all upcoming events; skill + search filters apply
    const calTournaments = sortTournaments(
      allTournaments.filter(matchesSkillFilter).filter(matchesSearchFilter), "date"
    );
    calEl.innerHTML = renderCalendar(calTournaments, todayStr);
    return;
  }

  // ── List mode ───────────────────────────────────────────────────────────
  document.getElementById("calendar-view").hidden = true;
  const filtered = allTournaments
    .filter(matchesMonthFilter)
    .filter(matchesStateFilter)
    .filter(matchesSkillFilter)
    .filter(matchesSearchFilter);
  const sorted   = sortTournaments(filtered, sortMode);
  const { closingSoon, comingUp } = bucketTournaments(sorted, todayStr);

  // Urgency strip
  const urgencyEl = document.getElementById("urgency-strip");
  if (closingSoon.length > 0) {
    urgencyEl.hidden = false;
    document.getElementById("urgency-num").textContent  = closingSoon.length;
    document.getElementById("urgency-text").textContent =
      `tournament${closingSoon.length !== 1 ? "s" : ""} closing this week`;
  } else {
    urgencyEl.hidden = true;
  }

  // Closing this week section
  const closingEl = document.getElementById("section-closing");
  if (closingSoon.length > 0) {
    closingEl.hidden = false;
    closingEl.innerHTML = renderSection(
      "closing-soon",
      "⚡ Closing <span class='accent'>this week</span>",
      "", "", closingSoon, todayStr, false, "closing"
    );
  } else {
    closingEl.hidden = true;
  }

  // Coming up section — includes closed-reg future tournaments
  const visibleComingUp = comingUp;
  const comingEl = document.getElementById("section-coming");
  if (searchQuery && closingSoon.length === 0 && visibleComingUp.length === 0) {
    comingEl.innerHTML = `
<div class="empty-state">
  <div class="empty-icon">🔍</div>
  <div class="empty-title">No tournaments found</div>
  <div class="empty-sub">Try different keywords or clear the search</div>
</div>`;
  } else {
    comingEl.innerHTML = renderSection(
      null, "📅 Coming up", "", "green", visibleComingUp, todayStr,
      closingSoon.length > 0, "coming"
    );
  }

  // Reg-closed section no longer needed — merged into Coming Up
  document.getElementById("section-closed").hidden = true;

  // Footer stats
  const statsEl = document.getElementById("footer-stats");
  if (statsEl) {
    statsEl.textContent = `${todayStr} · ${allTournaments.length} verified event${allTournaments.length !== 1 ? "s" : ""}`;
  }

  // Filter badge
  updateFilterBadge();

  // Wire share buttons (re-wired after every innerHTML update)
  document.querySelectorAll(".btn-share[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const t = allTournaments.find(x => (x["ID"] || "") === btn.dataset.id);
      if (t) handleShare(t);
    });
  });

  // Wire section collapse toggles
  document.querySelectorAll(".section-toggle-btn[data-section]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.section;
      sectionCollapsed[key] = !sectionCollapsed[key];
      const wrap    = document.getElementById(`cards-wrap-${key}`);
      const chevron = btn.querySelector(".section-chevron");
      if (wrap)    wrap.hidden = sectionCollapsed[key];
      if (chevron) chevron.classList.toggle("collapsed", sectionCollapsed[key]);
      btn.setAttribute("aria-expanded", String(!sectionCollapsed[key]));
    });
  });
}

// ── Share & toast ─────────────────────────────────────────────────────────
function handleShare(t) {
  const id    = t["ID"] || "";
  const url   = id
    ? `${window.location.origin}/?id=${encodeURIComponent(id)}`
    : window.location.href;
  const title = t["Tournament Name"] || "MyTournament.PB";
  const text  = `${title} — Malaysian pickleball tournament`;

  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url)
      .then(() => showToast("Link copied!"))
      .catch(() => showToast("Copy failed — try again"));
  }
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("visible"), 3000);
}

// ── Calendar / Gantt ─────────────────────────────────────────────────────
const CAL_DAY_W = 28;  // px per day column
const CAL_DAYS  = 70;  // 10 weeks displayed

function calStartDate(todayStr) {
  return new Date(todayStr + "T00:00:00"); // start from today, not Monday
}

function dateObjToStr(d) {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${dy}`;
}

function dayDiff(a, b) { // days from Date a to Date b
  return Math.round((b - a) / 86400000);
}

function renderCalendar(tournaments, todayStr) {
  const calStart  = calStartDate(todayStr);
  const calEndD   = new Date(calStart);
  calEndD.setDate(calStart.getDate() + CAL_DAYS - 1);
  const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  // ── Header cells ────────────────────────────────────────────────────
  let dayCells = "";
  for (let i = 0; i < CAL_DAYS; i++) {
    const d   = new Date(calStart);
    d.setDate(calStart.getDate() + i);
    const dow       = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isToday   = dateObjToStr(d) === todayStr;
    const isMon     = dow === 1;
    const cls = ["cal-day-col",
      isWeekend   ? "cal-weekend"    : "",
      isToday     ? "cal-today"      : "",
      isMon && i  ? "cal-week-start" : ""
    ].filter(Boolean).join(" ");
    const weekLbl = isMon ? formatShortDate(dateObjToStr(d)) : "";
    dayCells += `<div class="${cls}" style="width:${CAL_DAY_W}px">
      <div class="cal-week-label">${weekLbl}</div>
      <div class="cal-day-num">${d.getDate()}</div>
      <div class="cal-day-name">${DAY_NAMES[dow]}</div>
    </div>`;
  }

  // ── Weekend background gradient ──────────────────────────────────────
  // Safari's CSS gradient parser silently drops stops beyond ~80, which
  // caused July+ weekends to go blank with the original 140-stop gradient.
  // Fix: emit stops ONLY at colour transitions (weekday↔weekend boundaries)
  // → ~42 stops instead of 140, safe on every browser's CSS parser. ────
  const WKND_COL = "rgba(13,31,26,0.045)";
  const wkndStops = [];
  let prevWknd = null;
  for (let i = 0; i < CAL_DAYS; i++) {
    const d = new Date(calStart);
    d.setDate(calStart.getDate() + i);
    const isWknd = d.getDay() === 0 || d.getDay() === 6;
    if (isWknd !== prevWknd) {
      const px = i * CAL_DAY_W;
      if (prevWknd !== null) wkndStops.push(`${prevWknd ? WKND_COL : "transparent"} ${px}px`);
      wkndStops.push(`${isWknd ? WKND_COL : "transparent"} ${px}px`);
      prevWknd = isWknd;
    }
  }
  wkndStops.push(`${prevWknd ? WKND_COL : "transparent"} ${CAL_DAYS * CAL_DAY_W}px`);
  const weekendGrad = `linear-gradient(90deg,${wkndStops.join(",")})`;

  // ── Tournament rows ──────────────────────────────────────────────────
  const visible = tournaments.filter(t => {
    const sStr = t["Start Date"] || "";
    const eStr = (t["End Date"] && DATE_RE.test(t["End Date"])) ? t["End Date"] : sStr;
    if (!DATE_RE.test(sStr)) return false;
    const tEnd   = new Date(eStr + "T00:00:00");
    const tStart = new Date(sStr + "T00:00:00");
    return tEnd >= calStart && tStart <= calEndD;
  });

  let rowsHTML = "";
  for (const t of visible) {
    const sStr   = t["Start Date"] || "";
    const eStr   = (t["End Date"] && DATE_RE.test(t["End Date"])) ? t["End Date"] : sStr;
    const tStart = new Date(sStr + "T00:00:00");
    const tEnd   = new Date(eStr + "T00:00:00");

    const s0 = Math.max(0, dayDiff(calStart, tStart));
    const e0 = Math.min(CAL_DAYS - 1, dayDiff(calStart, tEnd));
    if (e0 < s0) continue;

    const barLeft  = s0 * CAL_DAY_W;
    const barWidth = (e0 - s0 + 1) * CAL_DAY_W;

    const platKey = (t["Source Platform"] || "").toLowerCase().replace(/\s+/g, "-");
    const isPick  = (t["Pick Priority"] || "").startsWith("1");

    const rowCls = ["cal-row", t.isClosed ? "cal-closed" : "", isPick ? "cal-pick" : ""].filter(Boolean).join(" ");
    const barStatus = t.isClosed ? "cal-bar-closed" : (t.isClosingSoon ? "cal-bar-soon" : "");
    const barCls    = ["cal-bar", barStatus].filter(Boolean).join(" ");
    const statusTxt = t.isClosed ? "Reg closed" : (t.isClosingSoon ? "Closing soon" : "Reg open");
    rowsHTML += `
<div class="${rowCls}">
  <div class="cal-label-col">
    <div class="cal-t-name">${escapeHtml(t["Tournament Name"] || "")}</div>
  </div>
  <div class="cal-timeline" style="width:${CAL_DAYS * CAL_DAY_W}px;background:${weekendGrad}">
    <div class="${barCls}" data-platform="${escapeAttr(platKey)}"
         style="left:${barLeft}px;width:${barWidth}px"
         title="${escapeAttr(t["Tournament Name"] || "")} · ${escapeAttr(sStr)} – ${escapeAttr(eStr)} · ${statusTxt}"></div>
  </div>
</div>`;
  }

  if (!rowsHTML) rowsHTML = `<div class="cal-empty">No tournaments in this window.</div>`;

  return `
<div class="cal-wrap">
  <div class="cal-head-row">
    <div class="cal-label-col cal-head-label"></div>
    <div class="cal-head-days">${dayCells}</div>
  </div>
  <div class="cal-legend">
    <span class="cal-legend-group">
      <span class="cal-legend-label">Platform</span>
      <span class="cal-legend-item"><span class="cal-legend-dot" style="background:var(--platform-sportssync)"></span>Sportssync</span>
      <span class="cal-legend-item"><span class="cal-legend-dot" style="background:var(--court-green)"></span>Baseline</span>
      <span class="cal-legend-item"><span class="cal-legend-dot" style="background:var(--rally-amber)"></span>Sports We Play</span>
    </span>
    <span class="cal-legend-group">
      <span class="cal-legend-label">Status</span>
      <span class="cal-legend-item"><span class="cal-legend-dot is-soon"></span>Closing soon</span>
      <span class="cal-legend-item"><span class="cal-legend-dot is-closed"></span>Reg closed</span>
      <span class="cal-legend-item"><span class="cal-legend-dot is-pick"></span>THE PICK</span>
      <span class="cal-legend-item"><span class="cal-legend-dot is-today"></span>Today</span>
    </span>
  </div>
  <div class="cal-rows">${rowsHTML}</div>
</div>`;
}

// ── Partner matching board ─────────────────────────────────────────────────
async function fetchPartners() {
  try {
    const res = await fetch(PARTNERS_CSV_URL);
    if (!res.ok) return [];
    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return [];
    const headers  = rows[0].map(h => h.trim());
    const dateCols = new Set(["Tournament Date", "Posted Date"]);
    return rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((key, i) => {
        const val = (r[i] ?? "").trim();
        obj[key] = dateCols.has(key) ? normalizeDate(val) : val;
      });
      return obj;
    }).filter(p => (p["Display Name"] || p["Reclub Username"]));
  } catch (e) {
    // Tab may not exist yet — board just shows an empty state.
    console.warn("partners fetch skipped:", e);
    return [];
  }
}

// Extract the first numeric DUPR value from a string ("2.94", "3.0+", "<3.5").
function parseDuprValue(str) {
  const m = (str || "").match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

// Parse a desired-partner range into {lo, hi}. Handles "3.0–3.5", "<3.0", "3.5+", "Any".
function parseDuprRange(str) {
  const s = (str || "").trim().toLowerCase();
  if (!s || s === "any" || s === "open") return { lo: 0, hi: 99 };
  const nums = s.match(/\d+(\.\d+)?/g);
  if (s.startsWith("<") || s.includes("below") || s.includes("under")) {
    return { lo: 0, hi: nums ? parseFloat(nums[0]) : 99 };
  }
  if (s.includes("+") || s.includes("above") || s.includes("over")) {
    return { lo: nums ? parseFloat(nums[0]) : 0, hi: 99 };
  }
  if (nums && nums.length >= 2) return { lo: parseFloat(nums[0]), hi: parseFloat(nums[1]) };
  if (nums && nums.length === 1) { const v = parseFloat(nums[0]); return { lo: v - 0.25, hi: v + 0.25 }; }
  return { lo: 0, hi: 99 };
}

function duprBandKey(v) {
  if (v === null) return null;
  if (v < 3.0) return "lt3";
  if (v < 3.5) return "3-3.5";
  if (v < 4.0) return "3.5-4";
  return "4plus";
}

// Tokens for event-type matching from a free "Looking For" string.
function partnerEventTokens(lookingFor) {
  const s = (lookingFor || "").toLowerCase();
  const out = [];
  if (s.includes("mix")) out.push("mixed");
  if (s.includes("women") || s.includes("ladies")) out.push("womens");
  if (s.includes("men") && !s.includes("women")) out.push("mens");
  return out;
}

function isGoodPartnerMatch(p) {
  if (yourDupr === null) return false;
  const { lo, hi } = parseDuprRange(p["Desired DUPR"]);
  return yourDupr >= lo && yourDupr <= hi;
}

function normalizeName(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function findPartnerTournament(name) {
  const n = normalizeName(name);
  if (!n) return null;
  return allTournaments.find(t => {
    const tn = normalizeName(t["Tournament Name"]);
    return tn && (tn === n || tn.includes(n) || n.includes(tn));
  }) || null;
}

function matchesPartnerSearch(p) {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return [
    p["Display Name"], p["Reclub Username"], p["State"],
    p["Tournament"], p["Looking For"], p["Note"]
  ].some(v => (v || "").toLowerCase().includes(q));
}

// Drop stale listings: tournament posts past their date, general posts past TTL.
function isPartnerActive(p, todayStr) {
  const type = (p["Post Type"] || "").toLowerCase();
  if (type.includes("tournament")) {
    const td = p["Tournament Date"];
    if (DATE_RE.test(td)) return td >= todayStr;
    return true; // no parseable date — keep, let moderation handle
  }
  const posted = p["Posted Date"];
  if (DATE_RE.test(posted)) {
    const age = daysUntil(posted, todayStr); // negative = in the past
    return age === null || -age <= PARTNER_GENERAL_TTL_DAYS;
  }
  return true;
}

function renderPartnerCard(p, todayStr) {
  const name    = escapeHtml(p["Display Name"] || "A player");
  const reclub  = (p["Reclub Username"] || "").replace(/^@/, "");
  const dupr    = parseDuprValue(p["DUPR"]);
  const duprTxt = dupr !== null ? dupr.toFixed(2) : "—";
  const source  = (p["DUPR Source"] || "").toLowerCase();
  const srcTag  = source.includes("official") ? "official" : (source ? "self-est." : "");
  const gender  = (p["Gender"] || "").trim().charAt(0).toUpperCase();
  const isTourn = (p["Post Type"] || "").toLowerCase().includes("tournament");

  // Event pills
  const events = partnerEventTokens(p["Looking For"]);
  const evLabel = { mens: "Men's Doubles", womens: "Women's Doubles", mixed: "Mixed Doubles" };
  const evHTML  = (events.length ? events : null)
    ? events.map(e => `<span class="event-pill">${evLabel[e]}</span>`).join("")
    : `<span class="event-pill">${escapeHtml(p["Looking For"] || "Any event")}</span>`;

  // Target line
  let targetHTML = "";
  if (isTourn) {
    const matched = findPartnerTournament(p["Tournament"]);
    const tName   = escapeHtml(p["Tournament"] || (matched && matched["Tournament Name"]) || "A tournament");
    const tDateStr = (matched && matched["Start Date"]) || p["Tournament Date"] || "";
    const dateLbl = DATE_RE.test(tDateStr) ? ` · ${escapeHtml(formatShortDate(tDateStr))}` : "";
    targetHTML = `<div class="partner-target"><span class="ptype-pill tournament">TOURNAMENT</span> ${tName}${dateLbl}</div>`;
  } else {
    targetHTML = `<div class="partner-target"><span class="ptype-pill general">GENERAL</span> Looking for a regular partner</div>`;
  }

  const desired = (p["Desired DUPR"] || "").trim();
  const wantsHTML = desired ? `<div class="partner-wants">Wants partner <b>${escapeHtml(desired)}</b></div>` : "";
  const state   = escapeHtml(p["State"] || "");
  const note    = (p["Note"] || "").trim();
  const noteHTML = note ? `<div class="partner-note">${escapeHtml(note)}</div>` : "";
  const reclubHTML = reclub
    ? `<div class="reclub-row"><span class="reclub-label">Find on Reclub</span><b class="reclub-user">@${escapeHtml(reclub)}</b></div>`
    : "";
  const good = isGoodPartnerMatch(p);
  const matchHTML = good ? `<div class="partner-match">✓ Good match for you</div>` : "";

  return `
<div class="card partner-card${good ? " is-match" : ""}">
  <div class="dupr-block">
    <div class="dupr-label">DUPR</div>
    <div class="dupr-val">${duprTxt}</div>
    ${srcTag ? `<div class="dupr-src">${srcTag}</div>` : ""}
  </div>
  <div class="card-body">
    <div class="partner-head">
      <span class="card-name">${name}</span>
      ${gender ? `<span class="gender-tag">${gender}</span>` : ""}
      ${state ? `<span class="partner-state">${state}</span>` : ""}
    </div>
    ${targetHTML}
    <div class="looking-for"><span class="lf-label">Looking for</span><div class="events">${evHTML}</div></div>
    ${wantsHTML}
    ${noteHTML}
    ${reclubHTML}
    ${matchHTML}
  </div>
</div>`.trim();
}

function renderPartners() {
  const todayStr = todayUTCString();
  const listEl = document.getElementById("partners-list");
  if (!listEl) return;

  let list = allPartners.filter(p => isPartnerActive(p, todayStr));

  // Type filter
  if (partnerTypeFilter !== "all") {
    list = list.filter(p => {
      const isT = (p["Post Type"] || "").toLowerCase().includes("tournament");
      return partnerTypeFilter === "tournament" ? isT : !isT;
    });
  }
  // Event filter
  if (partnerEventFilter) {
    list = list.filter(p => partnerEventTokens(p["Looking For"]).includes(partnerEventFilter));
  }
  // DUPR band filter (on the poster's own rating)
  if (partnerDuprBand) {
    list = list.filter(p => duprBandKey(parseDuprValue(p["DUPR"])) === partnerDuprBand);
  }
  // Search
  list = list.filter(matchesPartnerSearch);

  // Sort: good matches first (when Your DUPR set), then tournament posts by soonest date,
  // then general posts by newest.
  list.sort((a, b) => {
    if (yourDupr !== null) {
      const am = isGoodPartnerMatch(a) ? 0 : 1;
      const bm = isGoodPartnerMatch(b) ? 0 : 1;
      if (am !== bm) return am - bm;
    }
    const aT = (a["Post Type"] || "").toLowerCase().includes("tournament");
    const bT = (b["Post Type"] || "").toLowerCase().includes("tournament");
    if (aT !== bT) return aT ? -1 : 1;
    if (aT && bT) return (a["Tournament Date"] || "") < (b["Tournament Date"] || "") ? -1 : 1;
    return (a["Posted Date"] || "") > (b["Posted Date"] || "") ? -1 : 1;
  });

  if (!list.length) {
    const emptyMsg = allPartners.length
      ? "No listings match your filters. Try clearing them."
      : "No partner listings yet. Be the first — post a listing above.";
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🤝</div>
      <div class="empty-title">Nothing here yet</div>
      <div class="empty-sub">${emptyMsg}</div></div>`;
    return;
  }

  const matchCount = yourDupr !== null ? list.filter(isGoodPartnerMatch).length : 0;
  const head = `<div class="section-head"><span class="section-title">${list.length} player${list.length === 1 ? "" : "s"} looking${matchCount ? ` · <span class="accent">${matchCount} match${matchCount === 1 ? "" : "es"} for you</span>` : ""}</span></div>`;
  listEl.innerHTML = head + `<div class="cards-wrap">${list.map(p => renderPartnerCard(p, todayStr)).join("")}</div>`;
}

// ── init ──────────────────────────────────────────────────────────────────
async function init() {
  try {
    allTournaments = await fetchTournaments();
    buildMonthChips(allTournaments);
    buildStateChips(allTournaments);
    renderAll();

    // Partner board data (non-blocking — board renders when its tab is opened)
    fetchPartners().then(p => {
      allPartners = p;
      if (partnersMode) renderPartners();
    });
    // Wire the "Post a listing" button to the Google Form
    const postBtn = document.getElementById("partners-post-btn");
    if (postBtn) postBtn.href = PARTNERS_FORM_URL;

    // Search input
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim().toLowerCase();
        if (searchClear) searchClear.hidden = !searchQuery;
        renderAll();
      });
      searchInput.addEventListener("search", () => {
        // Fires when native clear (×) is tapped on mobile
        searchQuery = "";
        if (searchClear) searchClear.hidden = true;
        renderAll();
      });
    }
    if (searchClear) {
      searchClear.addEventListener("click", () => {
        if (searchInput) { searchInput.value = ""; searchInput.focus(); }
        searchQuery = "";
        searchClear.hidden = true;
        renderAll();
      });
    }

    // Sort interaction (select lives inside filter panel)
    document.getElementById("sort-select")?.addEventListener("change", e => {
      sortMode = e.target.value;
      const labels = {
        deadline: "Reg deadline",
        date:     "Tournament date",
        prize:    "Prize pool (high→low)"
      };
      const lbl = document.getElementById("sort-label");
      if (lbl) lbl.textContent = labels[sortMode] || "Tournament date";
      renderAll();
    });

    // Skill level filter chips (multi-select; each chip toggles independently)
    document.querySelectorAll(".chip-skill[data-skill]").forEach(btn => {
      btn.addEventListener("click", () => {
        const skill = btn.dataset.skill;
        if (skillFilters.has(skill)) {
          skillFilters.delete(skill);
          btn.classList.remove("on");
          btn.setAttribute("aria-pressed", "false");
        } else {
          skillFilters.add(skill);
          btn.classList.add("on");
          btn.setAttribute("aria-pressed", "true");
        }
        renderAll();
      });
    });

    // Filter panel open / close
    document.getElementById("filter-btn")?.addEventListener("click", openFilterPanel);
    document.getElementById("filter-close")?.addEventListener("click", closeFilterPanel);
    document.getElementById("filter-overlay")?.addEventListener("click", closeFilterPanel);
    document.getElementById("filter-apply-btn")?.addEventListener("click", closeFilterPanel);

    // Header nav — Home / Calendar
    document.getElementById("nav-home")?.addEventListener("click", e => {
      e.preventDefault();
      if (calendarMode || aboutMode || partnersMode) {
        calendarMode = false;
        aboutMode    = false;
        partnersMode = false;
        renderAll();
      }
    });
    document.getElementById("nav-partners")?.addEventListener("click", e => {
      e.preventDefault();
      closeFilterPanel();
      if (!partnersMode) {
        partnersMode = true;
        calendarMode = false;
        aboutMode    = false;
        renderAll();
      }
    });
    document.getElementById("nav-calendar")?.addEventListener("click", e => {
      e.preventDefault();
      closeFilterPanel(); // close drawer if open on mobile
      if (!calendarMode) {
        calendarMode = true;
        aboutMode    = false;
        partnersMode = false;
        monthFilter  = null; // calendar always shows full window
        stateFilter  = null;
        // Reset month chips to ALL
        const monthRow = document.getElementById("month-row");
        monthRow?.querySelectorAll("[data-month]").forEach(b => {
          const active = b.dataset.month === "ALL";
          b.classList.toggle("on", active);
          b.setAttribute("aria-pressed", String(active));
        });
        renderAll();
      }
    });
    document.getElementById("nav-about")?.addEventListener("click", e => {
      e.preventDefault();
      closeFilterPanel(); // close drawer if open on mobile
      if (!aboutMode) {
        aboutMode    = true;
        calendarMode = false;
        partnersMode = false;
        renderAll();
      }
    });

    // Partner board filter controls
    const yourDuprInput = document.getElementById("your-dupr");
    if (yourDuprInput) {
      yourDuprInput.addEventListener("input", () => {
        const v = parseFloat(yourDuprInput.value);
        yourDupr = Number.isFinite(v) ? v : null;
        if (partnersMode) renderPartners();
      });
    }
    function wirePartnerChipGroup(containerId, dataAttr, onPick) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.querySelectorAll(".pf-chip").forEach(btn => {
        btn.addEventListener("click", () => {
          const val = btn.dataset[dataAttr];
          onPick(val, btn, container);
          if (partnersMode) renderPartners();
        });
      });
    }
    // DUPR band + event: toggle on/off (single-select, click again to clear)
    wirePartnerChipGroup("partner-dupr-bands", "band", (val, btn, container) => {
      const active = partnerDuprBand === val;
      partnerDuprBand = active ? null : val;
      container.querySelectorAll(".pf-chip").forEach(b => b.classList.toggle("on", !active && b === btn));
    });
    wirePartnerChipGroup("partner-events", "ev", (val, btn, container) => {
      const active = partnerEventFilter === val;
      partnerEventFilter = active ? null : val;
      container.querySelectorAll(".pf-chip").forEach(b => b.classList.toggle("on", !active && b === btn));
    });
    // Type: always one selected (All default)
    wirePartnerChipGroup("partner-type", "ptype", (val, btn, container) => {
      partnerTypeFilter = val;
      container.querySelectorAll(".pf-chip").forEach(b => b.classList.toggle("on", b === btn));
    });

    // Deep-link: ?id=MTPB-0005 scrolls to that card
    const params  = new URLSearchParams(window.location.search);
    const deepId  = params.get("id");
    if (deepId) {
      const target = document.getElementById(deepId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (err) {
    console.error("init failed:", err);
    const comingEl = document.getElementById("section-coming");
    if (comingEl) {
      comingEl.innerHTML = "<p style='padding:16px;color:var(--mid-green)'>Could not load tournaments. Check your connection and refresh.</p>";
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
