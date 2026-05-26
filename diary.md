# MyTournament.PB — Captain's Log

Running daily record of what happened, what was decided, and what's next.
Format: newest entry at the top.

---

## May 26, 2026 (Mon) — Day 26

**What happened:**
- Followers hit **112** on Instagram 🎯 — up from ~12 on May 19. Significant jump, likely from Post 7 (Worth the Bag?) and Post 8 (Empire Nextgen).
- Major website upgrade shipped to mytournamentpb.com:
  - **Filter drawer** (mobile): bottom sheet slides up from "Filters" button. Month, Location, Skill Level, Sort — all in one panel. Badge shows active filter count.
  - **Sticky sidebar** (desktop ≥1024px): 240px persistent left sidebar, always visible. Filters apply instantly.
  - **Calendar + About views**: sidebar/drawer auto-hides — clean full-width layout.
  - **About tab**: third nav tab with Who We Are, How It Works, and Find Us sections.
- Updated `brand/claude.md` to v1.2 — follower count, post count, website features, content calendar.
- ThePickleBase meeting prep done — created `docs/picklebase-meeting-prep.md` with full script.

**Key numbers to know for May 28 meeting:**
- Followers: 112
- Posts: 8 published
- Tournaments tracked: ~45+ in sheet
- Website: live at mytournamentpb.com with search, filter, calendar, about

**Next actions:**
- [ ] Post 9: Website Launch post (May 27 or after ThePickleBase meeting May 28)
- [ ] ThePickleBase meeting Thu May 28, 10am — read `docs/picklebase-meeting-prep.md`
- [ ] PB Wrapped — Sun Jun 1 (May recap + June pipeline)
- [ ] Post 10: Alliance Bank Malaysia Open — Fri Jun 6

---

## May 23, 2026 (Sat) — Day 23

**What happened:**
- Added favicon to website — SVG Court Mark (32×32, Court Green bg, white lines, amber ball) in `favicon.svg`. Linked in `index.html` with apple-touch-icon fallback. Shows in browser tab on Chrome/Safari/Firefox.
- Added state filter chips to website — auto-builds from live sheet data. Chips appear below month row (All · KL/SGR · Penang · Johor etc). Wired into `init()` and resets on calendar mode switch. Reuses `month-tab` CSS.
- Removed stats strip (stats bar below header) — founder decision: players looking for tournaments don't care about aggregate numbers.
- Removed OG/Twitter meta tags — premature for current audience size.
- All changes committed and pushed to GitHub. Auto-deployed to mytournamentpb.com via Cloudflare Pages.
- Designed Post 7 — "Worth the Bag? Team ROI Edition". 8-slide IG carousel covering 3 team events (Iconic Cup 2026, Putrajaya Team Event 2026, The Dink MiLP @ Wing Hin Sports). ROI analysis: entry fee vs prize payout per player, cross-bracket breakdown for MiLP.
- MiLP key insight: DUPR 16 (7 teams, 80% payout) and 50+ (8 teams, 70% payout) brackets are hidden gems — small field, high payout ratio. Not +1,471% ROI but statistically closest to podium.
- Written MD brief `posts/post7-worth-the-bag.md` for Claude Design. Full 8-slide spec with chart specs, typography, colours, admin notes.
- Post 7 reviewed from Claude Design PDF output — all 8 slides approved. Posting tomorrow afternoon.
- Wrote full social media package: IG caption, Threads, Facebook, 3 Stories plan, song guide (Lagu Raya vibes / hype tracks), marketer checklist.
- Brainstormed website launch timing. Recommendation: Admin Notes stories as soft seed Sun May 25 → proper website launch post Fri May 30 (day after ThePickleBase meeting May 28) → keeps Alliance Bank (Jun 6) as its own Tournament Drop.
- Updated `brand/claude.md` v1.1 — domain, website live status, content calendar, new franchise, ThePickleBase section.
- Created `docs/roadmap.md`.

**Key decisions:**
- "Worth the Bag?" confirmed as a permanent franchise (9th type, not one-off)
- Website launch post = Fri May 30, not post 8 = Jun 6 (separate events)
- PB Wrapped pushed to Sun May 31 or removed — low priority now that site is live

