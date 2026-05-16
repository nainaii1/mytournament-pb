# MyTournament.PB — UI Design Spec

**Date:** 2026-05-16
**Status:** Locked (pending user spec review)
**Stack:** Vanilla HTML/CSS/JS. No frameworks, no npm, no build tools. Hosted on Cloudflare Pages at `mytournamentpb.my`. Data lives in a published Google Sheet, pulled via gviz CSV.

---

## Context

Malaysia's pickleball scene has grown faster than its tournament infrastructure. Players currently find out about tournaments via fragmented Instagram posts, WhatsApp groups, and platform-specific listings (Sportssync, Baseline, etc.) — by the time they hear about an event, registration is often closed or full. The owner observed this firsthand: "by the time I posted the editorial pick, reg was already closed."

**The site's job:** be the one place an active Malaysian pickleball player can land to answer three questions in under 10 seconds:

1. What's closing for registration this week?
2. What's coming up that I can still register for?
3. Can I send this event to my group chat?

Editorial content (THE PICK, weekly digest, player notes) lives on Instagram (`@mytournament.pb`) where it belongs — the website itself is pure utility.

---

## Locked decisions

### Audience and personality

- **Primary user:** active player planning their tournament schedule.
- **Site personality:** utility tool, not magazine. No editorial heroes, no curatorial picks on site.
- **Tone:** clean, distinctive, Gen-Z without trying too hard. Restrained emoji use (one per section header, one in footer).

### Information shown per tournament

A tournament card surfaces:

- **Date block** (left): month + day-range, e.g. `MAY 22–24`. Single-day events show one day, e.g. `JUN 13`.
- **Tournament name** (Sora 700, two-line clamp).
- **Organizer · Venue · State** (one line, muted).
- **Reg deadline badge**, with three visual states:
  - **Closing soon** (≤7 days): amber background, lightning bolt prefix, "Closes [date] · [N days left]" or "Closes tomorrow · [date]".
  - **Open** (>7 days): light green tint, "Closes [date] · [N days left]".
  - **Closed (before tournament starts)**: grey, "Reg closed · Tournament starts in [N days]".
  - **Closed (tournament currently running)**: grey, "Reg closed · Happening now".
- **Entry / Prize** pair (key + tabular-number value).
- **Skill chip(s)**, outlined pill with a colour dot. Supports multi-skill events (stack vertically): `Novice <3` (green dot), `Intermediate <3.5` (amber), `Advanced <4.0` (orange), `Open` (black). For combined-cap events, a small `(combined 6.099)` subtext appears below the chip so the player sees both the bucket and the organizer's actual cap.
- **Event-type pills**, filled mint-wash green: `MD` / `WD` / `XD` / `MS` / `WS` / `Team` / `Jr` / `Vet`. For mega tournaments with all brackets (WPC, PPA, APP), one bold green `ALL` pill replaces the list.
- **Register button** (court green) + **Share button** (outlined).
- For closed-reg cards: opacity 0.78, grey date block, disabled register button.

### Page structure

```
┌─ Header (sticky, blurred bg) ──────────────────────┐
│   Logo + wordmark · "Malaysia · Pickleball"        │
│   Right: 🔔 Notify me                              │
├─ Urgency strip (dark, full-width) ─────────────────┤
│   [N] tournaments closing this week         View → │
├─ Filter bar (sticky, horizontal-scroll chips) ─────┤
│   Sort: Reg deadline ▾  State (n) ▾  Skill ▾       │
│   Events ▾  Open reg only ●                        │
├─ Main ─────────────────────────────────────────────┤
│   ⚡ Closing this week                              │
│   [cards…]                                         │
│   📅 Coming up                                      │
│   [cards…]                                         │
│   🔒 Reg closed · still happening                   │
│   [closed cards… opacity dimmed]                   │
│                                                    │
│   Submit CTA (dark, amber button)                  │
├─ Footer ───────────────────────────────────────────┤
│   Logo · About · Submit · Instagram · FAQ · Email  │
│   Last updated · "Made with 🏓 in Malaysia"        │
└────────────────────────────────────────────────────┘
```

**Visibility rules:**

- Tournaments where `Status = "Verified" | "Published"` are shown.
- Tournaments where the **End Date** is in the past are **hidden entirely**.
- Tournaments with **closed reg but End Date still future** stay visible, in their own muted section.
- Default sort: nearest reg deadline (ascending).

### Filter & sort controls

