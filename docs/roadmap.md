# MyTournament.PB — Roadmap

*Last updated: May 28, 2026*

> ⛔ **WEBSITE DEV FROZEN (as of May 28).** Phase 1–3 are on hold pending the ThePickleBase decision (see Open Strategic Question below). Do not start building website features until the posture is decided. The content engine (Friday drops) continues regardless.

---

## ⚠️ OPEN STRATEGIC QUESTION — blocks all website dev

**Ian (ThePickleBase) is building a tournament directory** — DUPR API + Sportssync + Baseline partnerships. That is functionally the same product as this website, but with a real backend and 18K distribution. After the May 28 meeting he invited Mike to potentially help build it.

Until Ian confirms and the posture is chosen, **every website phase below is paused**, because the work may be throwaway:

| Posture | Meaning | Effect on this roadmap |
|---|---|---|
| **Feeder / prototype** | This site = proof-of-concept; data + editorial feeds Ian's directory | Freeze Phase 1–3 permanently. Site stays a lean catalog. |
| **Independent** | Compete; this site stays the player destination | Build Phase 1–3 here; need Supabase backend + bandwidth |
| **Hybrid** | Site = social/brand front; directory work lives in Ian's stack | Keep content engine, pause website dev |

**Decision owner:** Mike + Ian · **Unblocks when:** Ian confirms the working arrangement (target: early June)
**Default stance until then:** Hold. Don't build a backend. Learn Ian's stack first.

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

### Phase 1 — Skill/Category Filtering ⛔ FROZEN (pending ThePickleBase decision)

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

**Dependency:** Requires Supabase account (free tier). Form = vanilla HTML POST.

---

### Phase 4 — Player Tools (Future / Low Priority)

| Feature | Notes |
|---|---|
| Tournament watchlist / save | Local storage only (no accounts) |
| Email / WhatsApp reminder for deadlines | Supabase Edge Functions or simple mailto |
| Push notifications (PWA) | Service worker — significant complexity |
| Partner matching board | Players looking for partners DM Admin PB |

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
