# MyTournament.PB — UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production UI for MyTournament.PB — a sticky-header tournament calendar with three card sections, a DUPR skill parser, sort/filter controls, and a share handler — all in vanilla HTML/CSS/JS, zero build tools.

**Architecture:** `app.js` owns all logic (data fetch, skill parsing, rendering, state). `style.css` owns all visual tokens and component styles. `index.html` is the static shell with mount-point divs that `app.js` fills on `DOMContentLoaded`. The data layer (`fetchTournaments`) is already complete — this plan extends `app.js` with render + interaction functions, then replaces `index.html` and creates `style.css`.

**Tech Stack:** Vanilla HTML5 / CSS3 / ES2020. Google Fonts (Sora + DM Sans). Google Sheets gviz CSV as data source. `navigator.share` + `navigator.clipboard` for sharing.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `style.css` | **Create** | All CSS: brand tokens, layout, card, filter bar, toast, reduced-motion |
| `index.html` | **Replace** | Full page DOM with mount-point divs; loads fonts + style.css + app.js |
| `app.js` | **Extend** | Add: skill parser, date/badge helpers, bucketing, render functions, state, share handler; replace auto-run with `init()` |

---

## Task 1: Create style.css

**Files:**
- Create: `style.css`

- [ ] **Step 1: Write style.css**

Create `/Users/mikembp/Documents/Claude/Projects/MyTournament.PB/style.css` with this exact content:

