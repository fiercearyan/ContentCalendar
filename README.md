# Content Calendar

One page to track uploads for three channels — **Tech Decoded**, **Secrets of Sanatan** and **The Thinking Room** — across Instagram, YouTube (Shorts + full length) and Facebook.

A single `index.html` plus one Vercel function (`api/data.js`) that stores the calendar in Upstash Redis — the same setup as the streaks app — so every device sees the same data. Each device also keeps a local copy, so it keeps working offline and syncs when it's back online.

## Views
- **Overview** – today's headline, four stats, *Needs attention* (overdue or due today and not scheduled, with one-click Mark scheduled / Mark posted), a 2-week *Runway* with one row per channel, and *Pipeline by channel* (made → scheduled → posted per platform).
- **Calendar** – month grid; each post shows a dot per platform (green posted, blue scheduled, grey to schedule).
- **Posts** – searchable list grouped into Overdue, Today, Upcoming and Earlier.
- **Settings** – channel names, handles, colours, which formats each channel makes, posting days, default platforms, and backup.

Filters for channel, platform (IG / YT Shorts / YT Full / FB) and stage (To schedule / Scheduled / Posted) sit under the header. Click any post to edit it in the side panel; changes save as you type. Press **N** for a new post, **Esc** to close the panel. The half-moon button switches light/dark.

## How a post works
Each post has a channel, a format (Short/Reel or Full length), a date, and a state per platform: **To schedule → Scheduled → Posted**. A post with no title is an *idea*. If a post's date has passed and it isn't up on every platform it's planned for, it's marked overdue in red.

**Plan next 2 weeks** creates empty "Idea" slots on each channel's posting days (set these in Settings), skipping any day that already has a post of that type.

## Deploy on Vercel
1. Import this repo at vercel.com/new (framework preset **Other**, no build settings).
2. Project → **Storage** → connect **Upstash Redis**. You can reuse the same database as streaks — this app's data sits under its own `contentcal:` key, so nothing clashes. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
3. Project → **Settings → Environment Variables** → add `APP_PASSCODE`.
4. Redeploy. Open the site and enter the passcode once per device.

**Bringing over existing data:** if you used the calendar somewhere else first (opened from disk, or another URL), export JSON there and use **Settings → Import JSON** on the deployed site. Imported posts are merged in and synced.

**Syncing:** changes are merged post by post. If the same post is edited on two devices, the most recent save wins; deletes sync too. The header shows *Synced*, *Saving…* or *Offline*.

Opening `index.html` directly from disk still works, but it only saves to that browser and doesn't sync (*Local only*).
