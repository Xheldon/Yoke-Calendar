# Marketing screenshot capture

Regenerates every screenshot on the site — 36 files, both languages, both themes —
from the **web build** of the app, using fake demo data. It never touches the
desktop app's real data (the web build lives in localStorage).

## Run

```sh
# in the APP repo (…/Work-Calender-for-Win): start the web build on :5180
npm run dev:web

# here:
npm i puppeteer-core --no-save
node capture.mjs            # both languages, all shots → ./shots
node capture.mjs zh         # one language
node capture.mjs en feat_ai # one language, one shot
```

Then copy `shots/*.png` over `../../assets/`. Filenames already match what the site
expects (`light_cn.png`, `dark_en.png`, `feat_<key>_<theme>_<cn|en>.png`).

## Things that bite (all handled in the script — don't undo them)

- The site's filename token is **`cn`**, not `zh`; the hero files are `light_*.png` /
  `dark_*.png`, not `hero_*`.
- Seed `lang` as the literal `'zh'`/`'en'` — `'system'` follows the browser and
  silently flips the UI language.
- CN needs `showLunar: true` and `holidayRegion: 'CN'`; EN sets them off/`US`.
- The AI-history timestamp uses `toLocaleString()` with no locale, so it follows the
  JS runtime locale — `--lang` is unreliable in headless Chrome. `pinLocale()` patches
  `Date.prototype.toLocale*` per page instead.
- `Tag.glyph` is a **character index** (0-based), not a letter.
- Blur the focused element before every shot, or a dialog's × keeps a focus ring.
- Close the search palette by clicking `.sp-scrim`, **not** Escape: the Escape handler
  lives on the input, and once focus is dropped a stranded scrim (`backdrop-filter:
  blur(2px)`) fogs every later shot in the pass.
- Crop the by-grouping shot exactly to the sidebar/menu edge — any padding spills into
  the next pane and slices its glyphs.
- CN holidays are fetched at runtime from jsDelivr, so the capture box needs network.
- The mac traffic lights are drawn by `macChrome()`; the web build is not darwin.
