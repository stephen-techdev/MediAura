# MediAura — Healthcare Website

A single-page healthcare site: a cinematic falcon **entrance splash** that scrolls
straight into the long-form **MediAura** hospital page.

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
| `index.html` | Entry page: entrance markup + the full MediAura page |
| `css/entrance.css` | Entrance (splash) styles |
| `css/site.css` | MediAura page styles |
| `css/fonts.css` | `@font-face` for the bundled fonts |
| `js/entrance-engine.js` | Entrance timing/sizing engine (viewBox-style layout, never re-runs) |
| `js/entrance-play.js` | Plays the entrance exactly once |
| `js/site.js` | Scroll reveals, counters, FAQ, drawer, newsletter, booking |
| `fonts/` | Eloquia 200 + FreeSans 400/700 (woff2 subsets) |
| `img/` | 17 photos + video poster (jpg/webp) |

## Features

- **Entrance → site handoff**: header and progress bar stay hidden until the entrance ends
- **Appointment booking** in the *Book an appointment* section: online form → confirmation
  with reference number → **Cancel appointment** → *Book another appointment* (form resets)
- Scroll reveals, animated counters, single-open FAQ accordion, mobile drawer,
  marquee strip, newsletter signup
- **Responsive**: dedicated desktop / tablet / phone entrance modes
- **Accessible**: reduced-motion support, full no-JS fallback, keyboard-friendly drawer and booking
- The falcon video streams from CloudFront — the only external asset; everything else is local
