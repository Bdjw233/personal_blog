# 沈宇轩 · 个人站点

Astro + Tailwind CSS 的静态个人站点：简历、项目、技术博客。

## 开发

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 dist/
npm run preview
```

## 目录

```
src/
├── data/profile.ts        # 全站内容来源（中英双语），改文案只改这里
├── config/site.ts         # 站点元信息（标题、描述、社交链接）
├── layouts/BaseLayout.astro   # 头部 / 导航 / 页脚 / 主题与语言逻辑
├── components/            # Hero、About、Projects、Blog、PostList、Contact
├── pages/                 # 路由
├── content/blog/          # Markdown 文章（content collection）
├── content.config.ts      # 文章 frontmatter 的 schema
└── styles/global.css      # 设计令牌、明暗主题、排版
```

## 内容维护

**改个人信息、经历、项目**：只改 `src/data/profile.ts`。每个字段都是 `{ zh, en }`，页面里用
`<span data-en="...">中文</span>` 渲染，语言切换只做文本替换，不需要写两套模板。

**加文章**：在 `src/content/blog/` 新建 `.md`，frontmatter 需要 `title`、`description`、
`pubDate`；`tags` 与 `draft` 可选（`draft: true` 不会出现在列表和构建产物中）。
阅读时长由字数自动计算。

**换域名 / 换部署地址**：站点地址统一由环境变量 `SITE_URL` 控制，默认
`https://Bdjw233.github.io`（GitHub Pages 用户站点）。三处会自动读到它：`src/data/profile.ts`
的 `siteUrl`、`astro.config.mjs`、`public/robots.txt`。若用「项目站点」部署，再额外设
`BASE_PATH=/<仓库名>/`。

## 主题

- 暗色：墨绿夜色（默认）
- 亮色：宣纸暖白

所有颜色都在 `src/styles/global.css` 顶部的两段变量里，组件只用语义类名
（`bg-canvas`、`text-ink`、`border-line`、`text-accent`、`text-bamboo`）。
主题存在 `localStorage.theme`，在 `<head>` 内联脚本里于首屏渲染前应用，不会闪白。

## 部署

`npm run build` 后把 `dist/` 丢给任意静态托管（GitHub Pages / Cloudflare Pages / Vercel / Netlify / Nginx）。

**GitHub Pages**：默认按用户站点配置（`base: '/'`，地址 `https://Bdjw233.github.io`）。
若部署为项目站点，构建时加上 `BASE_PATH`：

```sh
SITE_URL=https://Bdjw233.github.io BASE_PATH=/my-blog/ npm run build
```

## 未来

使用treejs

## License

代码采用 [MIT License](LICENSE)，版权归 沈宇轩（Shen Yuxuan）所有。
博客文章等原创内容保留版权，未经许可请勿转载。