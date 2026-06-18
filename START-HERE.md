# 🏓 START HERE — MyTournament.PB

Your map to this project. Open this first in any new session.
*Last tidied: 19 June 2026*

---

## 📌 Key files to review (the important stuff)

| File | What it is |
|------|-----------|
| [brand/claude.md](brand/claude.md) | **Master context.** Paste at the start of any new Claude/Cowork session to restore full context. Start here. |
| [WORKFLOWS.md](WORKFLOWS.md) | **How-to playbook.** Step-by-step for every recurring job (scan, sheet, content, carousel, website, marketing, product) — new session vs continue + exactly what to type. |
| [brand/brand-guidelines.md](brand/brand-guidelines.md) | **Brand spec v3** — voice, colours, content franchises, persona (Admin PB). The source of truth for how the brand looks and sounds. |
| [docs/roadmap.md](docs/roadmap.md) | **Roadmap** — current direction, what's next, resolved/open questions. Most up-to-date strategic doc. |
| [decision-log.md](decision-log.md) | **Decision log** — running record of what was decided and shipped, newest on top. |
| [docs/specs/2026-05-16-mytournament-pb-ui-design.md](docs/specs/2026-05-16-mytournament-pb-ui-design.md) | **UI design spec** — the website's design system and layout decisions. |
| [docs/specs/2026-05-20-prd-v1.md](docs/specs/2026-05-20-prd-v1.md) | **PRD v1** — ⚠️ historical artifact, frozen. Useful for origin context only, not maintained. |
| [README.md](README.md) | Public-facing project summary. |

---

## 📁 Folder map

| Folder | What lives here |
|--------|-----------------|
| **(root)** | The live website — `index.html`, `app.js`, `style.css`. ⚠️ **This IS mytournamentpb.com.** Don't move or delete these; Cloudflare serves them by path. |
| `assets/` | **All site images** the live site loads — `logo.svg` (web logo), `favicon.svg` (browser tab), `og-image.svg`. 🔒 Don't move these; `index.html` links them by path. |
| `brand/` | Two docs + the brand asset master. `brand-guidelines.md` = brand spec (voice, colours, visual system). `claude.md` = master session context (status, calendar, rules) — auto-loaded by Claude, don't rename. |
| `brand/assets/` | **Logo master** — `court_mark_500.svg`, the source Court Mark for profile pics, avatars, and post templates. (The site's smaller `assets/logo.svg` is exported from this — not a duplicate.) |
| `docs/` | Roadmap, specs, meeting notes, setup guides. |
| `docs/specs/` | PRD v1 (frozen) + UI design spec. |
| `posts/` | Social post assets — one folder per drop, named `YYYY-MM-DD_post-NN_slug` (e.g. `2026-05-22_post-06_iconic-cup/`). |
| `posts/exports/` | Data exports used to build posts (CSV/XLSX). |
| `.claude/` | Claude Code agents, skills, settings (local, gitignored). |

> **Folders are intentionally minimal: `brand` · `docs` · `posts` · `assets`.** Old versions live in
> GitHub history (the retired `archive/` folder was removed Jun 19). Working spreadsheets moved out of
> the repo to `../MyTournament.PB_local-backup/` — the live **Google Sheet** is the real data source.

---

## 🔑 Quick facts

- **Stack:** Vanilla HTML/CSS/JS — no frameworks, no build tools. Hosted on Cloudflare Pages.
- **Data layer:** A published Google Sheet, pulled via gviz CSV. The `.xlsx` files are private working copies.
- **Content engine:** Weekly Friday tournament drops, per the brand spec content franchises.

---

## 🧭 Common workflows

- **Starting a new Claude session?** → paste [brand/claude.md](brand/claude.md).
- **Writing a post / caption?** → check [brand/brand-guidelines.md](brand/brand-guidelines.md) for voice + franchises, drop assets in a new `posts/` folder.
- **Planning what's next?** → [docs/roadmap.md](docs/roadmap.md), then log the decision in [decision-log.md](decision-log.md).
- **Editing the website?** → work in root `index.html` / `app.js` / `style.css` only.
