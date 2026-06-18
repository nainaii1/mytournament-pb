# Partner Matching Board — Setup Guide

*One-time setup for the **Partners** tab on mytournamentpb.com.*

Once this is done, players submit listings through a Google Form, you approve the good ones, and they appear on the site automatically. No coding, no backend — same pattern the rest of the site already uses (Google Sheet → site).

> **Status:** Code shipped on branch `feat/partner-matching-board` (PR #5, open). This guide covers the founder steps still pending: create the Form, add the public tab, set `PARTNERS_FORM_URL`, then merge PR #5.

---

## How it works (the pattern)

```
Player submits Google Form
        ↓
Private "Form Responses" sheet  (you alone see phone / contact)
        ↓   you mark a row "Approved"
Public "Partners" tab           (bridged via QUERY / IMPORTRANGE — approved rows only)
        ↓
Website reads the public tab    (gviz CSV, like every other section)
```

Private contact details never reach the web. Only approved, sanitised rows are bridged to the public tab. Contact is handled via **Reclub username only** — no phone numbers or IG handles are ever published.

---

## Step 1 — Create the Google Form

Fields to collect:

- **Name / handle** (display name)
- **DUPR rating** (number — drives the "Your DUPR" match highlight)
- **Looking for** — tournament-specific *or* general
- **Tournament** (if tournament-specific; otherwise blank)
- **Type** — e.g. Men's / Women's / Mixed doubles
- **Reclub username** (the only contact field shown publicly)
- **Note** (optional, short)

Set the form to write responses to a new Google Sheet (the **private responses sheet**).

## Step 2 — Add the public `Partners` tab

In the master site sheet, add a new tab named **`Partners`**. Bridge approved rows from the private responses sheet into it with `IMPORTRANGE` + `QUERY`, pulling **only** rows you've marked Approved and **only** the public-safe columns (drop anything sensitive; keep Reclub username as the contact).

Add an **auto-expiry** rule so stale listings drop off — e.g. filter the QUERY to rows where the listing date (or tournament date) is within the active window.

## Step 3 — Wire the site to the tab

In `app.js`, set `PARTNERS_FORM_URL` to your published Form link (the "Post a listing" button points here). Confirm the site reads the `Partners` tab via the same gviz CSV approach as the other sections.

## Step 4 — Approve flow (your weekly habit)

1. New submissions land in the private responses sheet.
2. Review each one; mark good listings **Approved**.
3. The public `Partners` tab updates automatically; the site picks it up on next load.

## Step 5 — Go live

Merge **PR #5** (`feat/partner-matching-board`) to `main`. The Partners tab and "Post a listing" CTA go live on the next Cloudflare deploy.

---

## The card (what players see)

DUPR-first cards with a **"Your DUPR"** compatibility highlight, plus filters: **DUPR band · event · type · search**. Listings auto-expire. Contact is **Reclub username only**.

---

*Reference: see `brand/claude.md` → Partner Board and `docs/roadmap.md` → Partnerships for current status.*
