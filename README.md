# Content Calendar

One page to track uploads for three channels — **Tech Decoded**, **Secrets of Sanatan** and **The Thinking Room** — across Instagram, YouTube (Shorts + full length) and Facebook.

No build step, no backend: a single `index.html`. Data lives in the browser's localStorage; use **Settings → Export/Import JSON** to back up or move to another device.

## Views
- **Dashboard** – overview stats, a board with one row per channel covering the last 7 days and the next 14, and per-channel/per-platform posting progress for the last 30 days.
- **Month** – a month grid you can filter by channel.
- **All posts** – a searchable list you can filter by channel, status and type.
- **Settings** – channel names, colours, posting days, default platforms per format, and backup.

## How a post works
Each post has a channel, a type (Short/Reel or Full length), a date and a stage (Idea → Script → Voice/Record → Editing → Ready → Posted). Each platform is marked **Planned** and then **Posted** on its own, so a reel that's up on Instagram but not on YouTube yet shows as partly posted. If a post's date has passed and it isn't up on every planned platform, it's marked overdue in red.

**Plan next 2 weeks** creates empty "Idea" slots on each channel's posting days (set these in Settings), skipping any day that already has a post of that type.

## Run / deploy
Open `index.html` in a browser, or deploy the repo as a static site (Vercel: import the repo with no framework and no build command; GitHub Pages also works).