| Chip | Type | Behaviour |
|---|---|---|
| `Sort` | Single-select sheet | `Reg deadline` (default) / `Tournament date` / `Prize pool (high→low)` / `Entry fee (low→high)` |
| `State` | Multi-select sheet | KL/SGR, Johor, Perak, Pulau Pinang, Pahang, Melaka, etc. (derived from data) |
| `Skill` | Multi-select sheet | Novice / Intermediate / Advanced / Open. A tournament matches a selected bucket if **any** of its parsed brackets falls in that bucket (so a multi-bracket event with Novice + Intermediate will appear under both filters). Events tagged `ALL` appear under every skill filter. |
| `Events` | Multi-select sheet | MD / WD / XD / MS / WS / Team / Jr / Vet |
| `Open reg only` | Direct toggle | Off by default; when on, hides the closed-reg section |

- **MVP interaction:** the `Sort` chip opens a native `<select>` (single-value, accessible by default, minimal JS). The `Open reg only` chip is a direct binary toggle (no menu). The multi-select chips (`State`, `Skill`, `Events`) are Phase 2 and will use a bottom-sheet dialog with checkboxes.
- When `Open reg only` is on, the entire `🔒 Reg closed · still happening` section is hidden; the other two sections keep their cards. When off (default), all three sections render.
- Active filters show a small amber count badge on the chip (e.g. `State (2)`).
- Active sort chip uses the dark filled style; idle chips are white with thin border.
- The bar is horizontally scrollable — adding new filter chips later won't break layout.
- Per UX rule §2: every chip has min-height 36px and at least 8px gap from its neighbour.

### Skill-level parsing rules (data layer)

The `Skill Level` cell in the sheet is free-text that can contain canonical labels, raw DUPR numbers, "Combined" notation, or comma-separated combinations. The data layer parses each value and maps it to a **canonical bucket** for display and filtering.

**Canonical buckets:** `Novice <3` · `Intermediate <3.5` · `Advanced <4.0` · `Open` · `ALL`

**Parsing rules (in order):**

1. Split the raw string on commas. Trim each fragment. Drop empty fragments (handles trailing commas).
2. For each fragment, normalize case and match in priority order:
   - Contains `ALL` (case-insensitive) → `ALL`
   - Contains `Open` (case-insensitive) → `Open`
   - Starts with `Novice` or has cap `<3` (and no other number > 3) → `Novice <3`
   - Starts with `Intermediate` or has cap `<3.5` → `Intermediate <3.5`
   - Starts with `Advanced` or has cap `<4.0` (or `<4`) → `Advanced <4.0`
   - Bare numeric like `2.799`, `5.899`, `6.099`:
     - If number ≤ 4.5 → individual cap → map by `<3` / `<3.5` / `<4.0` / `Open` boundaries
     - If number > 4.5 → combined cap → divide by 2, then map by the same boundaries; preserve the original number as `combinedCap` metadata for display.

**Bucket boundaries (for both individual and divided-combined values):**

| Value | Bucket |
|---|---|
| `< 3.0` | Novice <3 |
| `3.0 ≤ x < 3.5` | Intermediate <3.5 |
| `3.5 ≤ x < 4.0` | Advanced <4.0 |
| `≥ 4.0` | Open |

The parser returns `[{bucket, combinedCap?}, ...]` — duplicates are deduped (e.g. a sheet value `Combined 5.899, 2.799` resolves to a single Novice chip rather than two).

### Skill-rating explainer ("?" affordance)

A small `?` icon sits beside the `Skill` filter chip. Tap → opens a bottom-sheet (or, on desktop, a small popover) with the following content. Same explainer is also linked from the footer FAQ.