**Next actions:**
- [ ] Post 7 tomorrow afternoon (phone upload, IG first, Threads + FB same day)
- [ ] Stories: tease with Story 1 (poll "masuk or skip?") 1-2 hrs before post
- [ ] Add song to Reel if using music
- [ ] Admin Notes story Sun May 25 — soft-seed website (don't announce, just show it)
- [ ] ThePickleBase meeting prep: numbers, pitch, ask (Thu May 28)
- [ ] Website launch post Fri May 30
- [ ] Update Linktree to include mytournamentpb.com

---

## May 22, 2026 (Fri) — Day 22

**What happened:**
- Post 6 published — Tournament Drop "May + June Panoramic" ✅ Streak 2/3.
- Fixed platform dot colours in website to match actual brand logos: Sportssync = `#2B5873` (teal/slate from logo), Baseline = court-green, SWP = rally-amber.
- Fixed weekend column shading in calendar view — changed from amber tint to neutral deep-court tint `rgba(13,31,26,0.04)`. Amber-on-amber was washing out SWP bars.
- Fixed "Reg closed" button visual — changed from near-transparent grey to court-green at 62% opacity, matching the open "Register" button. Same component, two states.
- Updated calendar legend dots to match new bar colours.
- All fixes committed and pushed to GitHub. Auto-deployed to mytournamentpb.com.

**Key decisions:**
- Domain bought as `mytournamentpb.com` (not `.my`) via Cloudflare. DNS auto-configured. SSL live within minutes.
- Website at mytournamentpb.com fully working with live sheet data.

**Next actions:**
- [ ] Post 7 "Worth the Bag?" — design brief and carousel

---

## May 20, 2026 (Tue) — Day 20

**What happened:**
- Updated sheet ID across all brand files (BrandSpec_v3.md × 1, claude.md × 2) from old ID to `1fBi6Mxz0pY8IFCP9hhLWB_R_i9J7obMEA5YoA6PkpDg`
- Website at nainaii1.github.io already has correct sheet ID in app.js — data loading issue is NOT the sheet ID, likely JavaScript parsing or Google Sheet not published to web
- Live sheet confirmed public and readable via gviz endpoint (40 tournaments, May–Jul)
- Planning Friday post: "Worth It or Not?" targeting Men's Doubles Novice <3.0 audience with ISEIGUR CUP as the pick
- Decision pending: buy mytournamentpb.my domain before May 28 ThePickleBase meeting

**Next actions:**
- [ ] Build "Worth It or Not?" carousel — Men's Doubles <3.0, ISEIGUR CUP as pick (for Thu/Fri posting)
- [ ] Post 6 live on Fri May 22 (IG + Threads + FB + 3 Stories)
- [ ] Closing Soon for EMPTA (closes May 22 — TODAY is last chance to push it)
- [ ] Buy mytournamentpb.my domain + connect Cloudflare Pages
- [ ] Fix website data loading (investigate JS error or publish-to-web setting in Sheet)
- [ ] Prep ThePickleBase meeting May 28 — know your numbers

---

## May 19, 2026 (Mon) — Day 19

**What happened:**
- Organizer from Reclub DM'd requesting their tournament be posted. Created a Story in brand spec format and published on IG Stories, Threads, and Facebook. First organizer-initiated contact.
- ThePickleBase (@thepicklebase) DM'd — said they love what we're building and want to connect on a potential collaboration. They are Southeast Asia's pickleball lifestyle platform (coaching, courts, gear, news, tournaments). Founder also owns BASE Pickleball and Padel court in KL.
- Replied to ThePickleBase, confirmed meeting: **Thursday May 28, 10am, PJ or Kuchai** (their choice of venue).
- Reorganized project folder structure with Claude Code (brand/ data/ posts/ archive/).
- Post 6 slides (7 slides, May+June panoramic drop) confirmed ready for posting.

**Status:**
- Streak: 2/3 (Post 6 goes live Fri May 22 = streak 2/3 if posted → actually this is streak 2)
- Followers: ~12
- Website: live at https://nainaii1.github.io/mytournament-pb/ but data not loading (JS issue)

**Key decisions:**
- Meeting ThePickleBase May 28. Going in as a potential data/content partner, not a competitor.
- Diary file created here to track daily progress going forward.

**Next actions:**
- [ ] Post 6 live on Fri May 22 (IG + Threads + FB + 3 Stories)
- [ ] Post Closing Soon for EMPTA (closes Fri May 22)
- [ ] Fix website data loading issue (tournaments not showing, "Last updated: loading…")
- [ ] Prep for ThePickleBase meeting May 28 — know your numbers, your pitch, your ask

---

<!-- Add new entries above this line, oldest entries stay at the bottom -->
