# MyTournament.PB — claude.md
**Master context for Claude Code · Cowork · new sessions**
*Last updated: May 15, 2026*

Paste this at the start of any new Claude session or Claude Code project to restore full context instantly. No re-explaining needed.

---

## WHO I AM

I'm building **MyTournament.PB** — a faceless Malaysian pickleball tournament calendar and media brand. I aggregate every tournament from Sportssync, Baseline, and Sports We Play into weekly social media drops. The persona is **Admin PB** — the invisible group-chat admin who checks every platform so players don't have to.

**I am not a coach, pro player, or developer.** I use AI for everything — content, design, code, strategy. Non-technical background. Budget RM200–500/month. Available 3–5 hours/week. Give me production-ready output only. Skip explanations unless I ask.

---

## BRAND IDENTITY

| | |
|---|---|
| Brand name | MyTournament.PB |
| Public tagline | *We stalk tournaments so you don't have to.* |
| Supporting line | *Every tournament. One place.* |
| Public positioning | The tournament plug for Malaysian pickleball |
| Internal positioning | Malaysia's #1 pickleball tournament calendar (never say this publicly) |
| Persona | Admin PB — invisible group-chat admin |
| Founded | May 2026 · Kuala Lumpur |

**Handles:**
- Instagram: @mytournament.pb
- Facebook: @mytournamentpb
- TikTok: @mytournament.pb
- Threads: @mytournament.pb
- Email: mytournamentpb@gmail.com
- Linktree: linktr.ee/mytournamentpb
- Domain: mytournamentpb.my (not yet live)

---

## BRAND TOKENS — USE EXACTLY

```python
# Colors
COURT_GREEN  = "#1A6B4A"  # primary — all backgrounds, buttons, covers
DEEP_COURT   = "#0D1F1A"  # dark bg — urgency posts only
RALLY_AMBER  = "#F0A500"  # accent ONLY — logo ball, THE PICK tag, urgency labels, slide numbers
MINT_WASH    = "#E8F5EF"  # light card surfaces
OFF_WHITE    = "#F5F5F0"  # page/slide backgrounds (cream)
MID_GREEN    = "#6BAF8C"  # secondary text, admin notes, muted elements

# Amber rule: appears MAX once per slide except in logo ball. Never as body text.
# Cover slides: Court Green bg. Urgency/Closing Soon: Deep Court bg.
```

```css
/* Web */
--court-green:  #1A6B4A;
--deep-court:   #0D1F1A;
--rally-amber:  #F0A500;
--mint-wash:    #E8F5EF;
--off-white:    #F5F5F0;
--mid-green:    #6BAF8C;
--font-heading: 'Sora', sans-serif;
--font-body:    'DM Sans', sans-serif;
```

**Fonts:** Sora (all headings, English only) · DM Sans (body, captions, Malay text)
**Google Fonts:** `family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700`

---

## LOGO — COURT MARK

Three stacked rounded rectangles, left-aligned, with an amber circle at the end of the bottom line.

```
████████████████████████████████  ← Line 1: LONGEST · white · opacity 1.0
█████████████████████             ← Line 2: SHORTEST · white · opacity 0.72
██████████████████████████  ●     ← Line 3: MEDIUM · white · opacity 0.50 · amber ball
```

**Canonical asset:** `brand/assets/court_mark_500.svg` — use for all profile pictures and avatar slots.

**SVG spec (500×500 canvas, Court Green bg):**
- Line 1: x1=80 → x2=390 · y=175 · stroke-width=36 · opacity 1.0 · white
- Line 2: x1=80 → x2=290 · y=268 · stroke-width=36 · opacity 0.72 · white
- Line 3: x1=80 → x2=330 · y=362 · stroke-width=36 · opacity 0.50 · white
- Amber ball: cx=400, cy=362, r=52, fill=#F0A500
- On dark backgrounds: lines are white. On light backgrounds: lines are Court Green.

**Pillow proportions (for carousel slide generation):**
- Line 1: width 310px, height 64px, radius 32px, opacity 1.0
- Line 2: width 210px, height 64px, radius 32px, opacity 0.72
- Line 3: width 250px, height 64px, radius 32px, opacity 0.50
- Gap between lines: 60px
- Amber ball: radius 52px, positioned at far-right end of Line 3, vertically centred, partially overlapping

**Carousel slide chrome:**
- Slide number: amber `01` top-left, Sora Bold 54px
- Label: letter-spaced all-caps DM Sans 22px beside the number
- Footer: `@mytournament.pb` centred at bottom, DM Sans 24px

---

## CAROUSEL SLIDES — BUILD SPEC

**Format:** 1080×1350px PNG portrait
**Builder:** Python + Pillow
**Fonts at:** `/home/claude/work/fonts/`
- `Sora-Variable.ttf` (variable font — use `set_variation_by_axes([weight])`)
- `DMSans-Variable.ttf` (variable — `set_variation_by_axes([opsz, weight])`)
- `DMSans-Italic-Variable.ttf`

