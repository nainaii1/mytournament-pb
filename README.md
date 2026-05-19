# MyTournament.PB

Malaysia's independent pickleball tournament calendar. Every verified tournament, one place.

**Live site:** [mytournamentpb.my](https://mytournamentpb.my) · **Instagram:** [@mytournament.pb](https://instagram.com/mytournament.pb)

---

## What it does

- Lists all upcoming Malaysian pickleball tournaments pulled live from a Google Sheet
- Filters by month (May / Jun / Jul) and skill level (Novice / Intermediate / Advanced / Open)
- Flags registration deadlines closing within 7 days
- Links directly to registration on Sportssync, Baseline, and SportsWePlay

## Stack

Vanilla HTML + CSS + JavaScript. No frameworks, no build tools, no dependencies.

| File | Purpose |
|------|---------|
| `index.html` | Page structure and filter bar |
| `style.css` | Design system and component styles |
| `app.js` | Data fetch, filtering, rendering, state |
| `assets/logo.svg` | Court Mark logo |

**Data source:** Google Sheets (published as CSV via gviz endpoint). The sheet is the single source of truth — update the sheet, the site updates on next page load.

## Running locally

Open `index.html` directly in a browser — no server needed. The Google Sheet is publicly readable so the data fetch works from `file://`.

## Deployment

Hosted on GitHub Pages. Every push to `main` deploys automatically.

Production domain (Cloudflare Pages + custom domain) coming soon at `mytournamentpb.my`.

## Data

Tournaments are tracked in a private Google Sheet. Only rows with `Status = Verified` or `Published` appear on the site. The Excel source file is excluded from this repo (`.gitignore`) — the live sheet is the deployed data layer.

## Not affiliated

Independent calendar. Not affiliated with any tournament organiser, platform, or governing body. Tournament data is publicly available and verified before listing.

---

*Made with 🏓 in Malaysia · © 2026 MyTournament.PB*
