/* capture.mjs — regenerate the marketing site's screenshots (BOTH languages) against
   the web build on :5180.  Usage:
     node capture.mjs [zh|en] [shotPrefix ...]      (no args = both langs, all shots)
   Output: shots/<name>.png at @2x, already named the way the site wants:
     light_<cn|en>.png, dark_<cn|en>.png, feat_<key>_<light|dark>_<cn|en>.png
   A separate Chrome instance per language (--lang) so `toLocaleString()` in the AI
   history record follows the UI language. */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { buildDataSrc, AI_RECORD, TEMPLATE, SEARCH_TERM } from './data.mjs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:5180'
const OUT = new URL('./shots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const argv = process.argv.slice(2)
const langArg = argv.filter((a) => a === 'zh' || a === 'en')
const LANGS = langArg.length ? langArg : ['zh', 'en']
const only = argv.filter((a) => a !== 'zh' && a !== 'en')
const want = (n) => only.length === 0 || only.some((o) => n.startsWith(o))

// ── page helpers (stringified into the page where noted) ──
const macChrome = () => {
  document.documentElement.dataset.platform = 'darwin'
  if (!document.getElementById('fake-tl')) {
    const d = document.createElement('div')
    d.id = 'fake-tl'
    d.style.cssText = 'position:fixed;top:14px;left:16px;z-index:9999;display:flex;gap:8px'
    for (const c of ['#ff5f57', '#febc2e', '#28c840']) {
      const dot = document.createElement('span')
      dot.style.cssText = `width:12px;height:12px;border-radius:50%;background:${c};display:inline-block`
      d.appendChild(dot)
    }
    document.body.appendChild(d)
  }
}

/* The AI-history row prints its timestamp with toLocaleString() and NO explicit locale,
   so it follows the JS runtime locale — which --lang does not reliably set in headless
   Chrome (it produced "7/20/2026, 6:35:00 PM" inside an otherwise all-Chinese window).
   Pin it per page, before any app code runs. */
async function pinLocale(page, lang) {
  const loc = lang === 'zh' ? 'zh-CN' : 'en-US'
  await page.evaluateOnNewDocument((l) => {
    const dt = Date.prototype.toLocaleString
    const dd = Date.prototype.toLocaleDateString
    const tt = Date.prototype.toLocaleTimeString
    Date.prototype.toLocaleString = function (_l, o) { return dt.call(this, l, o) }
    Date.prototype.toLocaleDateString = function (_l, o) { return dd.call(this, l, o) }
    Date.prototype.toLocaleTimeString = function (_l, o) { return tt.call(this, l, o) }
  }, loc)
}

async function seed(page, theme, lang) {
  await page.evaluate(
    (dataSrc, th, lg, aiRec, tpl) => {
      localStorage.setItem('wc:data', JSON.stringify(eval(dataSrc)))
      localStorage.setItem('wc:aihistory', JSON.stringify([aiRec]))
      localStorage.setItem(
        'wc:settings',
        JSON.stringify({
          lang: lg, // literal 'zh'/'en' — 'system' would follow the browser and flip the UI
          theme: th,
          weekStart: 1,
          showLunar: lg === 'zh', // 农历 under each date is part of the CN look
          showExpired: true,
          holidayRegion: lg === 'zh' ? 'CN' : 'US',
          listGroup: 'line',
          listStyle: 'plain',
          barStyle: 'soft',
          sidebarWidth: 300,
          detailWidth: 452,
          scheduleLayout: 'stack',
          noteTemplates: [tpl]
        })
      )
    },
    buildDataSrc(lang),
    theme,
    lang,
    AI_RECORD(lang),
    TEMPLATE(lang)
  )
}

async function boot(page, theme, lang, { url = BASE, w = 1440, h = 900 } = {}) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
  await pinLocale(page, lang)
  await page.goto(url, { waitUntil: 'networkidle0' })
  await seed(page, theme, lang)
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-week], .set-row, textarea, .cal-scroll', { timeout: 8000 }).catch(() => {})
  await page.evaluate(macChrome)
  // CN holidays are fetched at runtime (holiday-cn via jsDelivr) — give it a beat
  await new Promise((r) => setTimeout(r, lang === 'zh' ? 2200 : 900))
}

const selectMain = (page) =>
  page.evaluate(() => {
    const el = document.querySelectorAll('.reqitem')[0]
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })

const rect = (page, sel, pad = 0) =>
  page.evaluate(
    (s, p) => {
      const el = document.querySelector(s)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: Math.max(0, r.left - p),
        y: Math.max(0, r.top - p),
        width: Math.min(innerWidth, r.right + p) - Math.max(0, r.left - p),
        height: Math.min(innerHeight, r.bottom + p) - Math.max(0, r.top - p)
      }
    },
    sel,
    pad
  )

/* Always drop focus before a shot: clicking/dragging leaves a :focus ring on whatever
   was hit last (typically a dialog's × button), which reads as "captured mid-keyboard-
   interaction" and out-shouts the real subject. */
const shoot = async (page, name, clip) => {
  await page.evaluate(() => {
    const el = document.activeElement
    if (el && el !== document.body && typeof el.blur === 'function') el.blur()
  })
  await new Promise((r) => setTimeout(r, 120))
  return page.screenshot({ path: OUT + name + '.png', clip })
}

// language-agnostic UI probes (the app is fully i18n'd, so never match on English)
const openMoreMenu = (page) =>
  page.evaluate(() => {
    const more = [...document.querySelectorAll('button')].find((b) => ['More', '更多'].includes(b.title || ''))
    more?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })

for (const lang of LANGS) {
  const tok = lang === 'zh' ? 'cn' : 'en' // the site's filename token is cn/en, not zh/en
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--hide-scrollbars', '--force-device-scale-factor=2', `--lang=${lang === 'zh' ? 'zh-CN' : 'en-US'}`]
  })
  const page = await browser.newPage()

  for (const theme of ['light', 'dark']) {
    const sfx = `_${theme}_${tok}`
    const hero = `${theme}_${tok}` // hero files are light_cn.png / dark_en.png …

    if (want('hero') || want('light') || want('dark') || want('feat_calendar') || want('feat_detail') || want('feat_search') || want('feat_group')) {
      await boot(page, theme, lang)
      await selectMain(page)
      await new Promise((r) => setTimeout(r, 1000)) // the note editor mounts deferred

      if (want('hero') || want('light') || want('dark')) await shoot(page, hero)

      if (want('feat_detail')) {
        const r = await rect(page, '.detail')
        if (r) await shoot(page, 'feat_detail' + sfx, r)
      }

      if (want('feat_calendar')) {
        const clip = await page.evaluate(() => {
          const pane = document.querySelector('.cal-pane') || document.querySelector('.cal-scroll')
          const w1 = document.querySelector('[data-week="2026-07-13"]')
          const w2 = document.querySelector('[data-week="2026-07-20"]')
          if (!pane || !w1 || !w2) return null
          const pr = pane.getBoundingClientRect()
          const a = w1.getBoundingClientRect()
          const b = w2.getBoundingClientRect()
          return { x: pr.left, y: Math.max(0, a.top), width: pr.width, height: Math.min(innerHeight, b.bottom) - Math.max(0, a.top) }
        })
        if (clip) await shoot(page, 'feat_calendar' + sfx, clip)
      }

      if (want('feat_search')) {
        await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true })))
        await new Promise((r) => setTimeout(r, 250))
        await page.evaluate((term) => {
          const input = document.querySelector('.sp-input')
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
          setter.call(input, term)
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }, SEARCH_TERM(lang))
        await new Promise((r) => setTimeout(r, 400))
        const r1 = await rect(page, '.sp-panel', 28)
        if (r1) await shoot(page, 'feat_search' + sfx, r1)
        // close by clicking the scrim, NOT Escape: shoot() blurs the focused element and
        // the palette's Escape handler lives on the input — a stranded .sp-scrim carries
        // backdrop-filter: blur(2px) and would fog every later shot in this pass
        await page.evaluate(() =>
          document.querySelector('.sp-scrim')?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        )
        await new Promise((r) => setTimeout(r, 200))
      }

      if (want('feat_group')) {
        await openMoreMenu(page)
        await new Promise((r) => setTimeout(r, 320))
        const clip = await page.evaluate(() => {
          const menu = document.querySelector('.dropdown')
          const sb = document.querySelector('.sidebar') || document.querySelector('[class*="sidebar"]')
          const mr = menu?.getBoundingClientRect()
          const sr = sb?.getBoundingClientRect()
          // stop exactly at whichever of sidebar/menu reaches furthest right — any extra
          // padding spills into the next pane and slices its glyphs down the middle
          const right = Math.max(mr ? mr.right : 0, sr ? sr.right : 360)
          // end right at the menu's shadow: any more and the next group header peeks out
          // half-height under the popover's rounded corner (in dark it reads as a strikethrough)
          const bottom = (mr ? mr.bottom : 560) + 5
          return { x: 0, y: 0, width: Math.min(innerWidth, right), height: Math.min(innerHeight, bottom) }
        })
        await shoot(page, 'feat_group' + sfx, clip)
        await page.evaluate(() =>
          document.querySelector('.menu-scrim')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        )
        await new Promise((r) => setTimeout(r, 200))
      }
    }

    if (want('feat_schedule')) {
      await boot(page, theme, lang)
      // drag Thu Jul 30 → Fri Aug 7: crosses a weekend, so the rest-day pre-exclusion shows
      await page.evaluate(() => {
        const row1 = document.querySelector('[data-week="2026-07-27"]')
        const row2 = document.querySelector('[data-week="2026-08-03"]')
        if (!row1 || !row2) return
        const c1 = row1.querySelectorAll('.daycell')[3]
        const c2 = row2.querySelectorAll('.daycell')[4]
        const r1 = c1.getBoundingClientRect()
        const r2 = c2.getBoundingClientRect()
        const opt = (x, y) => ({ bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
        c1.dispatchEvent(new MouseEvent('mousedown', opt(r1.left + 20, r1.top + 40)))
        window.dispatchEvent(new MouseEvent('mousemove', opt(r1.left + 60, r1.top + 45)))
        window.dispatchEvent(new MouseEvent('mousemove', opt(r2.left + 30, r2.top + 40)))
        window.dispatchEvent(new MouseEvent('mouseup', opt(r2.left + 30, r2.top + 40)))
      })
      await new Promise((r) => setTimeout(r, 550))
      if (await page.$('.modal')) {
        const r = await rect(page, '.modal', 30)
        await shoot(page, 'feat_schedule' + sfx, r)
      } else {
        console.error('!! schedule modal did not open —', lang, theme)
      }
    }

    if (want('feat_tags')) {
      await boot(page, theme, lang)
      await openMoreMenu(page)
      await new Promise((r) => setTimeout(r, 260))
      await page.evaluate(() => {
        const item = [...document.querySelectorAll('.dd-item')].find((b) => /tag|标签/i.test(b.textContent))
        item?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      })
      await new Promise((r) => setTimeout(r, 480))
      const r = await rect(page, '.modal', 30)
      if (r) await shoot(page, 'feat_tags' + sfx, r)
      else console.error('!! tags modal did not open —', lang, theme)
    }

    if (want('feat_ai')) {
      const p2 = await browser.newPage()
      await p2.setViewport({ width: 980, height: 760, deviceScaleFactor: 2 })
      await pinLocale(p2, lang)
      await p2.goto(BASE, { waitUntil: 'networkidle0' })
      await seed(p2, theme, lang)
      await p2.goto(BASE + '/?view=ai', { waitUntil: 'networkidle0' })
      await new Promise((r) => setTimeout(r, 900))
      await p2.evaluate(() => {
        const tab = [...document.querySelectorAll('button')].find((b) => /History|历史/.test(b.textContent))
        tab?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      })
      await new Promise((r) => setTimeout(r, 380))
      await p2.evaluate(() => document.querySelector('.hist-head')?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
      await new Promise((r) => setTimeout(r, 380))
      await p2.evaluate(macChrome)
      // crop to the content's real bottom — one history entry leaves ~18% dead space
      const aiClip = await p2.evaluate(() => {
        const last = [...document.querySelectorAll('button, .hist-item')].pop()
        if (!last) return null
        const b = last.getBoundingClientRect().bottom
        return { x: 0, y: 0, width: innerWidth, height: Math.min(innerHeight, Math.ceil(b) + 26) }
      })
      await shoot(p2, 'feat_ai' + sfx, aiClip || undefined)
      await p2.close()
    }

    if (want('feat_settings')) {
      const p3 = await browser.newPage()
      await p3.setViewport({ width: 880, height: 700, deviceScaleFactor: 2 })
      await pinLocale(p3, lang)
      await p3.goto(BASE, { waitUntil: 'networkidle0' })
      await seed(p3, theme, lang)
      await p3.goto(BASE + '/?view=settings&tab=general', { waitUntil: 'networkidle0' })
      await new Promise((r) => setTimeout(r, 800))
      await p3.evaluate(macChrome)
      await shoot(p3, 'feat_settings' + sfx)
      await p3.close()
    }
  }

  await browser.close()
  console.log('done:', lang)
}
