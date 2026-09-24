---
name: scan-tournaments
description: >
  Use this skill when the user says "scan for new tournaments", "check Sportssync for tournaments",
  "find missing pickleball events", "weekly tournament scan", "what tournaments did we miss",
  "update the tournament list", or "check Baseline / SWP for new events".
  Scans the three Malaysian pickleball platforms, compares against the master Google Sheet,
  and returns a structured CSV of new tournaments not yet in the sheet.
---

# Scan Tournaments

You are performing the MyTournament.PB tournament scan. Find every upcoming Malaysian
pickleball tournament across the three platforms, cross-reference the master Google Sheet,
and surface what's missing.

## Master Sheet Reference

Google Sheet ID: `1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg`
CSV fetch URL: `https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg/gviz/tq?tqx=out:csv&gid=407357464`

### LIVE SHEET SCHEMA — verify against the actual sheet header before every scan

Columns, in order (27 columns):

`Status | ID | Tournament Name | Organizer | Title Sponsor | Start Date | End Date | Reg Deadline | State | Venue | Entry Fee (RM) per team | Prize Pool (RM) | Cash Prize (RM) | Merch Value (RM) | Prize Pool Note | Skill Level | Event Type | Age Group | Pick Priority | Editorial Angle | Format Note | Player Note | Source Platform | Registration URL | Date Added | Last Checked | Notes`

- **Date format is `DD-Mon-YYYY`** (e.g. `1-Jul-2026`), NOT ISO. Match the sheet exactly.
- First column is `Status` (values: Published · Verified · Draft; leave blank for new finds — the founder marks it).
- `State` convention: `Klang Valley` covers KL + Selangor. Otherwise use the state name (Penang, Johor, Melaka, Perak, Sabah, Kelantan…).
- IDs are `MTPB-XXXX`. Find the highest existing ID; new finds increment from there.

> ⚠️ The schema above can drift. ALWAYS fetch the live header row first and reconcile.
> If columns differ from this list, follow the LIVE sheet and flag the mismatch to the user.

## Platforms — CANONICAL URLs (keep these in sync with brand/claude.md)

### 1. Sportssync  ← PRIMARY, richest data
- **List page:** `https://www.sportssync.asia/tournament/index`
- **Individual page:** `https://www.sportssync.asia/tournament/{id}` (numeric, e.g. `/tournament/249`)
- ✅ The `.asia` domain is correct. `.net` is DEAD — never use it.
- 🚫 **IP-BLOCK RULE (critical):** ONLY fetch Sportssync via Exa (`web_fetch_exa` /
  `web_search_exa`), which runs from a remote IP. **NEVER hit sportssync.asia with local
  `curl`, WebFetch, or Playwright** — those run from the founder's home IP and a burst of
  page-clicks got that IP firewall-blocked (403) on 13-Jun-2026. The list page too: if Exa
  can't read it, ask the founder rather than scraping locally. Keep all Sportssync load remote.
- **Method that works:** individual tournament pages return full structured detail
  (fee, prize breakdown, categories, reg deadline, reg link) via Exa `web_fetch_exa`.
  Use `web_search_exa` ("[tournament name] sportssync.asia") to find the numeric `/tournament/{id}`,
  then fetch that page for the detail. Direct browser/curl on detail pages can 403 — prefer Exa fetch for detail pages.

### 2. Baseline  ← second platform (NOT the same as SWP)
- **List page:** `https://my.baseline.live/tournaments` (mirror: `https://baseline.my/tournaments`)
- **Individual page:** `https://my.baseline.live/tournaments/{uuid}` (UUID, e.g. `/tournaments/0e82a152-...`)
- ⚠️ The **list page is a lazy-loading SPA** — fetchers only catch "Loading…"; it defaults to
  Global, not Malaysia. Do NOT rely on scraping the list directly.
- **Method that works:** `web_search_exa` ("[tournament] baseline.my Malaysia") surfaces the
  individual UUID pages, which DO return full detail via `web_fetch_exa`. Fetch each one.
- Hosts: 91 Club series, Alliance Bank, Skechers, Oriental Daily, VS Group, MATTA.

