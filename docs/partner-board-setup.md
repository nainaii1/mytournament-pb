# Partner Matching Board — Setup Guide

This is the one-time setup for the **Partners** tab on mytournamentpb.com. Once done, players
submit listings through a Google Form, you approve the good ones, and they appear on the site
automatically. No coding.

**Time needed:** ~30–40 minutes, once.

---

## How it works (the important bit: privacy)

```
Player fills Google Form  ─►  PRIVATE responses sheet   (only YOU can see this — incl. their private contact)
                                      │  you type "yes" in the Approve column on good ones
                                      ▼
                              PUBLIC "Partners" tab        (in your existing tournaments spreadsheet)
                              pulls ONLY approved rows, and ONLY the safe columns
                              (the private contact is NEVER copied here)
                                      ▼
                              Website shows the approved listings
```

**Why two sheets?** Your tournaments spreadsheet is public — anyone can read it. So the private
contact (phone/IG) must live in a *separate, private* sheet that the website never touches. The
formula in Part C is written so the private contact column is never pulled across. This is the
whole reason for the two-sheet setup — don't shortcut it.

---

## Part A — Create the Google Form

1. Go to [forms.google.com](https://forms.google.com) → **Blank form**. Name it
   *"MyTournament.PB — Find a Partner"*.
2. Add these questions **in this exact order** (order matters — the formula in Part C depends on it):

   | # | Question | Type | Notes |
   |---|----------|------|-------|
   | 1 | Display Name | Short answer | First name or nickname is fine |
   | 2 | Reclub Username | Short answer | "How do people find you on Reclub?" |
   | 3 | Your DUPR rating | Short answer | e.g. 2.94 |
   | 4 | DUPR Source | Multiple choice | options: `Official DUPR`, `Self-estimate` |
   | 5 | Gender | Multiple choice | options: `Male`, `Female` |
   | 6 | Looking For | Checkboxes | options: `Men's Doubles`, `Women's Doubles`, `Mixed Doubles` |
   | 7 | Desired partner DUPR | Short answer | e.g. `2.5-3.2`, `<3.0`, `3.5+`, or `Any` |
   | 8 | State / Area | Short answer | e.g. Klang Valley, Penang, Johor |
   | 9 | Post Type | Multiple choice | options: `Tournament`, `General` |
   | 10 | Which tournament? | Short answer | only if Tournament — type the tournament name |
   | 11 | Tournament date | Short answer | optional — `YYYY-MM-DD`. If it's in our calendar, the site fills this in automatically |
   | 12 | Note | Paragraph | "Anything else? e.g. my partner is busy, I play weekends" |
   | 13 | Private contact (we keep this private) | Short answer | "Phone or IG — only admin sees this, never shown publicly" |

3. Top-right **Settings** → make sure "Collect email addresses" is **off** (keeps it low-friction).
4. Click the **Responses** tab → green Sheets icon → **Create a new spreadsheet**. Name it
   *"Partner Form Responses (PRIVATE)"*.
   - ⚠️ **Do NOT share this sheet with anyone or make it public.** This is the private side.

---

## Part B — Add the "Approve" column

1. Open the **Partner Form Responses (PRIVATE)** sheet.
2. The form created columns A–N (A = Timestamp, then your 13 questions = B–N).
3. In the **next empty column (O)**, type the header **`Approve`** in row 1.
4. To publish a listing, type **`yes`** in its Approve cell. Leave blank to keep it hidden.

That's your moderation switch. Nothing with a blank Approve ever reaches the website.

---

## Part C — Create the public "Partners" tab + the bridge formula

1. Open your **existing public tournaments spreadsheet** (the one the website already reads).
2. Add a new tab at the bottom and name it **exactly** `Partners` (capital P, no spaces).
3. In **row 1**, type these 13 headers across A1:M1 **exactly** (copy-paste this line into A1 and
   use *Data → Split text to columns* if needed):

   ```
   Display Name	Reclub Username	DUPR	DUPR Source	Gender	Looking For	Desired DUPR	State	Post Type	Tournament	Tournament Date	Note	Posted Date
   ```

4. Click cell **A2** and paste this formula. Replace `PASTE_PRIVATE_SHEET_URL` with the full URL
   of your **Partner Form Responses (PRIVATE)** sheet:

   ```
   =QUERY(
     IMPORTRANGE("PASTE_PRIVATE_SHEET_URL","Form Responses 1!A2:O"),
     "select Col2,Col3,Col4,Col5,Col6,Col7,Col8,Col9,Col10,Col11,Col12,Col13,Col1 where lower(Col15)='yes' format Col12 'yyyy-mm-dd', Col1 'yyyy-mm-dd'",
     0)
   ```

5. The first time, you'll see `#REF!` with an **"Allow access"** prompt — click it once to connect
   the two sheets. Approved rows now appear automatically.

   - The formula pulls columns 2–13 + the timestamp (as Posted Date). **Column 14 (Private
     contact) is never selected — it stays private.** Column 15 (Approve) is only used to filter.
   - If your form's response tab isn't named "Form Responses 1", change that part of the formula
     to match (check the tab name at the bottom of the private sheet).

---

## Part D — Put the form link on the site

1. In your form, click **Send** → the link (🔗) icon → **Copy** the short `https://forms.gle/...`
   link.
2. In the website code, open **`app.js`**, find this line near the top:

   ```js
   const PARTNERS_FORM_URL = "https://forms.gle/REPLACE_WITH_YOUR_FORM";
   ```

   Replace the placeholder with your real form link. Save, commit, and the "Post a listing →"
   button will open your form.

---

## Part E — Your weekly routine (2 minutes)

1. Open **Partner Form Responses (PRIVATE)**.
2. Read any new rows. For genuine, appropriate posts → type **`yes`** in the **Approve** column.
3. Done. The site updates within a minute. (The private contact lets you sanity-check a real
   person or follow up if something's off — never paste it anywhere public.)

---

## Good to know

- **Auto-expiry:** Tournament listings disappear after the tournament date. General listings
  fade after 30 days. The board stays fresh on its own.
- **Tournament dates auto-fill:** if a "Which tournament?" name matches one in your calendar, the
  site shows that tournament's real date — even if the player left the date blank.
- **"Your DUPR" matching:** visitors type their own rating and listings looking for *their* level
  get a "Good match for you" highlight and jump to the top.
- **Privacy double-check:** open
  `https://docs.google.com/spreadsheets/d/<your-sheet-id>/gviz/tq?tqx=out:csv&sheet=Partners`
  in a browser. You should see the listings **without** any private contact column. If you ever
  see a phone/IG there, stop — the formula was edited wrong (it must never select Col14).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Board says "No partner listings yet" | Normal until you approve a row (Approve = `yes`) and the `Partners` tab has data. |
| `#REF!` in the Partners tab | Click the cell → "Allow access" to connect the two sheets. |
| Columns look shifted on the site | Row 1 headers in the `Partners` tab must match Part C exactly, in order. |
| A listing won't disappear after its tournament | Check the tournament date is a real date (`YYYY-MM-DD`) or that the tournament name matches the calendar. |
| Private contact showing on the site | The formula was edited to include Col14 — revert to the Part C formula immediately. |
