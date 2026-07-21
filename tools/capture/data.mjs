/* data.mjs — the demo datasets, as SOURCE STRINGS evaluated inside the page (they
   build canvas data-URLs, so they must run in a DOM). One builder per language;
   both share ids and shape so the two screenshot sets read as siblings.
   World: July 2026, today = Tue Jul 21 2026. */

export const buildDataSrc = (lang) => `
(() => {
  const L = ${JSON.stringify(lang)}
  const avatar = (emoji, bg) => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const g = c.getContext('2d')
    g.fillStyle = bg; g.beginPath(); g.arc(32, 32, 32, 0, 7); g.fill()
    g.font = '40px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(emoji, 32, 36)
    return c.toDataURL('image/png')
  }
  const banner = (title, sub, pills, accentA, accentB) => {
    const c = document.createElement('canvas'); c.width = 840; c.height = 320
    const g = c.getContext('2d')
    const grad = g.createLinearGradient(0, 0, 840, 320)
    grad.addColorStop(0, accentA); grad.addColorStop(1, accentB)
    g.fillStyle = grad; g.beginPath(); g.roundRect(0, 0, 840, 320, 28); g.fill()
    g.fillStyle = '#fff'
    g.font = '700 60px -apple-system, "PingFang SC", system-ui'
    g.fillText(title, 56, 140)
    g.font = '24px -apple-system, "PingFang SC", system-ui'
    g.fillStyle = 'rgba(255,255,255,.75)'
    g.fillText(sub, 56, 194)
    let x = 56
    for (const t of pills) {
      g.font = '600 20px -apple-system, "PingFang SC", system-ui'
      const w = g.measureText(t).width + 36
      g.fillStyle = 'rgba(255,255,255,.14)'
      g.beginPath(); g.roundRect(x, 232, w, 40, 20); g.fill()
      g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(t, x + 18, 259)
      x += w + 14
    }
    return c.toDataURL('image/png')
  }
  const seg = (a, b) => ({ start: a, end: b, exclude: [] })

  if (L === 'zh') {
    const note = [
      '## 暑期大促主会场',
      '',
      '**目标**：核心会场 GMV 同比 +30%，UV→下单转化率 +2pp。',
      '',
      '### 关键里程碑',
      '',
      '- 7/15 开发自测完成',
      '- 7/17 联调通过',
      '- 7/21 测试回归 + 全链路压测',
      '- 7/24 灰度上线（10%）',
      '',
      '> 主视觉「红金」方向已定，素材 7/16 前交付。',
      '',
      \`![banner](\${banner('暑期大促', '核心会场 · 分会场 · 券后价', ['GMV +30%', '转化 +2pp'], '#7a1f2b', '#b8452e')})\`,
      '',
      '相关同学：产品 王霞 · 设计 陈雪 · 前端 李伟'
    ].join('\\n')
    return {
      version: 1,
      lines: [
        { id: 'rev', name: '营收活动', hue: 15 },
        { id: 'growth', name: '用户增长', hue: 150 },
        { id: 'base', name: '基础体验', hue: 230 },
        { id: 'data', name: '数据平台', hue: 280 }
      ],
      stages: [
        { id: 'b', name: '开发' }, { id: 'r', name: '联调' },
        { id: 'q', name: '测试' }, { id: 's', name: '上线' }
      ],
      tags: [
        { id: 'wx', name: '王霞', hue: 330, image: avatar('👩‍🎨', '#fce7f3') },
        { id: 'cx', name: '陈雪', hue: 220, image: avatar('🧑‍💻', '#dbeafe') },
        { id: 'lw', name: '李伟', hue: 30, image: avatar('👨‍🚀', '#ffedd5') },
        { id: 'p0', name: '高', hue: 15, glyph: 0 },
        { id: 'p1', name: '中', hue: 200, glyph: 0 },
        { id: 'p2', name: '急', hue: 150, glyph: 0 }
      ],
      requirements: [
        { id: 'main', name: '暑期大促主会场', lineId: 'rev', hue: 15, createdAt: '2026-06-22', note, tags: ['wx', 'p0'],
          sched: { b: seg('2026-07-13', '2026-07-15'), r: seg('2026-07-16', '2026-07-17'), q: seg('2026-07-20', '2026-07-23'), s: seg('2026-07-24', '2026-07-24') } },
        { id: 'red', name: '新人首单红包', lineId: 'rev', hue: 5, createdAt: '2026-07-06',
          note: '风控规则与增长同学对齐，7/24 前给出灰度名单。', tags: ['wx', 'p1'],
          sched: { b: seg('2026-07-20', '2026-07-28') } },
        { id: 'inv', name: '邀请有礼 2.0', lineId: 'growth', hue: 150, createdAt: '2026-07-02',
          note: '双向奖励 + 反作弊校验。\\n\\n需求文档：https://docs.example.com/invite-v2', tags: ['cx'],
          sched: { b: seg('2026-07-20', '2026-07-28'), q: seg('2026-07-29', '2026-07-31') } },
        { id: 'search', name: '搜索结果改版', lineId: 'base', hue: 205, createdAt: '2026-07-10',
          note: '召回与排序拆开，先上召回。', tags: ['lw'],
          sched: { b: seg('2026-07-27', '2026-08-05') } },
        { id: 'track', name: '全链路埋点治理', lineId: 'data', hue: 280, createdAt: '2026-07-12',
          note: '统一口径 + 灰度放量后观察埋点丢失率。', tags: ['lw', 'p0'],
          sched: { b: seg('2026-07-28', '2026-08-05'), q: seg('2026-08-06', '2026-08-08') } },
        { id: 'link', name: '直播间连麦优化', lineId: 'base', hue: 245, createdAt: '2026-07-14',
          note: '', tags: ['cx'],
          sched: { b: seg('2026-08-10', '2026-08-18') } },
        { id: 'vip', name: '会员成长体系', lineId: 'growth', hue: 130, createdAt: '2026-06-18',
          note: '', tags: ['wx'],
          sched: { q: seg('2026-06-29', '2026-07-10') } },
        { id: 'board', name: '实时大盘看板', lineId: 'data', hue: 265, createdAt: '2026-06-15',
          note: '', tags: ['lw'],
          sched: { b: seg('2026-06-24', '2026-07-03') } },
        { id: 'perf', name: '性能专项治理', lineId: '', hue: 320, createdAt: '2026-07-01',
          note: '季度 OKR —— 端到端 p95 < 200ms。\\n\\n本周：干掉了看板查询的 N+1；埋点上报链路已切换到批量。', tags: ['cx'],
          span: { start: '2026-07-01', end: '2026-09-30' }, sched: {} }
      ],
      updatedAt: new Date().toISOString()
    }
  }

  const note = [
    '## Dark mode',
    '',
    '**Goal**: a true dark theme on web and mobile, on by default.',
    '',
    '### Key milestones',
    '',
    '- 7/15 token audit & palette freeze',
    '- 7/17 component sweep done',
    '- 7/21 QA round-trip + contrast pass',
    '- 7/24 beta rollout (10%)',
    '',
    '> Neutral-cool greys, no pure black. The accent stays warm.',
    '',
    \`![banner](\${banner('Dark mode', 'True dark across web · desktop · mobile', ['OLED-safe', 'WCAG AA'], '#1b1e3a', '#2b2050')})\`,
    '',
    'Team: Priya (design) · Alex (web) · Sam (mobile)'
  ].join('\\n')
  return {
    version: 1,
    lines: [
      { id: 'rev', name: 'Core App', hue: 230 },
      { id: 'growth', name: 'Growth', hue: 15 },
      { id: 'base', name: 'Payments', hue: 150 },
      { id: 'data', name: 'Platform', hue: 280 }
    ],
    stages: [
      { id: 'b', name: 'Build' }, { id: 'r', name: 'Review' },
      { id: 'q', name: 'QA' }, { id: 's', name: 'Ship' }
    ],
    tags: [
      { id: 'wx', name: 'Priya', hue: 330, image: avatar('👩‍🎨', '#fce7f3') },
      { id: 'cx', name: 'Alex', hue: 220, image: avatar('🧑‍💻', '#dbeafe') },
      { id: 'lw', name: 'Sam', hue: 30, image: avatar('👨‍🚀', '#ffedd5') },
      { id: 'p0', name: 'High', hue: 15, glyph: 0 },
      { id: 'p1', name: 'Medium', hue: 200, glyph: 0 },
      { id: 'p2', name: 'Urgent', hue: 150, glyph: 0 }
    ],
    requirements: [
      { id: 'main', name: 'Dark mode', lineId: 'rev', hue: 225, createdAt: '2026-06-22', note, tags: ['cx', 'p0'],
        sched: { b: seg('2026-07-13', '2026-07-15'), r: seg('2026-07-16', '2026-07-17'), q: seg('2026-07-20', '2026-07-23'), s: seg('2026-07-24', '2026-07-24') } },
      { id: 'red', name: 'Global search', lineId: 'rev', hue: 205, createdAt: '2026-07-06',
        note: 'Instant fuzzy search across projects, notes and tags.\\n\\nPRD: https://docs.example.com/global-search', tags: ['wx'],
        sched: { b: seg('2026-07-27', '2026-08-05') } },
      { id: 'inv', name: 'Referral program', lineId: 'growth', hue: 15, createdAt: '2026-07-02',
        note: 'Double-sided rewards; fraud checks with the Payments team.', tags: ['wx', 'p1'],
        sched: { b: seg('2026-07-20', '2026-07-28'), q: seg('2026-07-29', '2026-07-31') } },
      { id: 'search', name: 'Stripe subscription upgrades', lineId: 'base', hue: 150, createdAt: '2026-06-28',
        note: 'Proration + invoice preview.\\n\\nAPI doc: https://docs.example.com/billing-upgrades', tags: ['lw', 'p2'],
        sched: { b: seg('2026-07-08', '2026-07-16'), r: seg('2026-07-20', '2026-07-22'), q: seg('2026-07-23', '2026-07-25') } },
      { id: 'track', name: 'API rate limiting', lineId: 'data', hue: 280, createdAt: '2026-07-12',
        note: 'Token bucket per key; dashboards in Grafana.', tags: ['cx', 'p0'],
        sched: { b: seg('2026-07-28', '2026-08-05'), q: seg('2026-08-06', '2026-08-08') } },
      { id: 'link', name: 'Dunning & retry flow', lineId: 'base', hue: 130, createdAt: '2026-07-14',
        note: '', tags: ['lw'],
        sched: { b: seg('2026-08-10', '2026-08-18') } },
      { id: 'vip', name: 'Onboarding checklist v2', lineId: 'growth', hue: 5, createdAt: '2026-06-18',
        note: '', tags: ['wx'],
        sched: { q: seg('2026-06-29', '2026-07-10') } },
      { id: 'board', name: 'Audit log export', lineId: 'data', hue: 265, createdAt: '2026-06-15',
        note: '', tags: ['lw'],
        sched: { b: seg('2026-06-24', '2026-07-03') } },
      { id: 'perf', name: 'Performance overhaul', lineId: '', hue: 320, createdAt: '2026-07-01',
        note: 'Quarterly OKR — p95 < 200 ms end-to-end.\\n\\nThis week: killed the N+1 on the board query; metrics ingest switched to batching.', tags: ['cx'],
        span: { start: '2026-07-01', end: '2026-09-30' }, sched: {} }
    ],
    updatedAt: new Date().toISOString()
  }
})()
`

