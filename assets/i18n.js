/* Tiny i18n for the static site.
   - Short UI strings live here in STR, keyed; elements carry data-i18n="key"
     (text) or data-i18n-attr="attr:key,attr:key" (attributes).
   - Long docs prose isn't keyed — it lives as parallel [data-lang="zh"] /
     [data-lang="en"] blocks in docs.html, shown/hidden by CSS off :root[data-lang].
   - Initial language is set inline in <head> (no flash); here we apply the
     keyed strings, wire the toggle, and emit `yoke:langchange` so app.js can
     re-render the release/download bits in the new language. */
;(function () {
  var STR = {
    // ── nav ──
    'nav.features': { zh: '功能', en: 'Features' },
    'nav.download': { zh: '下载', en: 'Download' },
    'nav.docs': { zh: '文档', en: 'Docs' },
    'nav.changelog': { zh: '更新日志', en: 'Changelog' },
    'nav.github': { zh: 'GitHub', en: 'GitHub' },
    'nav.home': { zh: '首页', en: 'Home' },
    'toggle.theme': { zh: '切换深色 / 浅色主题', en: 'Toggle dark / light theme' },
    'toggle.lang': { zh: '切换语言（中文 / English）', en: 'Switch language (中文 / English)' },

    // ── hero ──
    'hero.eyebrow': { zh: 'Beta 公测中', en: 'Public Beta' },
    'hero.h1': { zh: '掌控排期', en: 'Own your schedule.' },
    'hero.lede': {
      zh: '个人和团队的桌面排期工具。',
      en: 'A desktop scheduling tool for individuals and teams.'
    },
    'hero.download': { zh: '下载', en: 'Download' },
    'hero.features': { zh: '看看功能', en: 'See features' },
    'hero.meta': {
      zh: 'macOS · Windows · Linux · 免费 · 开源发布',
      en: 'macOS · Windows · Linux · Free · Open source'
    },
    'shot.placeholder': { zh: '应用截图（待补）', en: 'App screenshot (coming soon)' },

    // ── features ──
    'features.title': { zh: '为「排期」而生', en: 'Built for scheduling' },
    'feat.1.t': { zh: '划选即排期', en: 'Drag to schedule' },
    'feat.1.d': {
      zh: '在日历上拖拽划选时间段，直接落成需求的各个阶段（开发 / 联调 / 测试 / 上线）。泳道式色条，谁在做什么、下一步是什么，一眼可见。',
      en: 'Drag across dates to lay down each phase of a project (dev / integration / QA / release). Swim-lane color bars show who is doing what, and what comes next, at a glance.'
    },
    'feat.2.t': { zh: 'AI 进度总结', en: 'AI progress summaries' },
    'feat.2.d': {
      zh: '接入 OpenAI / Claude / Gemini / DeepSeek / 通义 / Kimi / 智谱 等 14+ 服务商，或复用本机 Claude Code / Codex CLI，一键生成周报、风险盘点、对上汇报。',
      en: 'Connect OpenAI / Claude / Gemini / DeepSeek / Qwen / Kimi / Zhipu and 14+ providers, or reuse your local Claude Code / Codex CLI — generate weekly reports, risk reviews and status updates in one click.'
    },
    'feat.3.t': { zh: '多端同步', en: 'Multi-device sync' },
    'feat.3.d': {
      zh: 'GitHub 私有仓库，或任意 WebDAV（坚果云 / Nextcloud）。后台按需自动同步，密钥本机加密、永不随数据上传。',
      en: 'A private GitHub repo, or any WebDAV (Nextcloud, ownCloud…). Syncs automatically in the background; keys are encrypted locally and never travel with your data.'
    },
    'feat.4.t': { zh: '日历订阅 + 节假日', en: 'Calendar feeds + holidays' },
    'feat.4.d': {
      zh: '订阅任意 .ics 日历作只读叠加；内置中国节假日 + 农历 + 调休，多地区可切换。',
      en: 'Subscribe to any .ics calendar as a read-only overlay. Built-in China holidays + lunar calendar + make-up workdays, with switchable regions.'
    },
    'feat.5.t': { zh: '本地优先', en: 'Local-first' },
    'feat.5.d': {
      zh: '数据存在你本机，离线可用。同步、AI 全部可选——隐私你说了算。',
      en: 'Your data lives on your machine and works offline. Sync and AI are entirely optional — your privacy, your call.'
    },
    'feat.6.t': { zh: '自动更新', en: 'Auto-update' },
    'feat.6.d': {
      zh: '签名 + 公证的安装包，后台静默下载，重启即更新。macOS / Windows / Linux 全平台覆盖。',
      en: 'Signed and notarized installers, downloaded silently in the background, applied on restart. Covers macOS / Windows / Linux.'
    },

    // ── craft (feature close-ups) ──
    'craft.title': { zh: '细节，值得放大看', en: 'Details that hold up close' },
    'craft.lede': {
      zh: '每一处交互都按桌面应用的标准打磨——这里挑八处。',
      en: 'Every interaction is built to desktop standards — here are eight.'
    },
    'craft.schedule.t': { zh: '划选即排期，工作日实时计算', en: 'Drag to schedule, working days counted live' },
    'craft.schedule.d': {
      zh: '在日历上拖出一段时间，选好业务线和阶段；法定节假日自动标出，点一下即可排除某天，底部把工作日数实时算给你看。',
      en: 'Drag across the calendar, pick a track and a phase. Public holidays are flagged automatically, any day can be excluded with a click, and the working-day count updates live at the bottom.'
    },
    'craft.calendar.t': { zh: '节假日、农历、调休，开箱即用', en: 'Holidays, lunar dates and make-up days, out of the box' },
    'craft.calendar.d': {
      zh: '内置多地区法定节假日——含中国调休的「休 / 班」角标——以及农历；周末与假期自动淡化，排期色条上的头像让「谁在做什么」一目了然。',
      en: 'Built-in public holidays for many regions — including China\'s make-up day badges — plus the lunar calendar. Weekends and holidays fade back, and avatars on the bars show who is on what at a glance.'
    },
    'craft.detail.t': { zh: '一个需求的全部上下文', en: 'Everything about a project, in one place' },
    'craft.detail.d': {
      zh: '富文本备注支持标题、列表、引用、代码块与图片粘贴；标签可以用同事头像，状态、阶段与排期始终钉在手边。',
      en: 'Rich-text notes with headings, lists, quotes, code blocks and pasted images. Tags can be teammates\' avatars, and status, phases and dates stay pinned at hand.'
    },
    'craft.ai.t': { zh: 'AI 替你写周报', en: 'AI writes the weekly report' },
    'craft.ai.d': {
      zh: '选个时间范围，AI 按业务线汇总进行中与已结束、标出风险与下周节点；生成历史随时复制，14+ 服务商或本机 CLI 任选。',
      en: 'Pick a range and AI sums up what\'s in flight and what shipped, flags risks and next week\'s milestones. History is one click to copy; bring any of 14+ providers or your local CLI.'
    },
    'craft.settings.t': { zh: '更多个性化，等你探索', en: 'More to make it yours' },
    'craft.settings.d': {
      zh: '浅色四款、深色四款主题底色，强调色、界面字体、每周起始日……还有自定义 CSS 兜底，把它调成你的样子。',
      en: 'Four light and four dark base palettes, accent color, interface font, first day of the week… and custom CSS when you want to go further.'
    },
    'craft.tags.t': { zh: '给标签配上头像，谁负责一眼认出', en: 'Put a face on every label' },
    'craft.tags.d': {
      zh: '标签可以是同事——用名字首字的色块，或上传一张头像；它会跟着出现在侧栏、日历色条和搜索结果里，「谁在做什么」一眼认出。',
      en: 'Tags can be teammates — a colored initial or an uploaded avatar. They follow through the sidebar, calendar bars and search, so who-is-on-what reads at a glance.'
    },
    'craft.group.t': { zh: '一份列表，四种分组', en: 'One list, four groupings' },
    'craft.group.d': {
      zh: '左侧需求列表可按业务线、时间、阶段或状态分组，再配合开始 / 结束时间排序与「显示已结束」，需求再多也能快速归位。',
      en: 'Group the project list by track, time, phase or status — with start/end sorting and a "show finished" toggle — so even a long backlog stays navigable.'
    },
    'craft.search.t': { zh: '⌘F 直达任何需求', en: 'Press ⌘F to jump to anything' },
    'craft.search.d': {
      zh: '一个搜索框同时搜需求、业务线和标签；结果带上业务线与排期区间，回车即定位到日历与列表中的对应位置。',
      en: 'One box searches projects, tracks and tags at once. Results show the track and date range, and Enter jumps straight to it on the calendar and list.'
    },

    // ── download (mostly rendered by app.js via YokeI18n.t) ──
    'dl.title': { zh: '下载', en: 'Download' },
    'dl.fetching': { zh: '正在获取最新版本…', en: 'Fetching the latest version…' },
    'dl.latest': { zh: '最新版本 {v} Beta · {date}', en: 'Latest {v} Beta · {date}' },
    'dl.soon': { zh: '即将发布首个版本', en: 'First release coming soon' },
    'dl.empty': {
      zh: '还没有正式发布。可前往 GitHub Releases 关注最新动态。',
      en: 'No release yet — follow GitHub Releases for updates.'
    },
    'dl.yoursystem': { zh: '你的系统', en: 'Your system' },
    'dl.download': { zh: '下载', en: 'Download' },
    'dl.none': { zh: '该平台暂未提供', en: 'Not available for this platform yet' },
    'dl.foot': { zh: '所有版本见', en: 'All versions on' },
    'dl.heroBest': { zh: '下载 {label}', en: 'Download {label}' },
    'dl.heroMore': { zh: '更多架构 & 平台 ↓', en: 'More builds & platforms ↓' },
    'arch.arm': { zh: 'Apple Silicon', en: 'Apple Silicon' },
    'arch.intel': { zh: 'Intel', en: 'Intel' },
    'arch.winAll': { zh: '通用包', en: 'Universal' },
    'arch.generic': { zh: '安装包', en: 'Installer' },

    // ── changelog ──
    'cl.title': { zh: '最近更新', en: "What's new" },
    'cl.loading': { zh: '加载中…', en: 'Loading…' },
    'cl.empty': {
      zh: '首个版本发布后，更新内容会自动显示在这里。',
      en: 'Once the first version ships, release notes will appear here automatically.'
    },
    'cl.more': { zh: '查看全部版本 →', en: 'See all releases →' },
    'cl.nonotes': { zh: '本次发布没有附带说明。', en: 'No notes for this release.' },

    // ── footer ──
    'footer.docs': { zh: '文档', en: 'Docs' },
    'footer.home': { zh: '首页', en: 'Home' },
    'footer.github': { zh: 'GitHub', en: 'GitHub' },
    'footer.feedback': { zh: '问题反馈', en: 'Feedback' },
    'footer.tagline': {
      zh: '掌控排期。',
      en: 'Own your schedule.'
    },

    // ── per-page <title> / <meta> ──
    'meta.indexTitle': { zh: 'Yoke Calendar · 桌面排期日历', en: 'Yoke Calendar · Desktop scheduling calendar' },
    'meta.indexDesc': {
      zh: '个人和团队的桌面排期日历——划选即排期，AI 总结进度，多端同步，本地优先。支持 macOS / Windows / Linux。',
      en: 'A desktop scheduling calendar for individuals and teams — drag to schedule, AI progress summaries, multi-device sync, local-first. macOS / Windows / Linux.'
    },
    'meta.ogTitle': { zh: 'Yoke Calendar · 桌面排期日历', en: 'Yoke Calendar · Desktop scheduling calendar' },
    'meta.ogDesc': {
      zh: '划选即排期 · AI 进度总结 · 多端同步 · 本地优先。',
      en: 'Drag to schedule · AI summaries · Multi-device sync · Local-first.'
    },
    'meta.docsTitle': { zh: '文档 · Yoke Calendar', en: 'Docs · Yoke Calendar' },
    'meta.docsDesc': {
      zh: 'Yoke Calendar 使用文档：排期、同步、AI 总结、日历订阅、数据与更新。',
      en: 'Yoke Calendar docs: scheduling, sync, AI summaries, calendar feeds, data & updates.'
    }
  }

  function interp(s, p) {
    return p ? s.replace(/\{(\w+)\}/g, function (_, k) { return p[k] != null ? p[k] : '' }) : s
  }
  function str(key, lang, params) {
    var e = STR[key]
    if (!e) return null
    return interp(e[lang] != null ? e[lang] : e.zh, params)
  }

  var cur = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'zh'

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var s = str(el.getAttribute('data-i18n'), lang)
      if (s != null) el.textContent = s
    })
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var i = pair.indexOf(':')
        if (i < 0) return
        var s = str(pair.slice(i + 1).trim(), lang)
        if (s != null) el.setAttribute(pair.slice(0, i).trim(), s)
      })
    })
    document.documentElement.setAttribute('data-lang', lang)
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  }

  window.YokeI18n = {
    get lang() { return cur },
    t: function (key, params) {
      var s = str(key, cur, params)
      return s != null ? s : key
    },
    set: function (lang) {
      lang = lang === 'en' ? 'en' : 'zh'
      if (lang === cur) return
      cur = lang
      try { localStorage.setItem('yoke-lang', lang) } catch (_) {}
      apply(lang)
      window.dispatchEvent(new Event('yoke:langchange'))
    }
  }

  apply(cur)

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#lang-toggle')) return
    window.YokeI18n.set(cur === 'en' ? 'zh' : 'en')
  })
})()
