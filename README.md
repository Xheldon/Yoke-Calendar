# Yoke Calendar — 官网 + 发布

这个**公开**仓库托管 [Yoke Calendar](https://github.com/Xheldon/Yoke-Calendar) 的**官网**与**发布产物**(应用源码在另一个私有仓库)。

- **官网**:`index.html` / `docs.html` + `assets/`,纯静态,GitHub Pages 托管。下载按钮与更新日志由 `assets/app.js` 在运行时从本仓库的 Releases 拉取——**发版后官网自动更新,无需改动**。
- **发布产物**:各平台安装包只存在 [Releases](../../releases),不进仓库树(由私有仓库的 CI 用 `electron-builder` 自动上传 + 生成更新日志)。

## 部署(Cloudflare Pages)

纯静态站,无构建步骤:

1. Cloudflare 控制台 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**,选 `Xheldon/Yoke-Calendar`。
2. 构建设置:**Framework preset** 选 `None`,**Build command** 留空,**Build output directory** 填 `/`(仓库根目录)。
3. Deploy。几十秒后站点上线于 `<项目名>.pages.dev`。
4. 自定义域名:Pages 项目 → **Custom domains** → 添加域名(DNS 在 Cloudflare 上会自动配好)。

> **不需要**任何环境变量 / Secret——下载链接和更新日志是前端运行时直接调 GitHub Releases API 拉取的(GitHub API 带 CORS,任意域名可读)。CI 用的那些 Secret 是给**私有仓库**打包用的,与本站无关。
>
> 站内所有链接要么相对路径、要么根路径 `/`,在 Pages 的根域名 / `pages.dev` 下都正确。`.nojekyll` 在 Cloudflare 上无作用但留着无妨(便于同时挂 GitHub Pages)。

> 也可挂 **GitHub Pages**:Settings → Pages → Source 选 `main` / `(root)`。注意 Pages 项目站点在子路径 `…/Yoke-Calendar/` 下,根路径 `/` 的品牌链接会指向用户主页——所以更推荐 Cloudflare Pages(根域名)。

## 本地预览

```bash
python3 -m http.server 8090   # 然后打开 http://localhost:8090
```