```css
:root {
  --court-green: #1A6B4A;
  --deep-court:  #0D1F1A;
  --rally-amber: #F0A500;
  --mint-wash:   #E8F5EF;
  --off-white:   #F5F5F0;
  --mid-green:   #6BAF8C;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: var(--off-white); }
body {
  font-family: 'DM Sans', -apple-system, sans-serif;
  color: var(--deep-court);
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 60px;
}
button, a { font: inherit; cursor: pointer; }
a { text-decoration: none; }

/* ===== HEADER ===== */
.header {
  background: rgba(245, 245, 240, 0.9);
  border-bottom: 1px solid rgba(13, 31, 26, 0.06);
  padding: 14px 16px 12px;
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.header-row {
  max-width: 480px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.logo { display: flex; align-items: center; gap: 8px; color: var(--deep-court); }
.logo-mark {
  width: 32px; height: 32px; border-radius: 8px;
  overflow: hidden; flex-shrink: 0; display: block;
}
.logo-mark img { width: 100%; height: 100%; display: block; }
.logo-text {
  font-family: 'Sora', sans-serif; font-weight: 800; font-size: 16px;
  letter-spacing: -0.02em; line-height: 1;
}
.logo-text small {
  display: block; font-size: 9.5px; font-weight: 600;
  color: var(--mid-green); margin-top: 2px;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.header-cta {
  background: transparent; color: var(--deep-court);
  border: 1px solid rgba(13, 31, 26, 0.15); border-radius: 999px;
  padding: 6px 12px; font-size: 12px; font-weight: 600;
  min-height: 36px; display: inline-flex; align-items: center;
}
.header-cta:hover { background: rgba(13, 31, 26, 0.04); }

/* ===== URGENCY STRIP ===== */
.urgency {
  background: var(--deep-court); color: #fff;
  padding: 10px 16px; font-size: 13px; font-weight: 500;
}
.urgency-inner {
  max-width: 480px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.urgency-count { display: inline-flex; align-items: center; gap: 8px; }
.urgency-num {
  font-family: 'Sora', sans-serif; font-weight: 800; font-size: 18px;
  color: var(--rally-amber); line-height: 1; font-variant-numeric: tabular-nums;
}
.urgency-link { color: var(--rally-amber); font-weight: 700; font-size: 12px; letter-spacing: 0.02em; }

/* ===== FILTER BAR ===== */
.filterbar {
  background: var(--off-white);
  border-bottom: 1px solid rgba(13, 31, 26, 0.06);
  padding: 10px 0;
  position: sticky; top: 55px; z-index: 40;
}
.filter-scroll {
  display: flex; gap: 6px; align-items: center;
  overflow-x: auto; scroll-snap-type: x proximity;
  padding: 0 16px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.filter-scroll::-webkit-scrollbar { display: none; }
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  border: 1px solid rgba(13, 31, 26, 0.13); background: #fff;
  border-radius: 999px;
  padding: 7px 13px;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600;
  color: var(--deep-court);
  white-space: nowrap; min-height: 36px;
  transition: transform 120ms ease, background 150ms ease;
  scroll-snap-align: start;
}
.chip:hover { background: rgba(26, 107, 74, 0.04); }
.chip:active { transform: scale(0.96); }
.chip.active { background: var(--deep-court); color: #fff; border-color: var(--deep-court); }
.chip.active .caret { color: #fff; }
.caret { font-size: 9px; color: var(--mid-green); margin-left: 1px; display: inline-block; transform: translateY(-1px); }

/* Sort chip — native select overlay */
.sort-chip { position: relative; overflow: visible; }
.sort-select {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
  width: 100%; height: 100%; font-size: 16px; /* prevents iOS zoom */
}

/* Open-reg-only toggle chip */
.chip-toggle .dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(13, 31, 26, 0.2); transition: background 150ms;
}
.chip-toggle.on .dot { background: var(--court-green); }
.chip-toggle.on { background: var(--mint-wash); border-color: var(--court-green); color: var(--court-green); }

/* ===== MAIN ===== */
main { max-width: 480px; margin: 0 auto; padding: 18px 16px 24px; }

.section-head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin: 18px 0 10px;
}
.section-head.gap { margin-top: 32px; }
.section-title {
  font-family: 'Sora', sans-serif; font-weight: 800; font-size: 17px;
  color: var(--deep-court); letter-spacing: -0.01em;
}
.section-title.muted { color: var(--mid-green); }
.section-title .accent { color: var(--court-green); }
.section-count { font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 600; color: var(--mid-green); }
.section-divider-bar { height: 3px; width: 36px; background: var(--rally-amber); border-radius: 2px; margin-bottom: 14px; }
.section-divider-bar.green { background: var(--court-green); }
.section-divider-bar.muted { background: rgba(13, 31, 26, 0.2); }

/* ===== CARD ===== */
.card {
  background: #fff;
  border: 1px solid rgba(13, 31, 26, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  transition: transform 120ms ease, box-shadow 120ms ease;
}
.card:active { transform: scale(0.99); }
.card.closed-reg { opacity: 0.78; }

.date-block {
  background: var(--mint-wash); border-radius: 9px;
  padding: 8px 10px; text-align: center; min-width: 70px; align-self: start;
}
.date-block.grey { background: rgba(13, 31, 26, 0.05); }
.date-month {
  font-family: 'Sora', sans-serif; font-weight: 700; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--court-green); margin-bottom: 1px;
}
.date-month.muted { color: var(--mid-green); }
.date-day {
  font-family: 'Sora', sans-serif; font-weight: 800; font-size: 18px;
  color: var(--deep-court); line-height: 1.05; font-variant-numeric: tabular-nums;
}
.date-day.muted { color: var(--mid-green); }

.card-body { min-width: 0; }
.card-name {
  font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px;
  line-height: 1.22; color: var(--deep-court); margin-bottom: 2px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card-org { font-size: 11.5px; color: var(--mid-green); margin-bottom: 6px; }

.reg-badge {
  font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600;
  display: inline-block; padding: 2px 8px; border-radius: 5px; margin-bottom: 8px;
}
.reg-badge.soon { background: var(--rally-amber); color: #fff; }
.reg-badge.open { background: rgba(26, 107, 74, 0.10); color: var(--court-green); }
.reg-badge.closed { background: rgba(13, 31, 26, 0.08); color: var(--mid-green); }

.meta-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 10px; margin-bottom: 8px; flex-wrap: wrap;
}
.pairs { display: flex; gap: 14px; }
.pair .k {
  font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--mid-green); font-weight: 600; margin-bottom: 0;
}
.pair .v {
  font-family: 'Sora', sans-serif; font-size: 12.5px; font-weight: 600;
  color: var(--deep-court); font-variant-numeric: tabular-nums;
}

/* Skill chips */
.skill-stack { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.skill-entry { display: flex; flex-direction: column; align-items: flex-end; }
.skill {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 600;
  color: var(--deep-court);
  border: 1px solid rgba(13, 31, 26, 0.18); background: #fff;
  padding: 2px 8px 2px 6px; border-radius: 999px;
}
.skill::before {
  content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #8FB876; /* novice green default */
}
.skill.intermediate::before { background: #F0A500; }
.skill.advanced::before { background: #D67200; }
.skill.open::before { background: #0D1F1A; }
.skill-combined { font-size: 10px; color: var(--mid-green); margin-top: 2px; }

/* Event type pills */
.events { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
.event-pill {
  font-size: 10px; color: var(--court-green); background: var(--mint-wash);
  padding: 2px 7px; border-radius: 4px; font-weight: 700; letter-spacing: 0.02em;
}
.event-pill.all {
  background: var(--court-green); color: #fff;
  padding: 2px 9px; letter-spacing: 0.06em;
}

/* Card actions */
.card-actions { display: flex; gap: 6px; align-items: center; }
.btn-register {
  background: var(--court-green); color: #fff; border: none; border-radius: 7px;
  padding: 8px 14px; font-size: 12px; font-weight: 600; flex: 1; min-height: 36px;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-register:hover { background: #155a3f; }
.btn-register.closed {
  background: rgba(13, 31, 26, 0.12); color: var(--mid-green); cursor: not-allowed;
}
.btn-share {
  background: transparent; color: var(--mid-green);
  border: 1px solid rgba(13, 31, 26, 0.13); border-radius: 7px;
  padding: 8px 10px; font-size: 12px; font-weight: 500; min-height: 36px;
}
.btn-share:hover { background: rgba(13, 31, 26, 0.04); }
.btn-share:focus-visible, .btn-register:focus-visible, .chip:focus-visible, .header-cta:focus-visible {
  outline: 2px solid var(--court-green); outline-offset: 2px;
}

/* ===== SUBMIT CTA ===== */
.submit-cta {
  background: var(--deep-court); color: #fff;
  border-radius: 16px; padding: 22px 20px 20px;
  margin: 30px 0 24px; position: relative; overflow: hidden;
}
.submit-cta::before {
  content: ""; position: absolute; right: -30px; top: -30px;
  width: 130px; height: 130px; border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 165, 0, 0.18) 0%, transparent 70%);
}
.submit-eyebrow {
  font-family: 'Sora', sans-serif; font-size: 10px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--rally-amber); margin-bottom: 8px;
}
.submit-h {
  font-family: 'Sora', sans-serif; font-weight: 800; font-size: 22px;
  line-height: 1.15; margin-bottom: 6px; letter-spacing: -0.015em;
}
.submit-p { font-size: 13px; color: rgba(255, 255, 255, 0.75); margin-bottom: 16px; max-width: 30ch; }
.submit-btn {
  background: var(--rally-amber); color: var(--deep-court);
  border: none; border-radius: 10px;
  padding: 11px 18px; font-weight: 700; font-size: 13px; letter-spacing: 0.01em;
  min-height: 44px; display: inline-flex; align-items: center; gap: 6px;
}
.submit-btn:hover { background: #d99400; }

/* ===== FOOTER ===== */
.footer { border-top: 1px solid rgba(13, 31, 26, 0.08); padding: 24px 16px 32px; }
.footer-inner { max-width: 480px; margin: 0 auto; }
.footer-mark { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.footer-mark .logo-mark { width: 24px; height: 24px; border-radius: 6px; }
.footer-mark .logo-text { font-size: 14px; }
.footer-links { display: flex; flex-wrap: wrap; gap: 14px 18px; margin-bottom: 14px; }
.footer-link { color: var(--mid-green); font-size: 12.5px; font-weight: 500; }
.footer-link:hover { color: var(--deep-court); }
.footer-meta { font-size: 11px; color: var(--mid-green); line-height: 1.6; }
.footer-meta b { color: var(--deep-court); font-weight: 600; }

/* ===== TOAST ===== */
.toast {
  position: fixed; bottom: 24px; left: 50%;
  transform: translateX(-50%) translateY(8px);
  background: var(--deep-court); color: #fff;
  padding: 10px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 500;
  opacity: 0; pointer-events: none;
  transition: opacity 200ms ease, transform 200ms ease;
  z-index: 100; white-space: nowrap;
}
.toast.visible { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify file exists**

Open Terminal and run:
```bash
ls -lh /Users/mikembp/Documents/Claude/Projects/MyTournament.PB/style.css
```
Expected: file exists, size ~4–6 KB.

- [ ] **Step 3: Commit**

```bash
cd /Users/mikembp/Documents/Claude/Projects/MyTournament.PB
git add style.css
git commit -m "feat: add style.css with full brand tokens and component styles"
```

---

## Task 2: Replace index.html with full page DOM

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace index.html**

Replace the entire content of `index.html` with:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Malaysia's pickleball tournament calendar. Find events, check registration deadlines, and plan your season.">
  <title>MyTournament.PB — Malaysia Pickleball Calendar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- HEADER -->
<header class="header">
  <div class="header-row">
    <a class="logo" href="/">
      <div class="logo-mark">
        <img src="assets/logo.svg" alt="MyTournament.PB" width="32" height="32">
      </div>
      <div class="logo-text">
        MyTournament<span style="color:var(--court-green)">.PB</span>
        <small>Malaysia · Pickleball</small>
      </div>
    </a>
    <a class="header-cta"
       href="https://instagram.com/mytournament.pb"
       target="_blank" rel="noopener"
       aria-label="Follow on Instagram for tournament updates">
      🔔 Notify me
    </a>
  </div>
</header>

<!-- URGENCY STRIP -->
<div class="urgency" id="urgency-strip" hidden>
  <div class="urgency-inner">
    <div class="urgency-count">
      <span class="urgency-num" id="urgency-num">0</span>
      <span id="urgency-text">tournaments closing this week</span>
    </div>
    <a class="urgency-link" href="#closing-soon">View →</a>
  </div>
</div>

<!-- FILTER BAR -->
<div class="filterbar" role="region" aria-label="Filter and sort tournaments">
  <div class="filter-scroll">
    <div class="chip sort-chip active">
      <span id="sort-label">Sort: Reg deadline</span>
      <span class="caret">▾</span>
      <select id="sort-select" class="sort-select" aria-label="Sort tournaments by">
        <option value="deadline">Sort: Reg deadline</option>
        <option value="date">Sort: Tournament date</option>
        <option value="prize">Sort: Prize pool (high→low)</option>
      </select>
    </div>
    <button class="chip chip-toggle"
            id="open-reg-toggle"
            aria-pressed="false"
            aria-label="Show open registration only">
      <span class="dot"></span> Open reg only
    </button>
  </div>
</div>

<!-- MAIN -->
<main>
  <div id="section-closing" hidden></div>
  <div id="section-coming"></div>
  <div id="section-closed" hidden></div>

  <div class="submit-cta">
    <div class="submit-eyebrow">Organising a tournament?</div>
    <div class="submit-h">Get listed.<br>It's free.</div>
    <div class="submit-p">We'll verify the details and your event shows up here within 24 hours.</div>
    <a class="submit-btn" href="mailto:hello@mytournamentpb.my">Submit tournament →</a>
  </div>
</main>

<!-- FOOTER -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-mark">
      <div class="logo-mark">
        <img src="assets/logo.svg" alt="MyTournament.PB" width="24" height="24">
      </div>
      <div class="logo-text">
        MyTournament<span style="color:var(--court-green)">.PB</span>
      </div>
    </div>
    <div class="footer-links">
      <a class="footer-link" href="https://instagram.com/mytournament.pb" target="_blank" rel="noopener">Instagram</a>
      <a class="footer-link" href="mailto:hello@mytournamentpb.my">Submit tournament</a>
      <a class="footer-link" href="mailto:hello@mytournamentpb.my">Email</a>
    </div>
    <div class="footer-meta">
      <b>Last updated:</b> <span id="footer-stats">loading…</span><br>
      Independent calendar · Not affiliated with any organizer · © 2026<br>
      Made with 🏓 in Malaysia
    </div>
  </div>
</footer>

<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8000` (run `python3 -m http.server 8000` from the project root if not already running).

