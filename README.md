# Content Calendar

One page to track uploads for three channels — **Tech Decoded**, **Secrets of Sanatan** and **The Thinking Room** — across Instagram, YouTube (Shorts + full length) and Facebook.

A single `index.html` plus one Vercel function (`api/data.js`) that stores the calendar in Upstash Redis — the same setup as the streaks app — so every device sees the same data. Each device also keeps a local copy, so it keeps working offline and syncs when it's back online.

## Views
- **Dashboard** – overview stats, a board with one row per channel covering the last 7 days and the next 14, and per-channel/per-platform posting progress for the last 30 days.
- **Month** – a month grid you can filter by channel.
- **All posts** – a searchable list you can filter by channel, status and type.
- **Settings** – channel names, colours, posting days, default platforms per format, and backup.

## How a post works
Each post has a channel, a type (Short/Reel or Full length), a date and a stage (Idea → Script → Voice/Record → Editing → Ready → Posted). Each platform is marked **Planned** and then **Posted** on its own, so a reel that's up on Instagram but not on YouTube yet shows as partly posted. If a post's date has passed and it isn't up on every planned platform, it's marked overdue in red.

**Plan next 2 weeks** creates empty "Idea" slots on each channel's posting days (set these in Settings), skipping any day that already has a post of that type.

## Deploy on Vercel
1. Import this repo at vercel.com/new (framework preset **Other**, no build settings).
2. Project → **Storage** → connect **Upstash Redis**. You can reuse the same database as streaks — this app's data sits under its own `contentcal:` key, so nothing clashes. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
3. Project → **Settings → Environment Variables** → add `APP_PASSCODE`.
4. Redeploy. Open the site and enter the passcode once per device.

**Bringing over existing data:** if you used the calendar somewhere else first (opened from disk, or another URL), export JSON there and use **Settings → Import JSON** on the deployed site. Imported posts are merged in and synced.

**Syncing:** changes are merged post by post. If the same post is edited on two devices, the most recent save wins; deletes sync too. The header shows *Synced*, *Saving…* or *Offline*.

Opening `index.html` directly from disk still works, but it only saves to that browser and doesn't sync (*Local only*).
