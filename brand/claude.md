# MyTournament.PB

A faceless Malaysian pickleball tournament calendar and media brand. The
persona is **Admin PB**, the invisible group-chat admin who checks every
platform so players don't have to. Mike runs it ~2–5 hrs/week.

## Where things are
| Need | File |
|---|---|
| Brand, colours, logo, carousel spec, voice, content types | `brand/brand-kit.md` — read before any design or social work |
| Scanning, sheet fields, verification rules | `.claude/skills/tournament-ops/` (SKILL.md + REFERENCE.md) |
| Data sources, full sheet schema, website history, past status | `docs/project-notes.md` |
| Direction and what's next | `docs/roadmap.md` · `docs/rebuild-plan.md` |
| Step-by-step recurring jobs | `WORKFLOWS.md` |

## The Google Sheet is the source of truth
- Read it before any content or data work:
  `https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg/gviz/tq?tqx=out:csv&sheet=Tournaments`
- Never write to the sheet (Claude's sheet writes are also blocked by the
  permission check). New or changed rows go into a CSV at
  `posts/new-tournaments-{date}.csv`; Mike imports it (File → Import →
  Upload → Append to current sheet, with "Convert text to numbers, dates
  and formulas" left **ticked**). Unticking stores dates as text, and the
  gviz feed blanks text dates, so the site can't show those events.
- After every import, check the gviz feed (not just the sheet) for blank
  dates before saying done. Fix for text dates: `docs/project-notes.md`.
- Dates are `DD-Mon-YYYY` (e.g. `1-Jul-2026`), not ISO.
- Sportssync is on `.asia` (the `.net` domain is dead). Sports We Play
  scanning was discontinued on 24 Aug 2026.

## The website
- mytournamentpb.com, served by Cloudflare Pages straight from the GitHub
  `main` branch of `nainaii1/mytournament-pb`. Anything pushed to `main`
  goes live, and every file in this repo is publicly reachable.
- `index.html`, `style.css`, `app.js` and `assets/` are the live site;
  don't move them. Plain HTML/CSS/JS reading the sheet's gviz feed.
- Website changes go branch → PR → merge.

## Public copy rules
- Never say "Malaysia's #1", "ESPN of pickleball" or "premier destination".
- Never promise a specific posting date in slide copy.
- Link mytournamentpb.com in CTAs.

## Status (checked 11 Oct 2026)
- Last content post: Post 10 on 30 May. Post 11 brief exists
  (`posts/2026-07_post-11_app-asia-penang/brief.md`) but was never built.
  Follower and reach figures in the notes are from 19 Jun and unverified.
- Last data work: 9–11 Oct. Scanned Sportssync (via Chrome, no block) and
  Baseline; imported 32 verified rows MTPB-0144..0180
  (`posts/import-ready-2026-10-10.csv`); fixed dates on MTPB-0138
  (PickleSmash, postponed to 14–15 Nov) and MTPB-0140 (Regal Rally, 27–29
  Nov). Live site showed 33 upcoming events on 11 Oct.
- Last website change: PR #10 (11 Oct), mobile header no longer overflows.
- Open items waiting on Mike:
  - Held-back rows in `posts/new-tournaments-2026-10-09.csv`: MTPB-0145
    Sabah Open and 0146 Battle of the Sexes (Baseline says "Date to be
    announced"), 0154 Brunei and 0179 Singapore (overseas, non-RM prizes),
    0168 DDPSC (no state on page).
  - Partner Board: create the Google Form + `Partners` tab, set
    `PARTNERS_FORM_URL` in `app.js`, merge PR #5.
  - Sheet: Data Validation on `Age Group` and `Reg Deadline` wipes values
    like "35+" and "Closed" on import.
  - Optional tidy of past rows (3–93): 10× `KL/SGR` state, 3 multi-week
    spans, one `US$50,000` prize.
