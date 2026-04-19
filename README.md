# Cloud Agent IQ

> The intelligence layer for modern business.

A static marketing site for Cloud Agent IQ, an autonomous AI agent platform
for business operations (sales, support, finance, ops, analytics).

## Stack

Intentionally boring and fast.

- **Hand-written HTML / CSS / JS** — no build step, no framework, no npm.
- **Python** `http.server` wrapper in `server_daemon.py` (double-fork daemon).
- **Fraunces + Manrope + JetBrains Mono** via Google Fonts.

Three files do the work. Easy to read. Easy to change.

## Run locally

```bash
# Starts a detached daemon on port 8080. Safe to call repeatedly.
python3 server_daemon.py

# Check it
curl -I http://127.0.0.1:8080/
```

The daemon writes its PID to `/tmp/caiq-server.pid` and logs to
`/tmp/caiq-server.log`. To stop:

```bash
kill $(cat /tmp/caiq-server.pid)
```

Behind a Cloudflare tunnel pointing `cloudagentiq.com → 127.0.0.1:8080`.

## Files

```
index.html            Main page — hero, agents, how-it-works, pricing, etc.
styles.css            All styles. Design tokens at the top.
app.js                Nav, reveal-on-scroll, count-up metrics, mobile menu.
404.html              Themed not-found page.
server_daemon.py      Production server (serves themed 404 on unknown routes).
server.py             Simpler foreground server (for when you want logs in-terminal).
favicon.svg           Tiny brand mark.
apple-touch-icon.svg  iOS home-screen icon.
og-image.svg          1200×630 social share card.
robots.txt            Allow all, point at sitemap.
sitemap.xml           For search engines.
```

## Design system

Tokens live at the top of `styles.css` under `:root`. The important ones:

```css
--bg:     #0A0907   /* warm near-black */
--fg:     #F2EAE0   /* warm off-white */
--ember:  #E8704A   /* primary accent */
--gold:   #D4AF7A   /* secondary accent */
--sage:   #8AA88E   /* tertiary accent */

--font-display:  "Fraunces"        /* editorial serif, variable */
--font-body:     "Manrope"         /* refined sans */
--font-mono:     "JetBrains Mono"  /* UI + code */
```

Change the accent in one place, the whole site shifts.

## Content worth replacing before going to real prospects

The following are plausible-sounding **placeholders**, not real data:

- Metrics: 73% / 4.1× / 96% / 11 min (metrics section)
- Customer quotes in the "In the wild" section
- Agent names (Sloane, Mira, Ari, Kai, Nell, Romy, Iver, Thea)
- "42k+ agents deployed" and "99.98% uptime" in the hero meta
- `hello@cloudagentiq.com` (not a real inbox yet)

Everything else (positioning, feature claims, pricing structure, FAQ answers)
is directionally sound and can be sharpened, but isn't invented fact.

## Known-not-done

- No real demo booking flow — CTAs currently `alert()` a message. Plug in
  a Cal.com or HubSpot form when ready.
- Fonts load from Google Fonts CDN. If you want to go self-hosted for
  privacy, drop the `<link>` in `<head>` and serve WOFF2 locally.
- Anchor links like `#docs` and `#login` are stubs. Build those pages when
  the product has docs / login to show.

## License

All yours.
