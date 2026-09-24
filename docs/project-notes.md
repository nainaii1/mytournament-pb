# MyTournament.PB — Project notes & history
*Moved word-for-word from brand/claude.md on 25 Sep 2026. Reference only; brand/claude.md holds the current rules.*

---

## DATA SOURCES & SWEEP SCHEDULE

| Platform | Canonical URL | Scrape method | Notes |
|---|---|---|---|
| Sportssync | `sportssync.asia/tournament/index` (list) · `/tournament/{id}` (detail) | Exa search → fetch individual `/tournament/{id}` page | Primary — richest data. **`.net` domain is DEAD — never use.** |
| Baseline | `my.baseline.live/tournaments` (list) · `/tournaments/{uuid}` (detail) | List is a lazy-load SPA (don't scrape directly) → Exa search to find UUID page → fetch | 91 Club, Alliance Bank, Skechers, Oriental Daily, VS Group |
| Sports We Play (SWP) | `swp.solemas.com` | ⛔ **DISCONTINUED (24-Aug-2026, founder decision).** REST API has returned HTTP 500 since ~12-Jun; Flutter app has no readable DOM. No longer scanned or re-verified — existing SWP-sourced rows stay in the sheet as-is. | ICONIC Cup, Legends Rally, He Rallies, BADGEAR, P.LAB Cup |
| Reclub | — | Leads only, always verify independently | |

> Full scraping playbook + data contract: `.claude/skills/tournament-ops/REFERENCE.md` (canonical field vocabulary, platform access, verification rules) and `SKILL.md` (the four workflow modes), plus the `tournament-scraper` subagent. Keep these URLs in sync across all three.

**Sweep schedule:** Monday + Thursday
**Master tracker:** Google Sheet (live, public read)
`https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg`

**ALWAYS read this sheet at session start before any content or data work.**
Fetch via gviz: `https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg/gviz/tq?tqx=out:csv&sheet=Tournaments`


---

## TRACKER SCHEMA

Columns (in order, 27): Verified · ID · Tournament Name · Organizer · Title Sponsor · Start Date · End Date · Reg Deadline · State · Venue · Entry Fee (RM) per team · Prize Pool (RM) · Cash Prize (RM) · Merch Value (RM) · Prize Pool Note · Skill Level · Event Type · Age Group · Pick Priority · Editorial Angle · Format Note · Player Note · Source Platform · Registration URL · Date Added · Last Checked · Notes

**Note:** City column was removed by founder. Platform label on slides replaces city. `Age Group` sits between Event Type and Pick Priority.

**First column (verification status):** in the live sheet the header cell is merged with the sheet title, so it *ends in* "Status" — `app.js` normalizes it to `Status` and renders only rows whose value is `Verified` (legacy `Published` also accepted). Cell values: blank (new/unverified) · Verified · Draft. Verified at session start: 24-Aug-2026 against the live gviz endpoint.
**Pick Priority:** the sheet now runs two overlapping conventions — older rows use `1 — THE PICK / 2 — Feature / 3 — List / — Mention only`; most rows added since ~Jul-2026 use `THE PICK / STRONG PICK / WORTH KNOWING / LOW PRIORITY` (blank = not yet rated). This looks like an intentional editorial-system evolution, not an error — read the live sheet rather than assuming one scale.
**Registration URL (Sportssync):** must be the tournament **info** page — `sportssync.asia/tournament/{id}` — never the register-form/checkout URL (`.../player/register_tournament_simplified/{id}`). See `.claude/skills/tournament-ops/REFERENCE.md` §3e.
**⚠️ Known sheet issue (24-Aug-2026):** the `Age Group` and `Reg Deadline` columns appear to have Data Validation that silently blanks any value that isn't a plain number / plain date — `"35+"`, `"U18"`, and `"Closed"` have all been wiped on import, repeatedly, across three separate attempts. Check **Data → Data validation** on those two columns in Sheets before relying on non-numeric/non-date values sticking. Not yet resolved as of this writing.
**Date format:** `DD-Mon-YYYY` (e.g. `1-Jul-2026`) throughout — NOT ISO. Match the live sheet.
**State convention:** `Klang Valley` = KL + Selangor; otherwise the state name.
**Adding rows:** output a CSV to `posts/new-tournaments-{date}.csv` → founder imports via File → Import → Append → untick "convert to dates". Do NOT hand back tab blocks to paste.

---

## CURRENT STATUS (June 19, 2026)

**Posts published:** 10 (no new posts since May 30 — publishing gap continued through June. The full June carousel pipeline — Oriental Daily News, AmBank, Picklefy — was NOT posted and is now abandoned. Next post live = Post 11, the July drop.)
- Post 1: About Us / brand intro
- Post 2: Week 1 debut digest (14 tournaments, RM246K)
- Post 3: The Problem (why Admin PB exists)
- Post 4: Mid-May Calendar digest (13 tournaments)
- Post 5: PPA Tour Asia KL Open
- Post 6: ✅ Tournament Drop — ICONIC Cup + June panoramic (Fri May 22)
- Post 7: ✅ Worth the Bag? · Team ROI Edition (Iconic Cup / Putrajaya / Dink MiLP)
- Post 8: ✅ Empire Nextgen
- Post 9: ✅ June 2026 Tournament Calendar (Wed May 27) — 22 tournaments, RM692K+, website launch CTA
- Post 10: ✅ Alliance Bank Malaysia Open — Reel (Sat May 30) · RM129.5K · reg closes Jun 1 ← latest published
  - https://www.instagram.com/p/DY9NloLzjrp/

**Followers:** 173 on Instagram (Jun 19 · up from ~112 on May 27)
**Reach (last 30d, Jun 19):** ~12K views · 151 interactions · 3,050 accounts reached · Stories 7.6K · Posts 4.3K · 712 profile visits · 105 bio-link taps
**Streak:** 3/3 Friday drops ✅ · First Reel published ✅ · **Publishing gap since May 30** (June drops lapsed; resuming with Post 11 July drop)
**Active channels:** Instagram · Facebook · Threads
**Website:** mytournamentpb.com — LIVE
**ThePickleBase:** Met May 28 — **no follow-up since; they never re-initiated.** Door's closed for now (open only if *they* DM first). Founder is proceeding fully independent on MyTournament.PB. See `docs/picklebase-meeting-notes.md`
**Working cadence:** ~2–5 hrs/week on this project, **as spare Claude usage allows** (not a fixed weekly commitment).
**Partner Board:** Code shipped (PR #5 open on `feat/partner-matching-board`). **Pending founder:** create Google Form + public Partners tab in sheet + replace `PARTNERS_FORM_URL` in `app.js` + merge PR #5. Setup guide: `docs/partner-board-setup.md`.

**Content calendar (updated Jun 19):**
| Post | Date | Franchise | Format | Content |
|---|---|---|---|---|
| Post 10 | Sat May 30 | Tournament Drop | Reel | ✅ Published — Alliance Bank Malaysia Open (latest live) |
| ~~June pipeline~~ | Jun 13–27 | Tournament Drop | Carousel | ❌ NOT POSTED — Oriental Daily / AmBank / Picklefy June drops lapsed during the gap. Abandoned. |
| **Post 11** | **next drop** | **Tournament Drop** | **Carousel** | **"July's Already Loading" · Leapmotor APP Asia Penang Open · RM137.9K · THE PICK. Brief built Jun 19 → `posts/2026-07_post-11_app-asia-penang/brief.md`. Ready for Claude Design. (Per rule #10, no fixed posting date in slide copy.)** |
| Companion | mid-week | Closing Soon | Single/3-slide | "Last Call This Week" — Picklefy/DinkFest (Jun 20) + Great Eastern Mall/Starz (Jun 24) + HCK (Jun 27). Same brief file. |

**Pending tasks (Jun 19):**
- [ ] **Tournament scan — OVERDUE.** Not run since ~May 30. Sportssync blocked the founder again (Jun 19) — use the `tournament-scraper` subagent (Exa-based), not manual browsing. See `project-sportssync-blocking` memory.
- [ ] Send Post 11 brief (`posts/2026-07_post-11_app-asia-penang/brief.md`) to Claude Design → build 7-slide carousel + companion Closing Soon.
- [ ] Partner Board go-live — create Google Form → Partners tab in sheet → update `PARTNERS_FORM_URL` in `app.js` → merge PR #5.
- [ ] **Direction (Jun 19):** founder wants to **build automation agents** for the recurring manual workflows (scan, sheet hygiene, editorial) rather than doing them by hand. See `docs/roadmap.md` → Automation.

**Done since Jun 4:**
- ✅ Sheet — new tournaments added (MTPB-0067 Starz KL, MTPB-0068 Selangor Grand Slam, MTPB-0069 BRAGG).
- ✅ Sheet — fixes done (duplicate MTPB-0064 → MTPB-0070, "Intermdiate" typo fixed, BRAGG date verified).

**⚠️ Content/social numbers above (followers, reach, post pipeline) are UNVERIFIED past Jun 19 — no content session has run since. Data-ops status below is current as of 24-Aug-2026; re-check the socials before trusting the follower/reach figures.**

---

## DATA OPS STATUS (24-Aug-2026)

Highest ID is now MTPB-0143 (was MTPB-0069 at Jun 19) — substantial sweeps ran in the gap (Jul-22 and Aug-24 scans both landed) even though no content session did. This session was a full data-infrastructure pass, not content work. The gviz-linked tab holds **43 rows at any given time** — it appears to be a rolling "current/upcoming" view rather than the full historical MTPB-0001+ archive; older/past events seem to get pruned out periodically. Don't assume row count == total tournaments ever tracked.

**Skills rebuilt.** `scan-tournaments` / `check-deadlines` / `draft-editorial` deleted (backed up to `docs/skills-archive-2026-08-24/`) and replaced with one skill: **`tournament-ops`** (`.claude/skills/tournament-ops/SKILL.md` + `REFERENCE.md`). Four modes — Scan, Deadlines, Unknowns audit, Editorial — sharing one data contract. The old skills had drifted apart with no shared source of truth; the shipped `.plugin` bundle was still pointing at the dead `sportssync.net` domain months after the project copy was fixed. Rebuilt and re-zipped so the bundle now matches source.

**Root cause found and fixed:** `app.js` splits `Event Type` on both `,` and `/`, so slash-separated categories (`Men's/Women's/Mixed Doubles`) were rendering as broken fragment pills. Same mechanism made `Skill Level` misread stray numbers as DUPR caps (`"35+ Men's Doubles"` was rendering **"Open (combined 35)"** on the live site). Fixed across 37 of 43 rows.

**Also fixed this session:**
- EGH Networking Tournament's Gantt bar spanned a full month on the Calendar (Aug27→Sep27) — was a Sportssync data-entry error on their end; corrected to the real single-day event.
- 8 Sportssync `Registration URL`s pointed at the checkout/register-form page instead of the tournament info page.
- MTPB-0104's date had been flagged wrong **twice** (by two different agents) and never actually applied — corrected to the real 17-Oct date.
- VREW by Lenmis (MTPB-0078) was quoting the expired early-bird fee (RM270, window closed 31-Jul) instead of the current RM300/team.
- **SWP scanning discontinued** — founder decision. See DATA SOURCES table above.

**⚠️ Open issue, not yet resolved:** Data Validation on `Age Group` and `Reg Deadline` is silently blanking non-numeric/non-date values on import (`"35+"`, `"Closed"`, `"U18"` all wiped, 3 attempts). Needs founder to check Data → Data validation on those two columns directly in Sheets.

**Pending:** `posts/new-tournaments-2026-08-24.csv` (32 new finds from the initial scan) and the MTPB-0103 (91 Pickleball Team Event, event was 25-Aug) reg-closed flag — confirm both are imported.

---

## WEBSITE — LIVE

**Status:** ✅ Phase 0 COMPLETE · Live at mytournamentpb.com
**Stack:** Vanilla HTML + CSS + JavaScript. No frameworks. No npm. No build tools.
**Data:** Google Sheet → gviz JSON endpoint. Live on page refresh.
**Hosting:** Cloudflare Pages (free tier) · auto-deploy from GitHub `main` branch
**Repo:** github.com/nainaii1/mytournament-pb
**Files:** `index.html` · `style.css` · `app.js` · `assets/logo.svg` · `assets/favicon.svg`

**Phase 0 — COMPLETE (shipped May 2026):**
- ✅ Tournament list sorted by start date
- ✅ State filter chips (auto-built from live sheet)
- ✅ Month + week filter chips
- ✅ Closing Soon amber strip (deadline ≤7 days)
- ✅ Tournament card (name · dates · venue · prize · entry fee · platform pill · register link)
- ✅ THE PICK / FEATURED badge logic
- ✅ Dimmed cards for closed/expired reg
- ✅ Mobile-first (390px)
- ✅ Calendar view
- ✅ Footer with IG/FB/TikTok/email links
- ✅ SVG favicon (Court Mark)
- ✅ Search bar with live filtering + empty state
- ✅ Filter drawer (mobile bottom sheet) + sticky sidebar (desktop 240px)
- ✅ Filter panel hides in Calendar and About views
- ✅ About tab (who we are · how it works · find us)

**Shipped since Phase 0 (June 2026):**
- ✅ Calendar legibility overhaul — neutral weekend shading (was green-on-green), brighter Sportssync navy `#2F6FA8`, registration-status cues on bars (closing-soon amber ring · reg-closed solid grey), THE PICK row accent, two-group legend (Platform + Status)
- ✅ Landing polish — `RM` prefix on entry/prize, intermediate skill dot recolored teal `#1B8FA8` so amber stays urgency-only
- ✅ **Partner Matching Board** (`Partners` tab) — players post "looking for a doubles partner" listings (tournament-specific or general). DUPR-first cards · "Your DUPR" compatibility highlight · filters (DUPR band · event · type · search) · auto-expiry · contact via **Reclub username only** (no phone/IG public). Submissions: Google Form → private responses sheet → approved rows bridged (QUERY/IMPORTRANGE) to a public `Partners` tab the site reads. Private contact never reaches the web. Setup guide: `docs/partner-board-setup.md`.
  - ⚠️ **Pending founder:** create the Google Form, then replace `PARTNERS_FORM_URL` placeholder in `app.js`. Board shows an empty state until the `Partners` sheet tab exists.

**Phase 1 (next):** Tournament skill/category filter + DUPR parsing (sheet `Skill Level` column is freeform text)
**Phase 2:** Leaflet.js map pins
**Phase 3:** Organiser self-submit form

**Sheet ID:** `1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg`
**New files this session:** `docs/partner-board-setup.md` · `Partners` sheet tab (to be created)

---

## THEPICKLEBASE PARTNERSHIP

> **STATUS (Jun 19, 2026): Met, no follow-up — effectively closed.** The May 28 meeting happened but ThePickleBase never re-initiated afterward. Founder is not chasing it; the door reopens only if *they* DM first. MyTournament.PB continues fully independent (no backend, Sheets-only). Notes below kept for reference.

**Meeting:** Thu May 28, 10am · PJ or Kuchai (their choice)
**Who:** ThePickleBase (@thepicklebase) — SEA pickleball lifestyle platform (coaching, courts, gear, news). Founder owns BASE Pickleball and Padel court in KL.
**Context:** They DM'd saying they love what we're building and want to connect. They followed us.
**Approach:** Potential data/content partner, not competitor.
**Know before going:** your numbers (followers, posts, sheet size), your pitch (aggregation layer they don't have), your ask (data sharing, cross-promo, or co-content).

---

## JUNE 2026 PIPELINE — ⚠️ HISTORICAL (snapshot as of May 27; most events now past)

> Kept for reference only. June drops were never posted (publishing gap). For the live pipeline, run a fresh scan and read the Google Sheet. Next planned post is the **July** drop (Post 11) — see Current Status above.


| ID | Tournament | Dates | State | Prize | Closes | Platform | Priority |
|---|---|---|---|---|---|---|---|
| MTPB-0066 | 1 Utama Pickleball 2026 | May 30–Jun 7 | KV | RM39K | 29 May ⚠️ | Instagram | 3 |
| MTPB-0029 | Alliance Bank Malaysia Open | Jun 5–7 | KV | RM129.5K | 1 Jun | Baseline | 1 — THE PICK |
| MTPB-0032 | ISEIGUR CUP | Jun 6–7 | KV | RM44.9K | 28 May ⚠️ | Sportssync | 2 |
| MTPB-0033 | Syok Pickle Golden Master (70+) | Jun 6 | KV | RM3.3K | 3 Jun | Sportssync | 3 |
| MTPB-0046 | He Rallies! Combined DUPR 6.2 | Jun 7 | Penang | RM1.75K | 4 Jun | SWP | 3 |
| MTPB-0030 | Oriental Daily News Open | Jun 12–14 | KV | RM120K | 10 Jun | Baseline | 1 — THE PICK |
| MTPB-0035 | DAIKIN x 91 Club | Jun 13–14 | KV | RM51.3K | 1 Jun | Sportssync | 2 |
| MTPB-0036 | LAC Pickleball Championship | Jun 13 | KV | RM37.9K | 2 Jun | Sportssync | 2 |
| MTPB-0037 | EMPTA Pickleball Tournament | Jun 13 | KV | RM10.8K | — | Sportssync | 3 |
| MTPB-0048 | 91 National Johor Tour | Jun 13 | Johor | RM20.5K | Once Full | Baseline | STRONG PICK |
| MTPB-0038 | Lions Cup Charity | Jun 14 | Johor | RM13.6K | 11 Jun | Sportssync | 3 |
| MTPB-0039 | Pickle Vibe Clash of Elites | Jun 14 | KV | RM13.5K | 13 Jun | Sportssync | 3 |
| MTPB-0040 | AmBank Malaysia Championship | Jun 19–21 | KV | RM66K | 1 Jun | Sportssync | 1 — THE PICK |
| MTPB-0049 | Pickle Collective Team Cup | Jun 19–21 | Sabah | RM23.5K | 10 Jun | Baseline | WORTH KNOWING |
| MTPB-0054 | Court of Hearts Charity | Jun 20 | Penang | Charity | 31 May | Sportssync | 3 |
| MTPB-0055 | Paddle Power Cup | Jun 20 | Johor | RM3.8K | 15 Jun | Sportssync | 3 |
| MTPB-0065 | Pickle Power Superstar Cup | Jun 20 | Penang | RM3K | 20 Jun | SWP | 3 |
| MTPB-0041 | JBFA Pickleball Tournament | Jun 21 | Johor | RM8.7K | 14 Jun | Sportssync | 3 |
| MTPB-0042 | DinkFest by HNC | Jun 27 | Johor | RM18.3K | 20 Jun | Sportssync | 3 |
| MTPB-0043 | Picklefy 1st Anniversary | Jun 27–28 | KV | RM54.8K | 20 Jun | Sportssync | 2 |
| MTPB-0050 | MBSA Shah Alam Open | Jun 27–28 | KV | RM20K | 15 Jun | Baseline | WORTH KNOWING |
| MTPB-0056 | END POLIO NOW Charity | Jun 27 | Johor | RM8.4K | 13 Jun | Sportssync | 3 |

**June total: 22 open · RM692,403 in prizes**
*(MTPB-0034 6.6.6 excluded — reg deadline expired 25 May)*

## CHANGELOG (old claude.md)

*MyTournament.PB · Every tournament. One place.*
*claude.md v1.8 · June 19, 2026 — status synced: June drops abandoned (gap continued), Post 11 reassigned to the July drop (APP Asia THE PICK), followers 112→173 + reach stats added, June pipeline marked historical, sheet tasks marked done, automation-agents direction noted; ThePickleBase closed (met May 28, no follow-up) — proceeding independent at ~2–5 hrs/wk as Claude usage allows*
*claude.md v1.9 · August 24, 2026 — data-ops pass: `tournament-ops` skill built (replaces scan-tournaments/check-deadlines/draft-editorial), SWP scanning discontinued, Event Type/Skill Level rendering-bug root cause found and fixed across 37 rows, Sportssync register-URL bug fixed sheet-wide, EGH calendar Gantt bug fixed, Data Validation issue flagged (unresolved). Content/social status block above is NOT refreshed this pass — still reflects Jun 19.*
