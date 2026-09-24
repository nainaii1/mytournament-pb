# MyTournament.PB — Roadmap

*Last updated: June 19, 2026 (strategy/content) · Automation Roadmap section updated 24-Aug-2026*

> ✅ **BUILDING INDEPENDENTLY (resumed Jun 4, confirmed Jun 19).** ThePickleBase met May 28 but **never followed up** — that path is effectively closed (reopens only if they DM first), and it was never a blocker anyway. MyTournament.PB continues lean and no-backend (Google Sheets is the data layer). Working cadence is **~2–5 hrs/week, as spare Claude usage allows** — not a fixed commitment. Content engine (Friday drops) continues regardless.

---

## ✅ RESOLVED STRATEGIC QUESTION (was: blocks all website dev)

**Ian (ThePickleBase) is building a tournament directory** — DUPR API + Sportssync + Baseline partnerships, real backend, ~18K distribution. After the May 28 meeting he invited Mike to potentially help build it.

**Resolution (Jun 4 → confirmed Jun 19):** Founder picks the **Independent** posture — keep this site as the lean player destination, **without a backend** (Google Sheets only). ThePickleBase met May 28 but **never re-initiated** afterward, so the collab path is closed for now (reopens only if they DM first). No chasing.

| Posture | Meaning | Effect on this roadmap |
|---|---|---|
| **Feeder / prototype** | This site = proof-of-concept; data + editorial feeds Ian's directory | Not chosen |
| **Independent** ✅ | Compete; this site stays the player destination | **Chosen** — build features here, but stay no-backend / Sheets-only for now |
| **Hybrid** | Site = social/brand front; directory work lives in Ian's stack | Not chosen |

**Note:** "Independent" originally implied a Supabase backend. Founder's revised constraint = **no backend** — ship everything on the existing Sheets + vanilla stack (the Partner Board proves this is viable via a Google Form → Sheets bridge).

---

## ✅ SHIPPED — June 2026 (post-launch)

| Feature | Notes |
|---|---|
| Calendar legibility overhaul | Neutral weekend shading, brighter Sportssync navy `#2F6FA8`, reg-status cues (closing-soon ring · reg-closed solid grey), THE PICK row accent, two-group legend |
| Landing polish | `RM` prefix on entry/prize; intermediate skill dot recolored teal (amber stays urgency-only) |
| **Partner Matching Board** (`Partners` tab) | Players post "looking for a partner" listings (tournament/general). DUPR-first cards · "Your DUPR" match highlight · filters · auto-expiry · Reclub-username contact. Google Form → private sheet → approved rows bridged to public `Partners` tab. No backend. Setup: `docs/partner-board-setup.md`. Pending: founder creates the Form + sets `PARTNERS_FORM_URL`. |

---

## Website Roadmap

### Phase 0 — Core Calendar ✅ COMPLETE (May 2026)

Live at **mytournamentpb.com** · Cloudflare Pages · GitHub auto-deploy

| Feature | Status |
|---|---|
| Tournament list sorted by start date | ✅ |
| Month filter chips | ✅ |
| Week filter chips (This Week / Next Week / All) | ✅ |
| State filter chips (auto-built from sheet data) | ✅ |
| Closing Soon amber strip (deadline ≤7 days) | ✅ |
| Tournament card — name · dates · venue · prize · entry fee · platform pill · register link | ✅ |
| THE PICK / FEATURED badge logic | ✅ |
| Dimmed cards for closed/expired reg | ✅ |
| Calendar view | ✅ |
| Mobile-first (390px) | ✅ |
| Footer — IG · FB · TikTok · Email | ✅ |
| SVG favicon (Court Mark) | ✅ |
| Platform colour dots — Sportssync teal · Baseline court-green · SWP amber | ✅ |

**Stack:** Vanilla HTML + CSS + JS · No frameworks · No npm · No build tools  
**Data:** Google Sheet → gviz CSV/JSON endpoint (live on page refresh)

---

### Phase 1 — Skill/Category Filtering 🟡 NEXT UP (unblocked Jun 4)

**Goal:** Players can filter by DUPR level or category (Novice / Intermediate / Advanced / Open)

| Feature | Notes |
|---|---|
| DUPR / skill level filter chips | Parse `Skill Level` column from sheet |
| Event type filter (Men's · Women's · Mixed · Open · Team) | Parse `Event Type` column |
| Category taxonomy display on cards | Show parsed categories as small pills |
| URL state persistence | `?state=KL&skill=novice` so links are shareable |

**Blocker:** Skill Level data in sheet is freeform text (e.g. "Men's Doubles <3.0, Mixed <7.0") — needs a parser.

---

### Phase 2 — Map View

**Goal:** Players can see tournaments near them visually

| Feature | Notes |
|---|---|
| Leaflet.js map with tournament pins | Geocode venue → lat/lng (one-time per event) |
| Pin colour by platform | Sportssync / Baseline / SWP colours |
| Click pin → card detail | Slide-up panel on mobile |
| State filter syncs with map | |

**Consideration:** Geocoding requires either a manual lat/lng column in the sheet or a geocoding API (Google Maps API or Nominatim free tier).

---

### Phase 3 — Organiser Self-Submit

**Goal:** Organisers can submit their own tournaments without emailing Admin PB

| Feature | Notes |
|---|---|
| Public submission form | Supabase backend — not Google Forms |
| Admin moderation queue | Approve / reject / edit before going live |
| Auto-fill sheet on approval | Or separate Supabase table + merged fetch |
| Email notification to organiser | On approval |

**Dependency:** ~~Requires Supabase~~ → **reuse the Partner Board pattern** (Google Form → private responses sheet → approved rows bridged to a public tab the site reads). No backend needed. See `docs/partner-board-setup.md` for the proven approach.

