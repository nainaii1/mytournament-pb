---
name: check-deadlines
description: >
  Use this skill when the user says "check deadlines", "which tournaments are closing soon",
  "flag urgent registrations", "what's closing this week", "deadline check",
  "registration closing soon", "what do I need to register for now", or
  "remind me of upcoming registration closes".
  Fetches the live Google Sheet, identifies tournaments with imminent or passed deadlines,
  and produces a prioritised action list.
---

# Check Registration Deadlines

You are auditing the MyTournament.PB Google Sheet for registration deadline urgency.
Your output is a clear, prioritised action list the operator can act on immediately.

## Data Source

Fetch the live CSV:
`https://docs.google.com/spreadsheets/d/1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg/gviz/tq?tqx=out:csv&sheet=Tournaments`

Row 0 = title row (skip). Row 1 = headers. Subsequent rows = tournaments.

Only process rows where **Status = "Verified" or "Published"**.

Today's date is available via the system context (or ask the user if unsure).

## Deadline Classification

For each tournament's `Reg Deadline` field:

| Condition | Category | Urgency |
|-----------|----------|---------|
| Empty / blank | `UNKNOWN` | Low — flag for follow-up |
| `"Closed"` or `"Once full"` (case-insensitive) | `CLOSED` | Already closed |
| Past date (before today) | `EXPIRED` | Should be marked Closed |
| Today | `CLOSING TODAY` | 🚨 URGENT |
| 1–3 days from today | `CLOSING SOON` | 🔴 HIGH |
| 4–7 days from today | `THIS WEEK` | 🟡 MEDIUM |
| 8–14 days from today | `NEXT WEEK` | 🟢 LOW — worth noting |
| 15+ days | `OPEN` | No action needed |

## Output Format

### Section 1: Action Required (sorted by deadline, soonest first)

Only include CLOSING TODAY, CLOSING SOON, THIS WEEK, and EXPIRED categories here.

For each:
```
🚨 [MTPB-XXXX] Tournament Name
   Deadline: [date] ([N days away / TODAY / EXPIRED])
   Prize Pool: RM[X] | Entry Fee: RM[X]
   Register: [URL or "no URL in sheet"]
   Status in sheet: [Verified / Published]
```

### Section 2: EXPIRED — Needs Status Update

List any tournaments where Reg Deadline is a past date but Status is NOT "Closed".
These need the operator to:
1. Change `Reg Deadline` to `"Closed"` in the sheet, OR
2. Confirm registration is actually still open (some events extend deadlines)

```
⚠️  [MTPB-XXXX] Tournament Name
    Deadline was: [date] ([N days ago])
    Action: Update sheet — change Reg Deadline to "Closed" if confirmed closed
```

### Section 3: UNKNOWN Deadlines

Tournaments where `Reg Deadline` is empty or TBC:
```
❓ [MTPB-XXXX] Tournament Name
   Start Date: [date]
   Action: Find and add registration deadline
   Check: [Registration URL if available]
```

### Section 4: Summary

```
📊 Deadline Summary (as of [TODAY'S DATE])
   🚨 Closing today:     [N]
   🔴 Closing in 1–3d:   [N]
   🟡 Closing in 4–7d:   [N]
   🟢 Next 8–14 days:    [N]
   ✅ Open (15+ days):   [N]
   ⚠️  Expired (not closed): [N]
   ❓ Unknown deadline:  [N]
```

## What to Check While You're At It

If you notice any of these while scanning, flag them at the end under **"Other Issues Found"**:

- Tournaments with `Status = "NEW"` that have deadlines within 14 days — these should be Verified/Published urgently
- Tournaments where `Start Date` has already passed but `Status` is not "Completed" or "Closed"
- Tournaments with no `Registration URL` in the sheet but deadline is approaching (player has nowhere to go)

## What NOT to do

- Don't modify the sheet — output only
- Don't guess at closed/open status if the deadline field is empty — mark as UNKNOWN
- Don't include tournaments with Status = "NEW" or "Draft" in the urgency counts (they're not live yet) — but do flag them separately if they have imminent deadlines
