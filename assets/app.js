/* Yoke Calendar site — pull the latest GitHub release and render downloads +
   changelog at runtime, so the page never needs editing per release. All
   user-facing strings route through YokeI18n so the section follows the
   language toggle; we cache the release and re-render on `yoke:langchange`. */
const REPO = 'Xheldon/Yoke-Calendar'
const RELEASES_URL = `https://github.com/${REPO}/releases`

const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

function t(k, p) {
  return window.YokeI18n ? window.YokeI18n.t(k, p) : k
}
function locale() {
  return window.YokeI18n && window.YokeI18n.lang === 'en' ? 'en-US' : 'zh-CN'
}

// hero screenshot follows the current theme + language → assets/{light|dark}_{cn|en}.png
function heroShotSrc() {
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  const lang = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'cn'
  return `assets/${theme}_${lang}.png`
}
function syncHeroShot() {
  const shot = document.getElementById('hero-shot')
  if (shot && !shot.getAttribute('src').endsWith(heroShotSrc())) shot.setAttribute('src', heroShotSrc())
}
function preloadShots() {
  for (const n of ['light_cn', 'dark_cn', 'light_en', 'dark_en']) new Image().src = `assets/${n}.png`
}

// ── visitor OS (best-effort; arch on macOS isn't reliably exposed, so we just
//    default the hero to the most common build and show all arches below) ──
function detectOS() {
  const p = (
    navigator.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent ||
    ''
  ).toLowerCase()
  if (/mac|iphone|ipad/.test(p)) return 'mac'
  if (/win/.test(p)) return 'win'
  if (/linux|x11|android/.test(p)) return 'linux'
  return null
}

const OS_LABEL = { mac: 'macOS', win: 'Windows', linux: 'Linux' }

function platformOf(name) {
  const n = name.toLowerCase()
  if (n.endsWith('.dmg')) return 'mac'
  if (n.endsWith('.exe')) return 'win'
  if (n.endsWith('.appimage')) return 'linux'
  return null // .zip / .yml / .blockmap → updater metadata, not a user download
}
function archKey(name) {
  const n = name.toLowerCase()
  if (/\.exe$/.test(n)) return 'arch.winAll' // one NSIS installer covers x64 / arm64 / x86
  if (/arm64|aarch64/.test(n)) return 'arch.arm'
  if (/x64|x86_64|amd64|intel/.test(n)) return 'arch.intel'
  if (/\.dmg$/.test(n)) return 'arch.intel' // electron-builder names the x64 mac build with no arch suffix
  return 'arch.generic'
}

function fmtSize(bytes) {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB'
}

let currentRel // undefined = loading, null = no release, object = release

function render() {
  if (currentRel === undefined) return
  if (currentRel) renderRelease(currentRel)
  else renderEmpty()
}

function renderEmpty() {
  document.getElementById('dl-version').textContent = t('dl.soon')
  document.getElementById('dl-grid').innerHTML = `<div class="dl-empty">${t('dl.empty')}</div>`
  document.getElementById('cl-card').innerHTML = `<p class="muted">${t('cl.empty')}</p>`
  document.getElementById('hero-download').setAttribute('href', RELEASES_URL)
}

function renderRelease(rel) {
  const version = rel.tag_name || rel.name || ''
  const date = new Date(rel.published_at).toLocaleDateString(locale())
  const assets = (rel.assets || []).filter((a) => platformOf(a.name))
  document.getElementById('dl-version').textContent = t('dl.latest', { v: version, date })

  const detected = detectOS()
  const grid = document.getElementById('dl-grid')
  grid.innerHTML = ''
  for (const key of ['mac', 'win', 'linux']) {
    const items = assets.filter((a) => platformOf(a.name) === key)
    const col = document.createElement('div')
    col.className = 'dl-os' + (detected === key ? ' match' : '')
    const links = items.length
      ? items
          .map(
            (a) =>
              `<a class="dl-link" href="${a.browser_download_url}"><span>${t(
                'dl.download'
              )}</span><span class="arch">${t(archKey(a.name))} · ${fmtSize(a.size)}</span></a>`
          )
          .join('')
      : `<div class="arch" style="padding:8px 2px">${t('dl.none')}</div>`
    col.innerHTML =
      `<div class="dl-os-head">${OS_LABEL[key]}${
        detected === key ? `<span class="dl-os-badge">${t('dl.yoursystem')}</span>` : ''
      }</div>` + links
    grid.appendChild(col)
  }

  // hero button → best guess for the visitor's OS, else the download section
  const hero = document.getElementById('hero-download')
  if (detected) {
    const mine = assets.filter((a) => platformOf(a.name) === detected)
    const best =
      detected === 'mac'
        ? mine.find((a) => /arm64/i.test(a.name)) || mine[0]
        : detected === 'win'
          ? mine.find((a) => /x64|x86_64|amd64/i.test(a.name)) || mine[0]
          : mine[0]
    if (best) {
      hero.setAttribute('href', best.browser_download_url)
      hero.textContent = t('dl.heroBest', { label: OS_LABEL[detected] })
      document.getElementById('hero-meta').textContent = t('dl.heroOther', { v: version })
    }
  }

  // changelog
  const cl = document.getElementById('cl-card')
  const notesHtml = mdLite(rel.body || '')
  cl.innerHTML = `
    <h3>${version}</h3>
    <p class="cl-date">${new Date(rel.published_at).toLocaleString(locale())}</p>
    <div class="cl-notes">${notesHtml || `<p class="muted">${t('cl.nonotes')}</p>`}</div>
    <a class="cl-more" href="${RELEASES_URL}">${t('cl.more')}</a>`
}

/* tiny markdown: bullet lists + escaping. Good enough for our changelog notes. */
function mdLite(src) {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const lines = src.split('\n')
  let out = ''
  let inList = false
  for (const raw of lines) {
    const line = raw.trim()
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out += '<ul>'
        inList = true
      }
      out += `<li>${esc(line.replace(/^[-*]\s+/, ''))}</li>`
    } else {
      if (inList) {
        out += '</ul>'
        inList = false
      }
      if (line) out += `<p>${esc(line)}</p>`
    }
  }
  if (inList) out += '</ul>'
  return out
}

async function load() {
  // hide the screenshot placeholder if a real screenshot exists, else show it
  const shot = document.getElementById('hero-shot')
  const ph = document.getElementById('hero-shot-ph')
  const reveal = () => {
    shot.style.display = 'block'
    ph.style.display = 'none'
  }
  shot.addEventListener('load', reveal)
  shot.addEventListener('error', () => {
    shot.style.display = 'none'
    ph.style.display = ''
  })
  // keep the hero shot in sync with the theme + language toggles
  syncHeroShot()
  // the <img> may have finished loading before this listener attached
  if (shot.complete && shot.naturalWidth > 0) reveal()
  new MutationObserver(syncHeroShot).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-lang']
  })
  if ('requestIdleCallback' in window) requestIdleCallback(preloadShots)
  else setTimeout(preloadShots, 1500)

  document.getElementById('dl-version').textContent = t('dl.fetching')

  try {
    const cached = sessionStorage.getItem('yoke-rel')
    const rel = cached
      ? JSON.parse(cached)
      : await fetch(`https://api.github.com/repos/${REPO}/releases/latest`).then((r) => {
          if (!r.ok) throw new Error('no release')
          return r.json()
        })
    if (!cached) sessionStorage.setItem('yoke-rel', JSON.stringify(rel))
    currentRel = rel
  } catch {
    currentRel = null
  }
  render()
}

window.addEventListener('yoke:langchange', render)
load()