Expected:
- Styled page: green header with real logo, muted "Notify me" button, filter bar with two chips, dark submit CTA block, footer with logo.
- Three section divs are empty (no cards yet — data layer connect comes in Task 7).
- Console shows `Loaded N tournaments` from the existing auto-run (data layer is still intact).
- No horizontal scroll on mobile viewport.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: replace index.html shell with full page DOM scaffold"
```

---

## Task 3: Add DUPR skill parser to app.js

**Files:**
- Modify: `app.js` (add before the `fetchTournaments` function)

The parser converts free-text skill level strings from the sheet into structured bucket objects for display and filtering.

- [ ] **Step 1: Add constants and parser functions**

Insert the following block into `app.js` immediately **after** the `DATE_RE` constant line and **before** the `parseCSV` function:

```javascript
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
```

- [ ] **Step 2: Verify in browser console**

Open `http://localhost:8000`, open DevTools console (Cmd+Opt+J), run each assertion:

```javascript
// Canonical text labels
console.assert(parseSkillLevel("Novice <3")[0].bucket === "Novice <3", "novice text");
console.assert(parseSkillLevel("Intermediate <3.5")[0].bucket === "Intermediate <3.5", "inter text");
console.assert(parseSkillLevel("Advanced <4.0")[0].bucket === "Advanced <4.0", "adv text");
console.assert(parseSkillLevel("Open")[0].bucket === "Open", "open text");
console.assert(parseSkillLevel("ALL")[0].bucket === "ALL", "all text");

// Bare numbers
console.assert(parseSkillLevel("2.799")[0].bucket === "Novice <3", "2.799 novice");
console.assert(parseSkillLevel("3.499")[0].bucket === "Intermediate <3.5", "3.499 inter");
console.assert(parseSkillLevel("3.999")[0].bucket === "Advanced <4.0", "3.999 adv");
console.assert(parseSkillLevel("4.5")[0].bucket === "Open", "4.5 open");

// Combined caps (>4.5 → divide by 2)
const c1 = parseSkillLevel("5.899");
console.assert(c1[0].bucket === "Intermediate <3.5", "5.899 combined → inter");
console.assert(c1[0].combinedCap === "5.899", "5.899 combinedCap preserved");

const c2 = parseSkillLevel("6.099");
console.assert(c2[0].bucket === "Intermediate <3.5", "6.099 combined → inter");

// Multi-skill, dedup
const m = parseSkillLevel("Novice <3, Intermediate <3.5");
console.assert(m.length === 2, "multi-skill length 2");
console.assert(m[0].bucket === "Novice <3", "multi skill[0]");

// Empty / blank
console.assert(parseSkillLevel("").length === 0, "empty returns []");
console.assert(parseSkillLevel("  ").length === 0, "blank returns []");

// Combined notation from sheet "Combined 5.899"
const c3 = parseSkillLevel("Combined 5.899");
console.assert(c3[0].bucket === "Intermediate <3.5", "Combined prefix works");
```

