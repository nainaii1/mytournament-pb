# 🔁 WORKFLOWS — MyTournament.PB

Your step-by-step playbook. For each recurring job: when to use it, whether to start a new
session, exactly what to type, which agent runs, and what you get back.
*Last updated: 19 June 2026*

---

## 📏 Golden rules (read once)

1. **Always work inside this project folder.** Open Claude Code here — your master context
   (`brand/claude.md`) loads automatically. You do **not** need to paste it every time.
   - Exception: in **Cowork / claude.ai** sessions (e.g. carousel rendering), paste
     `brand/claude.md` at the start so it has full context.
2. **New session vs continue:** start a **new session per distinct job** (a scan, a post, a
   feature). Keeps context clean and fast. Only "continue" if it's the same job.
3. **The data chain — do these in order:**
   `1 Scan -> 2 Organize sheet -> 3 Draft content -> 4 Carousel`
   Content is only as good as the sheet. Scan and tidy the sheet **before** drafting.
4. **The sheet is the source of truth.** Agents hand you a CSV/XLSX to import; you paste it in.
   Claude never writes to your Google Sheet directly.
5. **Website work is always branch -> PR -> merge.** Never edit `main` directly. The partner-board
   PR stays open until the Google Form exists (see workflow 5).
6. **To run a skill, type its slash command** (e.g. `/scan-tournaments`). To use an agent, just
   describe the job in plain English — Claude picks the right agent. You can also name it.

---

## 1. Scan tournaments

**Goal:** find tournaments on Sportssync / Baseline / SWP that aren't in your sheet yet.
**Cadence:** Monday + Thursday (your sweep schedule).

| | |
|---|---|
| **Session** | New session |
| **Type this** | `/scan-tournaments`  *(or: "scan for new tournaments")* |
| **Runs** | `tournament-scraper` agent + `scan-tournaments` skill |
| **You get** | A list of NEW tournaments not in your sheet + an importable CSV (`posts/exports/new-tournaments-<date>.csv`) + a manual-check list for anything it couldn't auto-verify |
| **Next step** | Go to workflow 2 to clean + import them |

**Bonus:** `/check-deadlines` -> "which tournaments are closing soon" — a prioritised urgency list.

---

## 2. Organize the Google Sheet (get an XLSX/CSV to paste in)

**Goal:** clean the tracker (fix deadlines, formats, missing fields) and/or turn scan results
into rows you can import.

| | |
|---|---|
| **Session** | Continue from the scan, **or** new session |
| **Type this** | `"sweep my sheet"`  *(or: "audit my tracker", "clean my data")* |
| **Runs** | `sheet-sweeper` agent |
| **You get** | A corrected `.xlsx`/`.csv` + a **changelog** of every edit it made |
| **Next step** | In Google Sheets: **File -> Import -> Append**, and **untick "convert text to dates"** (keeps your `DD-Mon-YYYY` format). Then the website updates on next page load. |

> WARNING: The agent never touches your live sheet — you stay in control by importing manually.

---

## 3. Draft / brainstorm content

**Goal:** turn tournament info into a post idea, angle, and full caption package.
**This is your most-used workflow.** <- *the example you asked about*

| | |
|---|---|
| **Session** | New session |
| **Type this** | See prompt below |
| **Runs** | `admin-pb-social` agent (knows your voice, franchises, caption structure) |
| **You get** | Post angle + hook + IG caption + Stories plan + Threads + Facebook + hashtags |
| **Next step** | If it's a carousel, take the brief to workflow 4 |

**Copy-paste prompt (brainstorm content from tournament info):**
```
Brainstorm content for this week's drop based on my tournament sheet.
Read the live sheet first. Suggest 2-3 post angles (with franchise + which
tournaments), then draft the full package for the strongest one.
```

**Or target a specific event:**
```
Draft a Tournament Drop for [Tournament Name]. Read the sheet for its details
first. Give me the angle, IG caption, 3 Stories, Threads, and Facebook copy.
```

> ACCURACY RULE: always tell it to **read the sheet first**. Every figure (prize, venue,
> dates) must come from the sheet — not memory, not a web summary. If a fact isn't in the sheet,
> it should flag it as unverified, not guess.

