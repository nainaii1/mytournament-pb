# MyTournament.PB — Roadmap

*Last updated: June 4, 2026*

> ✅ **WEBSITE DEV RESUMED (Jun 4).** Founder chose to keep building independently; ThePickleBase is set to **minimum-maintenance only** (see resolved question below) and is no longer a blocker. Lean, no-backend approach continues — Google Sheets stays the data layer. Content engine (Friday drops) continues regardless.

---

## ✅ RESOLVED STRATEGIC QUESTION (was: blocks all website dev)

**Ian (ThePickleBase) is building a tournament directory** — DUPR API + Sportssync + Baseline partnerships, real backend, ~18K distribution. After the May 28 meeting he invited Mike to potentially help build it.

**Resolution (Jun 4):** Founder picks the **Independent** posture in practice — keep this site as the lean player destination, **without a backend** (Google Sheets only). ThePickleBase = minimum maintenance; founder has signalled willingness to help but won't build for free — they initiate if they want the data/aggregation layer. Founder's priority is own brand + real income.

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

## Partnerships Roadmap

### ThePickleBase (Met May 28 — see `docs/picklebase-meeting-notes.md`)

- **Status:** Met Ian (founder, ex-Zalora) + Grace (marketing). Outcome bigger than expected.
- **Them:** Full pickleball ecosystem in build (Next.js + Vercel) — news, coach directory/bookings/payments, courts directory, **tournament directory (next ~2 months)**, DUPR API, future ecommerce/app. Ian builds it solo with Claude Code.
- **Outcome:** Not a data deal. Ian invited Mike to potentially help build the tournament directory module. Mentioned Git branching setup so they can work alongside.
- **Mike's next step:** Text Ian (May 29 AM) → 1–2 week exploration sprint on tournament directory product work → defer pay talk to end of week 2.
- **This is the trigger for the Open Strategic Question at the top of this file.**

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
| 50 followers | — | ✅ Done — at 112 (May 27) |
| 9 posts published | — | ✅ Done (June calendar = Post 9) |
| First sponsored post / organiser collab | — | Pending |
| 500 followers | — | Pending |
| Phase 1 — skill/category filter | — | ⛔ Frozen (ThePickleBase decision) |
| Phase 2 — map view | — | ⛔ Frozen |
| Phase 3 — organiser self-submit | — | ⛔ Frozen |

---

*MyTournament.PB · Every tournament. One place.*