---

### Phase 4 — Player Tools (Future / Low Priority)

| Feature | Notes |
|---|---|
| Tournament watchlist / save | Local storage only (no accounts) |
| Email / WhatsApp reminder for deadlines | Supabase Edge Functions or simple mailto |
| Push notifications (PWA) | Service worker — significant complexity |
| ~~Partner matching board~~ | ✅ **SHIPPED Jun 2026** as a self-serve `Partners` tab (not DM-based) — see Shipped section above |

---

## Content Roadmap

### Active Franchises (9 types)

| Franchise | Cadence | Priority |
|---|---|---|
| Tournament Drop | Every Friday | 🔴 Core — never miss |
| Worth the Bag? | Tuesday (when team events cluster) | 🟡 High |
| Closing Soon | Tue/Thu when deadline ≤72hr | 🟡 High |
| Admin Notes | Monday (Story) | 🟢 Medium |
| Can Join Ah? | Tuesday (when beginner content needed) | 🟢 Medium |
| Worth It or Not? | Tuesday | 🟢 Medium |
| Partner Needed Board | Wednesday (Story) | 🟢 Medium |
| Scene Check | Ad hoc post-event | 🔵 Opportunistic |
| PB Wrapped | Last day of month | 🟢 Medium |

---

### Content Calendar

**→ Single source of truth: `brand/claude.md` → Current Status → Content calendar.**
Removed from this file to prevent drift (it was getting out of sync every time a post shipped).

---

## Automation Roadmap (NEW — Jun 19)

**Direction:** Founder wants to **build automation agents** for the recurring manual jobs rather than running each by hand every week. The repetitive pain points — tournament scan, sheet hygiene, editorial drafting, deadline checks — already have `.claude/` skills + subagents (`tournament-scraper`, `sheet-sweeper`, `admin-pb-social`, plus the `tournament-ops` skill). The goal is to lean on these (and harden them) so a session can run the weekly loop with minimal manual steps.

| Candidate to automate | Existing tool | Status |
|---|---|---|
| Weekly tournament scan (2 platforms → missing-events list) | `tournament-scraper` subagent · `tournament-ops` skill (Scan) | Built — rebuilt 24-Aug-2026 with a source-verification rule and shared data contract. Platforms narrowed to Sportssync + Baseline — SWP discontinued (founder decision, 24-Aug). |
| Sheet audit / cleanup (expired deadlines, typos, dup IDs, format) | `sheet-sweeper` subagent · `tournament-ops` skill (Unknowns audit) | Built. The Unknowns audit mode is new (24-Aug) — dogfooded same-day, found and fixed the Event Type/Skill Level rendering bug across 37 rows plus the EGH Gantt bug, wrong Sportssync URLs, and a stale entry fee. |
| Editorial drafting (Pick Priority, angles, player notes) | `tournament-ops` skill (Editorial) | Built |
| Deadline / Closing Soon flagging | `tournament-ops` skill (Deadlines) | Built |
| Content drafting (carousel briefs, captions, rollout package) | `admin-pb-social` subagent | Built |

**Dogfooded 24-Aug-2026:** ran Scan + Unknowns audit + Deadlines back to back. Found real bugs (see `brand/claude.md` → Data Ops Status), so the tooling is proving its worth. One open issue surfaced, not yet a tooling fix: Google Sheets Data Validation on `Age Group`/`Reg Deadline` is silently blanking non-numeric/non-date values on import — needs a founder-side check in Sheets, not a skill change.

**Next:** dogfood the Editorial mode and a full weekly Scan+Deadlines loop on Post 11. Keep everything no-backend (skills/subagents only) consistent with the lean stack.

---

## Partnerships Roadmap

### ThePickleBase (Met May 28 — see `docs/picklebase-meeting-notes.md`)

- **Status (Jun 19):** Met Ian (founder, ex-Zalora) + Grace (marketing) on May 28. **No follow-up since — effectively closed.** Founder is not chasing; reopens only if ThePickleBase DMs first.
- **Them:** Full pickleball ecosystem in build (Next.js + Vercel) — news, coach directory/bookings/payments, courts directory, tournament directory, DUPR API, future ecommerce/app. Ian builds it solo with Claude Code.
- **Outcome:** Not a data deal. Ian invited Mike to potentially help build the tournament directory module (Git branching to work alongside). Never progressed — no contact afterward.

### Future Partnership Targets

| Target | Type | Notes |
|---|---|---|
| Tournament organisers (Baseline, SWP, Sportssync) | Data / listing | Direct API feed would replace manual scraping |
| Minor League PB Malaysia (@officialminorleaguepb_mas) | Co-content | Already following us — strong signal |
| Court operators (91 Club, Picklify, etc.) | Sponsored content | Once reach grows |
| National governing bodies (PBM) | Official listing | Long-term credibility |

---

## Growth Milestones

| Milestone | Target | Status |
|---|---|---|
| 3 consecutive Friday posts | May 29 | ✅ Done (streak 3/3) |
| Website live | — | ✅ mytournamentpb.com |
| 50 followers | — | ✅ Done |
| 100 followers | — | ✅ Done — 173 (Jun 19, up from 112 on May 27) |
| 10 posts published | — | ✅ Done (Post 10 = Alliance Bank Reel, May 30) |
| First sponsored post / organiser collab | — | Pending |
| 500 followers | — | Pending (at 173) |
| Phase 1 — skill/category filter | — | 🟡 Next up (unblocked Jun 4) |
| Phase 2 — map view | — | Planned |
| Phase 3 — organiser self-submit | — | Planned (reuse Partner Board pattern) |

---

*MyTournament.PB · Every tournament. One place.*