### 3. Sports We Play (SWP)  ← use the hidden REST API
- **Site:** `https://swp.solemas.com/tournament` (Flutter UI — NOT scrapeable, ignore it)
- ✅ **SWP has a public JSON REST API at `solemas.com/swp_rest/` — use it directly via WebFetch.**
  The Flutter front-end is a canvas with no DOM, but it loads data from these endpoints:
  - **List (all MY tournaments):** `POST https://solemas.com/swp_rest/player/tournament_v2/tournament_list/all_tournament?{params}`
  - **Detail (name/dates/organizer/reg deadline):** `GET https://solemas.com/swp_rest/player/tournament_v2/tournament_details/{tournamentID}?{params}`
  - **Categories (fees/events):** `GET https://solemas.com/swp_rest/player/tournament_v2/tournament_details/tournament_categories?{params}&tournamentID={id}&offSet=0`
  - **Common `{params}`:** `appVersion=2.726.0&platformCode=web_player&userType=player&deviceName=chrome&hardwareName=macOS&deviceOS=macOS&deviceType=web&region-code=MY&lang=en`
  - `{tournamentID}` is the `T...` code in the page URL (`/tournament_details/T1780626124341MUUPXRXSTH`).
  - To find the tournamentID from a user-supplied SWP link, read the `T...` segment of the URL.
  - If the API ever stops responding, THEN fall back to asking the user for a screenshot.
- ⚠️ **API changes (observed 12-Jun-2026):** the list endpoint `POST .../tournament_list/all_tournament` returns HTTP 500 via curl (app moved to appVersion 2.726.0). **Working list method:** load `swp.solemas.com/tournament` in Playwright, click Flutter's "Enable accessibility" button, scroll, read the aria-label semantic tree. Detail + categories GET endpoints still work. Tours (multi-event series): `GET .../tournament_tour/tournament_tour_details?tourID={TOUR-id}` and `GET .../tournament_tour/tournament_tour_stops?tourID={TOUR-id}&offSet=0`.
- Hosts: ICONIC Cup, Legends Rally, He Rallies, BADGEAR, Pickle Power, P.LAB Cup, Bellevue (Kuching).

## Scan Process

1. **Fetch the live sheet CSV first.** Parse it, confirm the header matches the schema above,
   build a set of existing tournament names (lowercase, trimmed) + the highest MTPB ID.
2. **Scan each platform** using the method noted above. Collect upcoming events (start date ≥ today).
3. **Drill into individual pages** for every candidate new event — that's where fee/prize/link live.
   A name+date from a list or aggregator alone is NOT enough; it produces useless `TBC` rows.
4. **Cross-reference** against the sheet (fuzzy: ignore case, "2025"↔"2026", minor word order;
   same organizer + same date = same event even if the name differs).
5. **Flag new tournaments** — anything not in the sheet.

## Output Format

1. **ALREADY IN SHEET** — one-line confirmation + count, note any data corrections needed
   (e.g. a reg-deadline in the sheet that's now wrong vs the live page).
2. **NEW TOURNAMENTS FOUND** — write a **CSV file** to `posts/new-tournaments-{YYYY-MM-DD}.csv`
   using the LIVE schema column order and `DD-Mon-YYYY` dates, so the founder imports via
   **File → Import → Append → untick "convert text to numbers/dates"**. Do NOT hand back a
   tab block to paste — pasting has failed before; deliver an importable file.
   - `Status` blank, `Date Added` / `Last Checked` = today, `TBC` for anything genuinely
     not yet published (far-future events with no reg page — say so explicitly, don't pretend
     it's a scan miss).
3. **NEEDS MANUAL CHECK** — list anything a tool couldn't reach (esp. SWP) with the URL to check.

## What NOT to do

- Don't use dead URLs. Sportssync = `.asia/tournament/index`, Baseline = `my.baseline.live/tournaments`, SWP = `swp.solemas.com`.
- Don't confuse Baseline and SWP — they are different platforms.
- Don't add events with a past start date.
- Don't produce name-only `TBC` rows when an individual page exists — drill in and get the detail.
- Don't assume Pick Priority / Editorial Angle — leave blank for the founder.
- Don't modify the Google Sheet directly. Output a CSV file only.
- Don't silently drop SWP because it's hard — flag it for manual check.