**Padding:** 80px outer margin
**Upload rule:** Always upload from phone. Web upload crops the canvas.

**Slide colour system:**
- Hero/cover slides: Court Green bg
- Data/list slides: Off White bg
- Urgency/Closing Soon slides: Rally Amber bg
- Dark feature slides: Deep Court bg (use sparingly)

**Platform source pills on tournament list slides:**
Each tournament row must show a colour-coded platform pill:
- Sportssync: blue bg `E8F0FE` · dark blue text `1A3A8A`
- Sports We Play (SWP): orange bg `FEF3E8` · dark orange text `8A4A00`
- Baseline: green bg `E8F5E9` · Court Green text `1A6B4A`
- PPA Tour Asia: amber bg `FFF3CD` · dark amber text `8A6000`

---

## ADMIN PB — VOICE & PERSONA

Admin PB is the invisible character behind every post. Not a mascot, not a face — a tone.

**Admin PB is:** helpful and fast · slightly chaotic · very Malaysian · trustworthy · a player too · never cringe

**Voice rules:**
- English-first always. Malay as natural flavour only.
- Lowercase captions OK. Title-case slide headlines.
- No forced slang, no emoji spam, no corporate tone.
- One emoji max per line, used like punctuation.
- Direct and useful first. Cheeky second. Gen Z. 

**Caption structure (lock this in):**
```
[Hook — one line, lowercase OK]
[Useful details]
[Admin note]
[CTA]
```

**Core lines (rotate):**
- Every tournament. One place.
- We stalk tournaments so you don't have to.
- Admin checked. You scroll.
- Don't say nobody told you.
- Can join ah?
- Jom daftar.
- Save this. Thank admin later.

**Never say publicly:** "Malaysia's #1" · "ESPN of pickleball" · "premier destination"

---

## CONTENT FRANCHISES — 8 TYPES

| Franchise | Day | Format | Description |
|---|---|---|---|
| **Tournament Drop** | Friday | Carousel 6–7 slides | Flagship weekly post |
| **Closing Soon** | Tue/Thu when urgent | Single image or short carousel | 24–72hr before deadline |
| **Can Join Ah?** | Tuesday | Carousel | Beginner-friendly explainer |
| **Worth It or Not?** | Tuesday | Carousel | Prize vs entry fee editorial |
| **Partner Needed Board** | Wednesday | Story | Community partner matching |
| **Scene Check** | Ad hoc | Reel/carousel | Post-event recap |
| **Admin Notes** | Monday | Story | Behind-scenes transparency |
| **PB Wrapped** | Last day of month | Carousel | Monthly stats recap |

---

## EVERY CAROUSEL DELIVERY INCLUDES

When I ask you to build a post, deliver ALL of these:

1. **Slide PNG files** (6–7 slides, 1080×1350)
2. **IG caption** with hashtags (under 2200 chars, hook first)
3. **3 IG Stories** plan — what to post, when, what sticker/text
4. **Threads post** — shorter, conversational, not a copy-paste of IG
5. **Facebook post** — longer, more detail, emoji-friendly
6. **Hashtag set:** #pickleballmalaysia #pickleballmy #malaysiapickleball + event-specific tags

**Linktree:** Keep simple — Latest Post · Sportssync · Baseline · Sports We Play · DM on IG. Update on website launch, not before.

---

## DATA SOURCES & SWEEP SCHEDULE

| Platform | URL | Notes |
|---|---|---|
| Sportssync | sportssync.asia/events | Primary — most listings |
| Baseline | my.baseline.live | 91 Club, Alliance Bank, Skechers |
| Sports We Play (SWP) | swp.solemas.com | ICONIC Cup, Legends Rally |
| Reclub | — | Leads only, always verify independently |

**Sweep schedule:** Monday + Thursday
**Master tracker:** Google Sheet (live, public read)
`https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg`

**ALWAYS read this sheet at session start before any content or data work.**
Fetch via gviz: `https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg/gviz/tq?tqx=out:csv&sheet=Tournaments`


---

## TRACKER SCHEMA

Columns (in order): Status · ID · Tournament Name · Organizer · Title Sponsor · Start Date · End Date · Reg Deadline · State · Venue · Entry Fee (RM) · Prize Pool (RM) · Cash Prize (RM) · Merch (RM) · Prize Pool Note · Skill Level · Event Type · Pick Priority · Editorial Angle · Format Note · Player Note · Source Platform · Registration URL · Date Added · Last Checked · Notes

**Note:** City column was removed by founder. Platform label on slides replaces city.

**Status values:** Published · Verified · NEW · Draft
**Pick Priority:** `1 — THE PICK` · `2 — Feature` · `3 — List` · `— Mention only`
**Date format:** YYYY-MM-DD throughout

---

## CURRENT STATUS (May 15, 2026)