All assertions should pass silently (no `Assertion failed` messages).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add DUPR skill level parser (parseSkillLevel)"
```

---

## Task 4: Add date formatting and reg-badge helpers to app.js

**Files:**
- Modify: `app.js` (add after the skill parser block, before `parseCSV`)

- [ ] **Step 1: Add helpers**

Insert this block immediately after the skill parser block:

```javascript
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
```

- [ ] **Step 2: Verify in browser console**

```javascript
// formatDateBlock
const db1 = formatDateBlock("2026-05-22", "2026-05-24");
console.assert(db1.month === "MAY" && db1.day === "22–24", "range same month");

const db2 = formatDateBlock("2026-06-13", "2026-06-13");
console.assert(db2.month === "JUN" && db2.day === "13", "single day");

const db3 = formatDateBlock("", "");
console.assert(db3.day === "TBD", "empty returns TBD");

// formatShortDate
console.assert(formatShortDate("2026-05-17") === "May 17", "short date");
console.assert(formatShortDate("2026-12-01") === "Dec 1", "dec 1");

// regBadgeInfo — create minimal mock tournament objects
const todayStr = "2026-05-16";

const tSoon = { isClosed: false, isClosingSoon: true,
  "Reg Deadline": "2026-05-20", "Start Date": "2026-06-01", "End Date": "2026-06-02" };