---

## 4. Create the carousel (slide PNGs)

**Goal:** produce the 6-7 slide PNGs (1080x1350) from a drafted brief.

| | |
|---|---|
| **Session** | New session — **in Cowork / claude.ai (Claude Design)**, not Claude Code |
| **Step 1 (here)** | In Claude Code: `admin-pb-social` writes the **carousel brief** (slide-by-slide spec). Save it under `posts/`. |
| **Step 2 (Claude Design)** | Open a Cowork/claude.ai session, **paste `brand/claude.md`**, then paste the brief and say: `"Build these slides as 1080x1350 PNGs per the brand spec."` |
| **You get** | The slide PNGs (Python + Pillow, fonts at `/home/claude/work/fonts/`) |
| **Next step** | **Upload from your phone** (web upload crops the canvas) + post the caption from 3 |

**Why two tools:** Claude Code drafts the words/spec; Claude Design renders the images. Keep the
brief in `posts/` so the design session has everything it needs.

---

## 5. Code / develop the website

**Goal:** add or fix something on mytournamentpb.com.
**Remember:** the root `index.html` / `app.js` / `style.css` **are** the live site.

| | |
|---|---|
| **Session** | New session |
| **Type this** | `"I want to [add/fix X] on the website."` Then ask it to **plan first.** |
| **Runs** | Claude Code directly (uses planning + code-review agents under the hood) |
| **Flow** | 1. It proposes a plan -> you approve. 2. It works on a **branch**. 3. Opens a **PR**. 4. After you're happy, it **merges to `main`** -> Cloudflare auto-deploys. |
| **You get** | A live change at mytournamentpb.com within ~1 min of merge |

**Copy-paste prompt:**
```
I want to add [feature] to the website. Plan it first, show me the plan, then
work on a branch and open a PR. Don't merge until I confirm.
```

> PARTNER BOARD ON HOLD: PR #5 stays open until you create the Google Form and replace
> `PARTNERS_FORM_URL` in `app.js`. Steps: `docs/partner-board-setup.md`.

---

## 6. Brainstorm marketing

**Goal:** growth ideas, campaigns, positioning, what to post to grow followers.

| | |
|---|---|
| **Session** | New session |
| **Type this** | See prompt below |
| **Runs** | Marketing + brainstorming skills |
| **You get** | A sharp back-and-forth + a concrete plan (channels, hooks, cadence, experiments) |

**Copy-paste prompt:**
```
Be my marketing sparring partner. Goal: grow MyTournament.PB from ~112 to 500
IG followers. Read brand/claude.md and docs/roadmap.md first. Challenge my
assumptions, then give me 3 concrete experiments I can run this month.
```

---

## 7. Brainstorm product

**Goal:** new website features, player tools, directions for the brand/product.

| | |
|---|---|
| **Session** | New session |
| **Type this** | See prompt below |
| **Runs** | `product-management:brainstorm` (thinking-partner mode) |
| **You get** | Stress-tested ideas, trade-offs, and a recommended next step (not a yes-man) |

**Copy-paste prompt:**
```
Be my product thinking partner. Read docs/roadmap.md first. I'm considering
[idea]. Pressure-test it: who's it for, is it worth building no-backend, and
what's the simplest version? End with a clear recommendation.
```

> When you decide to build something, hand the conclusion to workflow 5.

---

## Quick reference

| I want to... | Start | Type |
|---|---|---|
| Find new tournaments | New session | `/scan-tournaments` |
| Clean my sheet / get import file | New session | `"sweep my sheet"` |
| Check urgent deadlines | New session | `/check-deadlines` |
| Brainstorm / draft a post | New session | `"brainstorm content from my sheet"` |
| Write editorial for sheet rows | New session | `/draft-editorial` |
| Build carousel slides | New (Claude Design) | paste brief -> `"build these slides"` |
| Add/fix website | New session | `"add [X], plan first, branch + PR"` |
| Marketing ideas | New session | `"be my marketing sparring partner..."` |
| Product ideas | New session | `"be my product thinking partner..."` |

---

*Open `START-HERE.md` for the file map · `brand/claude.md` for full context.*
*MyTournament.PB · Every tournament. One place.*