export const AI_RECORD = (lang) => ({
  id: 'h1',
  createdAt: '2026-07-20T10:35:00.000Z',
  rangeKey: 'week',
  rangeStart: '2026-07-20',
  rangeEnd: '2026-07-26',
  prompt:
    lang === 'zh'
      ? '请基于以下排期，生成一份面向团队的中文周报：分业务线汇总，标注进行中/已结束，语气简洁专业。'
      : 'Write a concise weekly report for the team from the schedule below: group by track, flag risks, keep it crisp.',
  result:
    lang === 'zh'
      ? [
          '周报（7.20 – 7.26）',
          '',
          '一、营收活动',
          '· 暑期大促主会场：测试中（7.20 – 7.23，4 天），里程碑正常 —— 7.24 灰度上线',
          '· 新人首单红包：开发进行中（7.20 – 7.28），风控规则已与增长对齐',
          '',
          '二、用户增长',
          '· 邀请有礼 2.0：开发进行中（7.20 – 7.28），7.29 转测试',
          '',
          '三、长期事项',
          '· 性能专项治理（7.1 ~ 9.30，第 3/14 周）：干掉了看板查询的 N+1，p95 正向 200ms 收敛 ✅',
          '',
          '四、风险提示',
          '· 主会场测试与邀请有礼开发在 7.20 – 7.23 重叠，联调资源需提前一天对齐',
          '',
          '五、下周关键节点',
          '7.27：搜索结果改版启动 + 全链路埋点治理开发'
        ].join('\n')
      : [
          'Weekly report (Jul 20 – Jul 26)',
          '',
          '1. Core App',
          '· Dark mode: in QA (Jul 20 – 23, 4d), milestones on track — beta rollout Jul 24',
          '· Global search: build starts Jul 27, typeahead index scoped',
          '',
          '2. Growth',
          '· Referral program: build in progress (Jul 20 – 28), anti-abuse rules aligned with risk',
          '',
          '3. Payments',
          '· Stripe subscription upgrades: review Jul 20 – 22, QA to follow (Jul 23 – 25)',
          '',
          '4. Long-run',
          '· Performance overhaul (Jul 1 ~ Sep 30, week 3/14): killed the N+1 on the board query — p95 tracking toward 200 ms ✅',
          '',
          '5. Risks',
          '· Stripe review overlaps Dark mode QA (Jul 20 – 22) — align interfaces a day early',
          '',
          '6. Next week',
          'Jul 27: Global search kickoff + API rate limiting build'
        ].join('\n'),
  source: 'ai',
  model: '',
  format: 'AI',
  count: 5
})

/** note template shown in the settings shot */
export const TEMPLATE = (lang) =>
  lang === 'zh'
    ? { id: 't1', name: '需求模板', text: '需求文档：\n设计稿：\n接口文档：\n产品：' }
    : { id: 't1', name: 'Feature PRD', text: 'PRD:\nDesign:\nAPI doc:\nPM:' }

/** search term: hits ONE project name + ONE note, so the shot shows both kinds of match */
export const SEARCH_TERM = (lang) => (lang === 'zh' ? '埋点' : 'da')
