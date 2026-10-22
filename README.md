# MediAura — Healthcare Website

A single-page healthcare site. The cinematic falcon footage now plays as a
**transparent background inside the footer** — the page opens straight on the
MediAura content, and the video sits quietly behind the footer links.

## Run it

Serve the folder with any static server (opening `index.html` via `file://` works too,
but a server matches production):

```
python -m http.server 8000
# → http://127.0.0.1:8000/
```

## Structure

| Path | What it is |
|---|---|
| `index.html` | The full MediAura page (header, sections, footer with video backdrop) |
| `css/site.css` | MediAura page styles + footer background treatment |
| `css/entrance.css` | *(legacy)* entrance-splash styles — kept for reference, no longer linked |
| `css/fonts.css` | `@font-face` for the bundled fonts |
| `js/entrance-engine.js` | *(legacy)* entrance timing/sizing engine — kept for reference, no longer loaded |
| `js/entrance-play.js` | *(legacy)* plays the entrance exactly once — kept for reference, no longer loaded |
| `js/site.js` | Scroll reveals, counters, FAQ, drawer, newsletter, booking |
| `fonts/` | Eloquia 200 + FreeSans 400/700 (woff2 subsets) |
| `img/` | 17 photos + video poster (jpg/webp) |

## Features

- **Footer video backdrop**: the falcon footage loops behind the footer at low opacity with a dark veil, and pauses off-screen for performance
- **Appointment booking** in a popup: every *Book appointment* button opens the booking form as a dialog (Esc / ✕ / backdrop to close) → confirmation with reference number → **Cancel appointment** → *Book another appointment* (form resets)
- Scroll reveals, animated counters, single-open FAQ accordion, mobile drawer,
  marquee strip, newsletter signup
- **Responsive**: dedicated desktop / tablet / phone entrance modes
- **Accessible**: reduced-motion support, full no-JS fallback, keyboard-friendly drawer and booking
- The falcon video streams from CloudFront — the only external asset; everything else is local