const badge1 = regBadgeInfo(tSoon, todayStr);
console.assert(badge1.cls === "soon", "soon class");
console.assert(badge1.text.startsWith("⚡"), "soon text has bolt");

const tOpen = { isClosed: false, isClosingSoon: false,
  "Reg Deadline": "2026-07-01", "Start Date": "2026-07-15", "End Date": "2026-07-16" };
const badge2 = regBadgeInfo(tOpen, todayStr);
console.assert(badge2.cls === "open", "open class");

const tClosed = { isClosed: true, isClosingSoon: false,
  "Reg Deadline": "2026-05-10", "Start Date": "2026-05-20", "End Date": "2026-05-21" };
const badge3 = regBadgeInfo(tClosed, todayStr);
console.assert(badge3.cls === "closed", "closed class");
console.assert(badge3.text.includes("starts in"), "closed text: starts in");

const tNow = { isClosed: true, isClosingSoon: false,
  "Reg Deadline": "2026-05-10", "Start Date": "2026-05-15", "End Date": "2026-05-20" };
const badge4 = regBadgeInfo(tNow, todayStr);
console.assert(badge4.text === "Reg closed · Happening now", "happening now");
```

All should pass silently.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add date formatting and reg-badge helpers"
```

---

## Task 5: Add sortTournaments and bucketTournaments to app.js

**Files:**
- Modify: `app.js` (add after the date/badge helpers block, before `parseCSV`)

- [ ] **Step 1: Add functions**

Insert this block:

```javascript
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
```

- [ ] **Step 2: Verify in browser console**

```javascript
// Use the already-loaded allTournaments (from the existing auto-run):
fetchTournaments().then(ts => {
  const today = "2026-05-16";

  // sortTournaments — deadline mode
  const byDeadline = sortTournaments(ts, "deadline");
  const dateValues = byDeadline.map(t => t["Reg Deadline"]).filter(d => /^\d{4}/.test(d));
  for (let i = 1; i < dateValues.length; i++) {
    console.assert(dateValues[i-1] <= dateValues[i], `deadline sort order at ${i}`);
  }
  console.log("deadline sort ok, first 5:", byDeadline.slice(0,5).map(t => t["Reg Deadline"]));

  // bucketTournaments
  const { closingSoon, comingUp, regClosed } = bucketTournaments(ts, today);
  console.log(`closingSoon: ${closingSoon.length}, comingUp: ${comingUp.length}, regClosed: ${regClosed.length}`);
  console.assert(closingSoon.every(t => t.isClosingSoon), "all closingSoon have flag");
  console.assert(comingUp.every(t => !t.isClosed && !t.isClosingSoon), "comingUp flag check");
  console.assert(regClosed.every(t => t.isClosed), "all regClosed have flag");

  // No past-end-date items
  const pastEnd = [...closingSoon, ...comingUp, ...regClosed].filter(t => {
    const e = t["End Date"]; return e && DATE_RE.test(e) && e < today;
  });
  console.assert(pastEnd.length === 0, "no past-end-date items in buckets");
});
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add sortTournaments and bucketTournaments"
```

---

## Task 6: Add render functions to app.js

**Files:**
- Modify: `app.js` (add after bucketing functions, before `fetchTournaments`)

- [ ] **Step 1: Add helper + render functions**

Insert this block:

```javascript
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

function renderCard(t, todayStr) {
  const { month, day } = formatDateBlock(t["Start Date"], t["End Date"]);
  const badge   = regBadgeInfo(t, todayStr);
  const isClosed = t.isClosed;
  const id = escapeAttr(t["ID"] || "");

  const orgParts = [t["Organizer"], t["Venue"], t["State"]].filter(Boolean);
  const orgLine  = orgParts.map(escapeHtml).join(" · ");

  const regURL  = escapeAttr(t["Registration URL"] || "#");
  const btnHTML = isClosed
    ? `<button class="btn-register closed" disabled>Reg closed</button>`
    : `<a class="btn-register" href="${regURL}" target="_blank" rel="noopener">Register →</a>`;

  return `
<div class="card${isClosed ? " closed-reg" : ""}" id="${id}">
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
        <div class="pair"><div class="k">Entry</div><div class="v">${escapeHtml(t["Entry Fee (RM)"] || "—")}</div></div>
        <div class="pair"><div class="k">Prize</div><div class="v">${escapeHtml(t["Prize Pool (RM)"] || "—")}</div></div>
      </div>
      ${renderSkillChips(t["Skill Level"] || "")}
    </div>
    ${renderEventPills(t["Event Type"] || "")}
    <div class="card-actions">
      ${btnHTML}
      <button class="btn-share" aria-label="Share ${escapeAttr(t["Tournament Name"] || "")}" data-id="${id}">⤴ Share</button>
    </div>
  </div>
</div>`.trim();
}

function renderSection(anchorId, titleHTML, titleCls, dividerCls, cards, todayStr, addGap) {
  const count = cards.length;
  const gap   = addGap ? " gap" : "";
  const anchor = anchorId ? ` id="${anchorId}"` : "";
  const cardsHTML = cards.map(t => renderCard(t, todayStr)).join("\n");
  return `
<div class="section-head${gap}"${anchor}>
  <div class="section-title${titleCls ? ` ${titleCls}` : ""}">${titleHTML}</div>
  <div class="section-count">${count} event${count !== 1 ? "s" : ""}</div>
</div>
<div class="section-divider-bar${dividerCls ? ` ${dividerCls}` : ""}"></div>
${cardsHTML}`.trim();
}
```

- [ ] **Step 2: Verify in browser console**

```javascript
fetchTournaments().then(ts => {
  const t = ts[0];
  const todayStr = "2026-05-16";
  const html = renderCard(t, todayStr);

  // Should contain the tournament name escaped in HTML
  console.assert(html.includes("card"), "renderCard returns card div");
  console.assert(html.includes("date-block"), "has date-block");
  console.assert(html.includes("reg-badge"), "has reg-badge");
  console.assert(html.includes("btn-share"), "has share button");

  // Check escapeHtml does not XSS
  const xss = escapeHtml('<script>alert("x")</script>');
  console.assert(!xss.includes("<script>"), "escapeHtml works");

  // renderEventPills — ALL
  const pillAll = renderEventPills("ALL");
  console.assert(pillAll.includes("event-pill all"), "ALL pill class");

  // renderEventPills — normal list
  const pillNorm = renderEventPills("MD, XD, WD");
  console.assert(pillNorm.match(/event-pill(?!\s+all)/g).length === 3, "3 normal pills");

  // renderSkillChips — combined cap
  const chips = renderSkillChips("5.899");
  console.assert(chips.includes("combined 5.899"), "combined cap subtext");
  console.assert(chips.includes("intermediate"), "combined maps to intermediate cls");

  console.log("All render assertions passed");
});
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add renderCard, renderSection, and render helpers"
```

---

## Task 7: Add renderAll + init, wire data to DOM

**Files:**
- Modify: `app.js` (add state vars and functions after `fetchTournaments`; replace auto-run at bottom)

- [ ] **Step 1: Add state, renderAll, and init**

Add this block immediately **after** the closing brace of `fetchTournaments`:

```javascript
// ── State ─────────────────────────────────────────────────────────────────
let allTournaments = [];
let sortMode      = "deadline";
let openRegOnly   = false;

// ── renderAll ─────────────────────────────────────────────────────────────
function renderAll() {
  const todayStr = todayUTCString();
  const sorted   = sortTournaments(allTournaments, sortMode);
  const { closingSoon, comingUp, regClosed } = bucketTournaments(sorted, todayStr);

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
      "", "", closingSoon, todayStr, false
    );
  } else {
    closingEl.hidden = true;
  }

  // Coming up section
  const comingEl = document.getElementById("section-coming");
  comingEl.innerHTML = renderSection(
    null, "📅 Coming up", "", "green", comingUp, todayStr,
    closingSoon.length > 0  // add gap if closing section is visible
  );

  // Reg-closed section
  const closedEl = document.getElementById("section-closed");
  if (!openRegOnly && regClosed.length > 0) {
    closedEl.hidden = false;
    closedEl.innerHTML = renderSection(
      null, "🔒 Reg closed · still happening", "muted", "muted", regClosed, todayStr, true
    );
  } else {
    closedEl.hidden = true;
  }

  // Footer stats
  const statsEl = document.getElementById("footer-stats");
  if (statsEl) {
    statsEl.textContent = `${todayStr} · ${allTournaments.length} verified event${allTournaments.length !== 1 ? "s" : ""}`;
  }

  // Wire share buttons (re-wired after every innerHTML update)
  document.querySelectorAll(".btn-share[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const t = allTournaments.find(x => (x["ID"] || "") === btn.dataset.id);
      if (t) handleShare(t);
    });
  });
}

// ── init ──────────────────────────────────────────────────────────────────
async function init() {
  try {
    allTournaments = await fetchTournaments();
    renderAll();

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
```