**Posts published:** 5
- Post 1: About Us / brand intro
- Post 2: Week 1 debut digest (14 tournaments, RM246K)
- Post 3: The Problem (why Admin PB exists)
- Post 4: Mid-May Calendar digest (13 tournaments)
- Post 5: PPA Tour Asia KL Open · live this week ← latest

**Followers:** 12 (followed by @officialminorleaguepb_mas — strong signal)
**Streak:** 1/3 Friday drops complete
**Active channels:** Instagram · Facebook · Threads

**Content calendar:**
| Post | Date | Franchise | THE PICK |
|---|---|---|---|
| Post 6 | Fri May 22 | Tournament Drop | ICONIC Cup 2026 · Penang · RM39.6K |
| Post 7 | Fri May 29 | PB Wrapped | May recap + June pipeline tease |
| Post 8 | Fri Jun 6 | Tournament Drop | Alliance Bank Malaysia Open · RM129.5K |
| Post 9 | Fri Jun 13 | Tournament Drop | Oriental Daily News Open · RM120K+ |
| Post 10 | Fri Jun 20 | Tournament Drop | AmBank Malaysia Open · RM66K |

**3-streak target:** May 29 (Post 7 = streak 3/3 → website build unlocked)

---

## WEBSITE BUILD PLAN

**Gate:** 3 consecutive Friday posts → unlocks Phase 0 build (target: weekend of May 31–Jun 1)

**Stack:** Vanilla HTML + CSS + JavaScript. No frameworks. No npm. No build tools.
**Data:** Google Sheet → gviz JSON endpoint. Live on page refresh.
**Hosting:** Cloudflare Pages (free tier) at mytournamentpb.my
**Files:** `index.html` · `style.css` · `app.js` · `assets/logo.svg`

**Phase 0 scope (build first, nothing else):**
- Tournament list sorted by start date
- State filter dropdown
- Week filter chips (This Week / Next Week / All)
- Closing Soon amber strip (auto-shows when deadline ≤7 days)
- Tournament card (name · dates · venue · prize · entry fee · platform pill · register link)
- THE PICK / FEATURED badge logic
- Dimmed cards for closed/expired reg
- Mobile-first (390px)
- Footer with IG/FB/TikTok/email links

**Phase 0 does NOT include:** search · map · user accounts · organiser self-submit · category filter · CMS
**Phase 1:** Supabase + category/skill filter
**Phase 2:** Leaflet.js map pins
**Phase 3:** Organiser self-submit form

**Sheet ID:** `1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg`

---

## CATEGORY TAXONOMY (player-facing)

| Label | DUPR singles | DUPR combined |
|---|---|---|
| Novice | <3.0 | <6.0 |
| Intermediate | <3.5 | <7.0 |
| Advanced | <4.0 | <8.0 |
| Advanced+ | <4.5 | — |
| Open | no cap | no cap |

---

## JUNE 2026 PIPELINE (for context)

| ID | Tournament | Dates | Prize | Platform | Priority |
|---|---|---|---|---|---|
| MTPB-0029 | Alliance Bank Malaysia Open | Jun 5–7 | RM129.5K | Baseline | 1 — THE PICK |
| MTPB-0030 | Oriental Daily News Open | Jun 12–14 | RM120K+ | Baseline | 1 — THE PICK |
| MTPB-0032 | ISEIGUR CUP | Jun 6–7 | RM44.8K | Sportssync | 2 — Feature |
| MTPB-0035 | DAIKIN x 91 | Jun 13–14 | RM51.2K | Sportssync | 2 — Feature |
| MTPB-0036 | LAC Championship | Jun 13 | RM37.8K | Sportssync | 2 — Feature |
| MTPB-0040 | AmBank Malaysia Open | Jun 19–21 | RM66K | Sportssync | 1 — THE PICK |
| MTPB-0043 | Picklefy Anniversary | Jun 27–28 | RM54.8K | Sportssync | 2 — Feature |

---

## RULES FOR CLAUDE

1. **Always read the Google Sheet first** before any content or data work in a session.
2. **Production-ready only.** No placeholders, no "you can add X later," no incomplete code.
3. **Mobile-first always.** Every design decision defaults to 390px phone first.
4. **Deliver the full rollout package** — slides + caption + stories + Threads + Facebook.
5. **Platform pills on every tournament list slide** — colour-coded Sportssync/Baseline/SWP.
6. **Court Green for all carousel covers.** Deep Court only for urgency/Closing Soon.
7. **Amber is accent only** — never body text, never backgrounds except Closing Soon slides.
8. **Logo is Court Mark only** — no text-based logo, no variations.
9. **Dates in tracker:** YYYY-MM-DD format. Reg Deadline = "Closed" or "Once full" when applicable.
10. **Never promise specific posting dates** in slide copy — streak not yet proven beyond 1/3.
11. **Never say "Malaysia's #1"** in any public-facing copy.
12. **Skip basic explanations** — founder has full context from prior sessions.

---

*MyTournament.PB · Every tournament. One place.*
*claude.md v1.0 · May 15, 2026*
