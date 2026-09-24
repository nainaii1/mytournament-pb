# MyTournament.PB — Brand & content kit
*Moved word-for-word from brand/claude.md on 25 Sep 2026. Read this for any design, carousel, caption or social work.*

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
- Domain: mytournamentpb.com ← LIVE

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

## CONTENT FRANCHISES — 9 TYPES

| Franchise | Day | Format | Description |
|---|---|---|---|
| **Tournament Drop** | Friday | Carousel 6–7 slides | Flagship weekly post |
| **Closing Soon** | Tue/Thu when urgent | Single image or short carousel | 24–72hr before deadline |
| **Can Join Ah?** | Tuesday | Carousel | Beginner-friendly explainer |
| **Worth It or Not?** | Tuesday | Carousel | Prize vs entry fee editorial |
| **Worth the Bag?** | Tuesday | Carousel 8 slides | Team event ROI — entry fee vs prize breakdown by team/player |
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

**Linktree:** Update to add website link now that mytournamentpb.com is live. Order: Latest Post · mytournamentpb.com · Sportssync · Baseline · Sports We Play · DM on IG.

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