- [ ] **Step 2: Replace auto-run at the bottom of app.js**

Find and replace the last block of `app.js` (the `fetchTournaments()...console.log` auto-run):

**Remove:**
```javascript
fetchTournaments()
  .then(rows => console.log(`Loaded ${rows.length} tournaments`, rows))
  .catch(err => console.error("fetchTournaments failed:", err));
```

**Replace with:**
```javascript
document.addEventListener("DOMContentLoaded", init);
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:8000`. Expected:
- Tournament cards render in all three sections.
- Urgency strip shows correct count (or hidden if none closing soon).
- Date blocks show month + day range (e.g. "MAY 22–24").
- Reg badges have correct colours: amber (closing soon), green tint (open), grey (closed).
- Skill chips appear with colour dots.
- Event pills render (or section is empty if no Event Type in sheet).
- Footer shows `2026-05-16 · N verified events`.
- `Register →` button is a link; clicking opens the registration URL.
- Console should be clean (no errors).

In console run:
```javascript
// Sanity check state
console.log("loaded:", allTournaments.length, "sort:", sortMode, "openOnly:", openRegOnly);
```
Expected: `loaded: N sort: deadline openOnly: false`

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: add renderAll and init — wire data layer to DOM"
```

---

## Task 8: Add sort chip and open-reg-only toggle interactions

**Files:**
- Modify: `app.js` (add event listener setup inside `init`, right before the deep-link block)

- [ ] **Step 1: Add interaction wiring inside init**

Inside the `init` function, add this block immediately after `renderAll()` and before the deep-link section:

```javascript
    // Sort chip interaction
    document.getElementById("sort-select").addEventListener("change", e => {
      sortMode = e.target.value;
      const labels = {
        deadline: "Sort: Reg deadline",
        date:     "Sort: Tournament date",
        prize:    "Sort: Prize pool (high→low)"
      };
      document.getElementById("sort-label").textContent = labels[sortMode] || "Sort";
      renderAll();
    });

    // Open-reg-only toggle
    document.getElementById("open-reg-toggle").addEventListener("click", () => {
      openRegOnly = !openRegOnly;
      const btn = document.getElementById("open-reg-toggle");
      btn.classList.toggle("on", openRegOnly);
      btn.setAttribute("aria-pressed", String(openRegOnly));
      renderAll();
    });
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8000`.

Check sort chip:
1. Tap the "Sort: Reg deadline" chip — native OS picker appears on mobile (or browser dropdown on desktop).
2. Select "Sort: Tournament date" → chip label updates to "Sort: Tournament date", cards re-order by Start Date.
3. Select "Sort: Prize pool (high→low)" → cards re-order by Prize Pool value descending.
4. Select "Sort: Reg deadline" again → reverts to default order.

Check toggle:
1. Tap "Open reg only" → chip turns green-tinted, `aria-pressed="true"`, closed-reg section disappears.
2. Tap again → chip reverts, closed section reappears.

In console:
```javascript
// After toggling, verify state
console.log("openRegOnly:", openRegOnly); // should match what you expect
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: wire sort chip and open-reg-only toggle"
```

---

## Task 9: Add share handler and toast

**Files:**
- Modify: `app.js` (add after `renderAll`, before `init`)

- [ ] **Step 1: Add handleShare and showToast**

Insert this block immediately **before** the `init` function:

```javascript
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
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:8000`.

Test share on desktop (no `navigator.share`):
1. Click any "⤴ Share" button.
2. A dark toast "Link copied!" should appear at the bottom of the screen.
3. It should auto-dismiss after ~3 seconds.
4. Paste clipboard into a text field — should be `http://localhost:8000/?id=MTPB-XXXX`.

Test share on mobile (if available, via BrowserStack or physical device):
1. Tap "⤴ Share" → native share sheet opens.

Test error state in console:
```javascript
// Manually call showToast
showToast("Link copied!");
// Verify toast element appears then fades
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add share handler (navigator.share + clipboard) and toast"
```

---

## Task 10: End-to-End Verification

No new code in this task — this is the full quality check pass.

- [ ] **Step 1: Phone-viewport check**

