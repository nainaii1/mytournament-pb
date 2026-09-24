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
- Never write to the sheet. New or changed rows go into a CSV at
  `posts/new-tournaments-{date}.csv`; Mike imports it (File → Import →
  Append, untick "convert to dates").
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

## Status (checked 25 Sep 2026)
- Last content post: Post 10 on 30 May. Post 11 brief exists
  (`posts/2026-07_post-11_app-asia-penang/brief.md`) but was never built.
  Follower and reach figures in the notes are from 19 Jun and unverified.
- Last data work: 24 Aug (scan, sheet fixes, `tournament-ops` skill).
- Open items waiting on Mike:
  - Partner Board: create the Google Form + `Partners` tab, set
    `PARTNERS_FORM_URL` in `app.js`, merge PR #5.
  - Sheet: Data Validation on `Age Group` and `Reg Deadline` wipes values
    like "35+" and "Closed" on import.
  - Confirm `posts/new-tournaments-2026-08-24.csv` was imported.
