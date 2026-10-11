# Application readiness: Claude for Startups

Status as of 9 Oct 2026. Only things that are true today are claimed. Items still to do are marked.

## 1. Company description (for the form, ~120 words)

MyTournament.PB (mytournamentpb.com) is a free calendar of pickleball tournaments in Malaysia. Players currently check several platforms to find events, dates, entry fees and registration deadlines; we collect them in one place, verify each listing against its source, and flag deadlines that are closing. The site is live and runs on Cloudflare Pages, reading from a Google Sheet that we maintain. We also run an Instagram account, @mytournament.pb. [FILL IN: real follower or traffic numbers, with the date you checked them. Leave out if you have none.] We are building a Claude-powered ingestion pipeline that turns raw listing text into structured tournament data and drafts short player-facing notes from verified facts only. Revenue is not live yet. We plan optional paid featured listings for organisers. [FILL IN: team size and location.]

## 2. How we use Claude (3 sentences)

We build and maintain the product with Claude Code: the site, our weekly scan and data-audit workflows, and our content drafting all run as Claude Code skills and agents. At runtime, a server-side pipeline calls the Claude API (Haiku 5.5 to extract structured fields from listing text, Sonnet 5.5 to draft short notes using only the extracted facts), with schema validation, a daily call cap, token logging and a human-approval hold for low-confidence results. Nothing the pipeline produces reaches the public site until a person merges the pull request that contains it. [FILL IN: only after your first real run, add what it produced, e.g. "N listings processed".]

## 3. Readiness checklist

| Item | Done? |
|---|---|
| Live public site at mytournamentpb.com | Done |
| Clear description of what it does (About tab) | Done |
| How it makes money, stated honestly as planned | Done |
| Real tournament data in the sheet | Done: refreshed 9-11 Oct 2026 (33 upcoming events on 11 Oct) |
| Claude API feature: code written, 10 tests passing with mocked responses | Done |
| Claude API feature: run once against the real API | Not done (needs your key) |
| Feature visible on the live site | Partly: About-tab section is live and shows an honest "building" message until the first real notes exist |
| API key kept out of code (.env gitignored, .env.example added, GitHub secret for the scheduled job) | Done in code; key itself not created yet |
| Scheduled job (weekly GitHub Action, opens a PR) | Written, not yet run. Needs the repo secret + one repo setting |
| Company email on your own domain (hello@mytournamentpb.com) | Done: tested, forwards to the founder's Gmail |
| Claude Console account (organization created with the domain email) | Done |
| Application submitted at platform.claude.com/offers/startups-application | Done, 11 Oct 2026 (see section 5) |
| Paid API credits bought | No, deliberately. Awaiting program decision |
| Dedicated About/Contact URLs, sitemap | Not done (About is a tab on the home page) |
| Partner Board live | Not done (not needed for the application) |

## 4. Your steps (only you can do these)

### A. Merge the code (5 min)
1. In Terminal, in the project folder:
   ```bash
   git push -u origin feat/claude-ingestion
   ```
2. Open the link GitHub prints, click **Create pull request**, then **Merge pull request**. Cloudflare redeploys automatically in about a minute.

### B. Company email on your domain (20 min)
Assumes mytournamentpb.com's DNS is on Cloudflare. If it isn't, tell me and I'll adapt this.
1. Cloudflare dashboard, then pick **mytournamentpb.com**, then **Email**, then **Email Routing**, then **Get started**.
2. Create a custom address: `hello` and set the destination to your Gmail. Cloudflare emails that Gmail a verification link. Click it.
3. When Cloudflare offers **Add records and enable**, click it. This adds the DNS records for you:
   - 3 MX records: `route1.mx.cloudflare.net`, `route2.mx.cloudflare.net`, `route3.mx.cloudflare.net` (Cloudflare fills in the priorities)
   - 1 TXT record on the root: `v=spf1 include:_spf.mx.cloudflare.net ~all`
4. Test: from a different email account, send a message to `hello@mytournamentpb.com` and confirm it arrives in your Gmail (check spam once).
5. Optional: tell me the address and I'll replace the Gmail in the site footer and About page.

### C. Claude Console account and API key (10 min)
1. Go to platform.claude.com and sign up with `hello@mytournamentpb.com` (the verification email will arrive in your Gmail).
2. Open **Settings**, then **API keys**, then **Create key**. Name it `mytournament-pb`. Copy it once; it is shown only once.
3. Local test: create the file `pipeline/.env` containing one line, `ANTHROPIC_API_KEY=` followed by the key. This file is gitignored. Then run:
   ```bash
   cd pipeline && npm install && npm run dry-run
   ```
   Expect "would extract ..." lines and "API calls this run: 0".
4. Real run (a few cents): paste one real listing's text into a new file `pipeline/inbox/my-first-listing.txt`, then:
   ```bash
   npm start
   ```
   Check `data/ai-notes.json` and the new CSV in `posts/`.
5. Production: GitHub repo, then **Settings**, then **Secrets and variables**, then **Actions**, then **New repository secret**, name `ANTHROPIC_API_KEY`, paste the key. Also **Settings**, then **Actions**, then **General**, then tick **Allow GitHub Actions to create and approve pull requests**. Then **Actions** tab, **Tournament ingestion (Claude)**, **Run workflow**.
6. Never paste the key into chat, code, or any file other than `pipeline/.env`.

### D. Make the live site show it
1. Review the pull request the job opens, then merge it. The notes appear in the **About** tab after Cloudflare redeploys.
2. Open mytournamentpb.com, click **About**, and confirm the notes show.
3. Refresh the data first (ask me to run a tournament scan, then import the CSV into the sheet) so the home page is not mostly closed events.

### E. Submit
1. Fill every `[FILL IN]` above with real facts or delete the sentence.
2. Go to platform.claude.com/offers/startups-application and paste sections 1 and 2.

### F. After approval
1. In Console, find the credits (your brief says $1,000) and claim them. Also claim the free Claude Team year (per your brief).
2. Credits expire after 6 months, so note the date and keep the daily cap in `pipeline/.env` (`DAILY_CALL_CAP`) sensible.
3. I have not verified the program's current terms; confirm them on the offer page.

## 5. Submission record

- **Submitted:** 11 Oct 2026, from hello@mytournamentpb.com, via platform.claude.com/offers/startups-application.
- **Facts stated on the form:** company MyTournament.PB, website https://mytournamentpb.com, based in Malaysia, latest funding round "Not yet raised", not incorporated, no outside funding or revenue.
- **"What are you building on Claude?" text sent:**
  > MyTournament.PB is a free calendar of Malaysian pickleball tournaments, so players needn't check several platforms for dates, fees and deadlines. We're building a Claude API pipeline: Haiku 5.5 turns raw listing text into validated structured data, and Sonnet 5.5 drafts short player notes from verified facts only. Low-confidence results wait for human approval and nothing publishes unreviewed. Code and tests are done; first live run is next. Built solo with Claude Code.
- **Not recorded here:** personal fields (name, job title, city), the founding month/year and the AI-spend percentage were entered by the founder directly. [FILL IN if you want them logged.]
- **Outcome:** [FILL IN: approved / declined / no reply, with date.]

## 6. Next steps

1. Watch hello@mytournamentpb.com (and Gmail spam) for Anthropic's reply.
2. If approved: claim the credits and the Claude Team offer in Console, and note the expiry date shown there (confirm the amounts and expiry on the offer page; they were not verified from an official source).
3. Create the API key and put it in `pipeline/.env` only, then run `npm run dry-run`, then one real listing with `npm start`.
4. After the first real run, replace "first live run is next" in any future application or update with what actually happened.