In Chrome DevTools, set viewport to iPhone 14 (390×844). Open `http://localhost:8000`.

Verify all items from the spec's verification checklist:
- [ ] Header is sticky, blurred — stays at top on scroll.
- [ ] Urgency strip shows correct count (dark background, amber number). If no closing-soon items, strip is hidden.
- [ ] Filter bar is sticky below header, horizontally scrollable.
- [ ] Three sections visible: ⚡ Closing this week / 📅 Coming up / 🔒 Reg closed.
- [ ] Approximately 3–4 cards visible per phone scroll height.
- [ ] Cards with closed reg are at 78% opacity, grey date block, disabled button.
- [ ] End-date-past tournaments do not appear in any section.
- [ ] "Open reg only" toggle hides the closed-reg section.
- [ ] Sort chip changes card order — verify with "Prize pool (high→low)": first card should have the highest Prize Pool value.
- [ ] Share button: "Link copied!" toast appears on desktop, or native share sheet on mobile.
- [ ] Register button opens the registration URL in a new tab (check one card with a real URL).
- [ ] Deep link: navigate to `http://localhost:8000/?id=<any-real-id>` — page scrolls to that card.
- [ ] Footer shows last-updated date and count.

- [ ] **Step 2: Contrast check (amber badge)**

The `reg-badge.soon` uses `background: #F0A500; color: #fff`. The contrast ratio is ~2.6:1, below WCAG AA (4.5:1). This is a known design decision accepted in the spec. Document it as a known issue if running Lighthouse — it will flag the badge text. No code change required for MVP; the owner should revisit with the designer before launch.

- [ ] **Step 3: Run Lighthouse (target ≥90 performance, ≥90 accessibility)**

In Chrome DevTools → Lighthouse tab → Mobile preset → Analyze.

Common issues to fix if score is below 90:
- Missing `<meta name="description">` → already in index.html.
- Images missing explicit `width` / `height` → logo img tags have `width="32" height="32"` and `width="24" height="24"`.
- Colour contrast on amber badge → known issue, document and defer.
- Tap target size < 44px → all primary CTAs have `min-height: 44px`; chips have `min-height: 36px` (acceptable per spec §Accessibility).

- [ ] **Step 4: Final commit**

```bash
git add -A
git status   # confirm only expected files changed
git commit -m "chore: end-to-end verified, MVP complete"
git push origin main
```

---

## Self-Review: Spec Coverage Check

| Spec requirement | Covered by task |
|---|---|
| Three sections: Closing this week / Coming up / Reg closed | Task 7 `renderAll` |
| Past end-date hiding | Task 5 `bucketTournaments` |
| Default sort by reg deadline | Task 5 `sortTournaments`, Task 8 |
| Sort chip with Reg deadline / Tournament date / Prize pool | Task 8 |
| Open reg only toggle | Task 8 |
| Urgency strip with closing count | Task 7 `renderAll` |
| Reg badge states: soon / open / closed + 4 sub-states | Task 4 `regBadgeInfo` |
| Closing soon badge: "Closes tomorrow", "Closes [date] · N days left" | Task 4 |
| Closed badge: "Reg closed · Tournament starts in N days" / "Happening now" | Task 4 |
| DUPR skill parser with combined cap | Task 3 `parseSkillLevel` |
| Combined cap subtext `(combined 6.099)` | Task 6 `renderSkillChips` |
| Multi-skill chip stack | Task 6 `renderSkillChips` |
| Event type pills: individual / ALL pill | Task 6 `renderEventPills` |
| Skill chip colour dots (green/amber/orange/black) | Task 1 CSS `.skill.*::before` |
| Card opacity 0.78 + grey date block for closed reg | Task 1 CSS `.closed-reg`, Task 6 `renderCard` |
| Register link (open) / disabled button (closed) | Task 6 `renderCard` |
| Share button: navigator.share + clipboard fallback + toast | Task 9 |
| Deep link `?id=` scroll | Task 7 `init` |
| Notify me → Instagram | Task 2 `index.html` |
| Submit CTA → mailto: placeholder | Task 2 `index.html` |
| Logo wired in (header + footer) | Task 2 `index.html` |
| Sticky header + sticky filter bar | Task 1 CSS |
| Urgency strip hidden when no closing-soon items | Task 7 `renderAll` |
| Footer stats: last-updated + count | Task 7 `renderAll` |
| prefers-reduced-motion | Task 1 CSS |
| Focus rings on interactive elements | Task 1 CSS `:focus-visible` |
| aria-label on Share button | Task 6 `renderCard` |
| aria-pressed on toggle | Task 2 + Task 8 |
| font-display: swap (via Google Fonts `display=swap`) | Task 2 `index.html` |

**Phase 2 items confirmed out of scope:** State / Skill / Event multi-select filter chips.
**Phase 3 items confirmed out of scope:** Min Fee sort, ROI badge, email notifications.