> **How skill caps work**
>
> Tournaments cap who can register based on DUPR rating:
> - **Novice** — players rated under 3.0
> - **Intermediate** — under 3.5
> - **Advanced** — under 4.0
> - **Open** — no cap, anyone welcome
>
> Some doubles tournaments use a **combined cap** (e.g. `6.099`) — that's the sum of both partners' DUPRs. Divide by 2 to see the average level (here, ~3.0 = Intermediate).
>
> Not sure of your DUPR? Check [dupr.com](https://dupr.com).

The sheet should preserve the organizer's original notation (e.g., `5.899`, `Combined <6.099`) so we can display it as subtext under the canonical chip. The data layer does NOT rewrite the sheet — it parses for display only.

### Branding tokens

| Token | Value | Use |
|---|---|---|
| `--court-green` | `#1A6B4A` | Primary buttons, logo bg, event pills accent |
| `--deep-court` | `#0D1F1A` | Body text, urgency strip bg, submit CTA bg |
| `--rally-amber` | `#F0A500` | Urgent reg badge, urgency count, submit button, accent bars |
| `--mint-wash` | `#E8F5EF` | Card date block bg, event pills bg |
| `--off-white` | `#F5F5F0` | Page bg, header bg (with blur) |
| `--mid-green` | `#6BAF8C` | Muted text, secondary links |

Fonts: **Sora** 400/600/700/800 (headings, dates, numbers) · **DM Sans** 400/500/600/700 (body). Loaded from Google Fonts with `font-display: swap`.

### Logo

Located at `assets/logo.svg`. A 500×500 square: green background (`#1A6B4A`), three white horizontal lines with decreasing length and stepped opacity (1.0, 0.72, 0.50), amber ball (`#F0A500`) anchored to the end of the bottom line. Reads as "tournament list with action point." Used at 32×32 in the header, 24×24 in the footer, both wrapped in an 8px-radius container.

### Share behaviour

The Share button calls `navigator.share()` if available (mobile native share sheet) with `{title, text, url}` where `url` is a deep link like `/?id=MTPB-0005` anchoring to that card. Fallback: copy the URL to clipboard and toast "Link copied."

### Submit tournament

The "Submit tournament →" CTA opens a Google Form (URL to be supplied by the owner). For now, it can be a `mailto:` placeholder.

### "Notify me" button

For MVP, this links to the Instagram profile (`https://instagram.com/mytournament.pb`). Email notification system is out of scope.

---

## Implementation phasing

**MVP (this build)**

- Render cards from `app.js` data layer (already built).
- Three sections (Closing this week / Coming up / Reg closed).
- Past-end-date hiding.
- Default sort by reg deadline.
- Sort chip (functional dropdown — sheet or `<select>`-style menu).
- `Open reg only` toggle.
- Share button via `navigator.share()` + clipboard fallback.
- Sticky header, urgency strip, filter bar, submit CTA, footer.
- Logo wired in.

**Phase 2 (after MVP works)**

- State filter (multi-select).
- Skill filter (multi-select).
- Event-type filter (multi-select).
- Filter chips with count badges.

**Phase 3 (needs sheet schema additions, not in this build)**

- `Min Fee (RM)` column on the sheet → enables entry-fee sort.
- Per-category champion prize columns → enables ROI badge (`10× max ROI`).
- Optional search box.
- Email notification signup.

---

## Component map (files)

Per the original 4-file goal:

| File | Status | Responsibility |
|---|---|---|
| `index.html` | Currently minimal shell — needs build | Full page DOM scaffold, mount points for header / urgency / filter / sections / submit / footer |
| `style.css` | Doesn't exist yet | All visual styling, brand tokens as CSS variables, mobile-first responsive |
| `app.js` | Built (data layer); needs render + interactions | `fetchTournaments()` exists. Add: render functions, section bucketing, filter/sort state, share handler, scroll-anchor handler |
| `assets/logo.svg` | Built | The lines + ball logo |

The mockups in `mockups/` directory (`cards-v3.html`, `page-v4.html`) are reference designs only — the production code lives in the 4 files above.

---

## Accessibility & quality bar

- All touch targets ≥36px height (chips, buttons), ≥44px for primary CTAs.
- Visible focus rings on all interactive elements.
- Body text ≥14px (cards use 12.5px for metadata which is acceptable but should be reviewed at implementation).
- Foreground/background contrast ≥4.5:1 on body text; the amber-on-amber-tint badge needs verification — implementer should test this with a contrast tool.
- All animations 150–300ms, use only `transform` / `opacity`, respect `prefers-reduced-motion`.
- No layout shift on font load: `font-display: swap` plus reserved space for the logo and date blocks.
- `aria-label` on icon-only buttons (the share button uses `⤴` glyph + `aria-label="Share"`).
- Sheet-based filter dialogs (Phase 2) must support keyboard navigation and ESC-to-dismiss.

---

## What this spec deliberately does NOT cover

- The implementation plan (steps, file diffs, function signatures) — that comes from the writing-plans skill next.
- Sheet schema changes for Phase 3 (separate task once MVP ships).
- Analytics or pageview tracking (out of scope).
- Multi-language support (single-language English MVP).
- Light/dark mode (light only for MVP).
- Submission backend (Google Form is sufficient for MVP).

---

## Verification (how we'll know it's done)

1. Open `mytournamentpb.my` on a phone-shaped viewport. See header, urgency strip showing real `closing this week` count, filter bar.
2. Scroll: see 3 sections with real tournaments from the sheet. ~3–4 cards visible per phone scroll height.
3. Tap a chip: filter/sort applies, URL stays clean (no jarring jumps).
4. Tap `Share` on a card: native share sheet appears (mobile) or "Link copied" toast (desktop).
5. End-date-past tournaments do not appear anywhere.
6. Closed-reg tournaments appear muted in their own section.
7. Loading takes <2s on a typical mobile connection; no layout shift after fonts load.
8. Run the page through Lighthouse on mobile: target ≥90 on Performance and Accessibility.
