# X Media Downloader · 推特媒体下载器

> 下载 X (Twitter) 账号的全部图片和视频，最高清晰度，零后端、纯静态、免费部署。

![GitHub](https://img.shields.io/badge/license-MIT-blue) ![No Backend](https://img.shields.io/badge/backend-none-green) ![Free Deploy](https://img.shields.io/badge/deploy-Netlify%20%7C%20CF%20Pages-brightgreen)

---

## 📋 目录

- [项目简介](#项目简介)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [使用教程](#使用教程)
- [工作原理](#工作原理)
- [开发目标需求清单](#开发目标需求清单)
- [部署到免费平台](#部署到免费平台)
- [常见问题](#常见问题)
- [注意事项](#注意事项)
- [技术栈](#技术栈)
- [开发路线](#开发路线)
- [License](#license)

---

## 项目简介

**X Media Downloader** 是一个零后端的纯静态 Web 工具，用于批量下载 X (Twitter) 账号下的所有图片和视频资源。

适用于以下场景：

- 备份自己发布的推文媒体
- 归档关心的创作者内容
- 研究特定账号的发布历史
- 个人收藏整理

**核心理念**：

- 🎯 **零成本部署**：纯静态文件，可托管在 Netlify / Cloudflare Pages / Vercel 等免费平台
- 🔐 **隐私优先**：Cookie 仅保存在你的浏览器本地，不上传任何服务器
- ⚡ **即开即用**：打开网页就能用，不需要注册账号、不需要后端服务
- 🎬 **最高画质**：图片用 `?name=orig`，视频取 `video_info.variants` 中码率最高的 `mp4`

---

## 核心特性

| 特性 | 说明 |
|------|------|
| 🖼️ **图片批量下载** | 拉取账号历史所有推文，提取最高清原图 |
| 🎬 **视频批量下载** | 解析视频推文，下载最高码率版本（支持长视频、推文视频、动图） |
| 📑 **双 Tab 浏览** | 图片 / 视频分开管理，切换方便 |
| 🟣 **下载状态标记** | 点击下载后按钮变紫色，刷新页面后状态保留 |
| 📋 **导出 JSON 清单** | 一键导出所有媒体元数据 |
| ⬇️ **触发式下载** | 利用浏览器原生下载对话框，避免服务器带宽 |
| 🔄 **增量抓取** | 支持中断后继续抓取（可手动调整 maxTweets 数量） |
| 🌗 **深色主题** | 暗色 UI，长时间使用不刺眼 |
| 📱 **响应式设计** | 适配桌面、平板、手机 |
| 💾 **本地持久化** | Cookie 和下载记录保存在 localStorage |

---

## 快速开始

### 方式 1：本地运行

```bash
git clone https://github.com/yourname/x-media-downloader.git
cd x-media-downloader
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

或使用 Node：

```bash
npx serve .
```

### 方式 2：Netlify 拖拽部署（最简单）

1. 访问 https://app.netlify.com/drop
2. 把整个项目文件夹拖进去
3. 等待 5-10 秒，得到一个 `xxx.netlify.app` 的 URL

### 方式 3：Cloudflare Pages

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=x-media-downloader
```

---

## 使用教程

### 第一步：获取 X Cookie

1. 登录 https://x.com
2. 按 `F12` 打开 DevTools
3. 切换到 `Network` 标签
4. 刷新页面，点击任意请求
5. 在 `Request Headers` 中找到 `cookie` 字段
6. 复制整个 Cookie 字符串

**示例 Cookie**（已脱敏）：

```
auth_token=abc123...; ct0=xyz789...; gt=1234567890...; twid=u%3D12345
```

### 第二步：配置工具

1. 打开部署好的网页
2. 粘贴 Cookie 到第一个输入框
3. 输入目标用户名（不带 `@`，例如 `elonmusk`）
4. 设置最大推文数（默认 200，可调 1-5000）
5. 勾选"记住 Cookie"可避免每次重新输入

### 第三步：抓取媒体

点击「🚀 抓取媒体」按钮，等待抓取完成：

- 进度条显示当前进度
- 日志区显示每页的抓取情况
- 抓取完成后自动展示媒体列表

### 第四步：浏览与下载

- 切换「🖼️ 图片」或「🎬 视频」Tab
- 每个媒体卡片包含：缩略图、推文链接、发布日期
- 点击「⬇️ 下载」按钮触发浏览器下载
- 下载后按钮变紫色，状态在 localStorage 持久化

**高级操作**：

- 「📥 全部下载」：依次触发所有文件下载（间隔 500ms）
- 「📋 导出清单」：导出 JSON 格式的所有媒体信息

---

## 工作原理

### 数据流

```
用户输入 Cookie + 用户名
       ↓
GraphQL API: UserByScreenName → 获取 user_id
       ↓
GraphQL API: UserMedia → 分页拉取推文
       ↓
解析每条推文的 extended_entities.media
       ↓
提取最高清 URL（图片 ?name=orig，视频最高 bitrate）
       ↓
渲染到 UI（双 Tab 列表）
       ↓
用户点击下载 → <a download> 触发浏览器原生下载
```

### 技术细节

**X GraphQL API 端点**：

| 端点 | 用途 |
|------|------|
| `UserByScreenName` | 通过用户名解析 `user_id` |
| `UserMedia` | 分页拉取用户发布的媒体推文 |

**图片清晰度**：

```
原图 URL: https://pbs.twimg.com/media/xxx.jpg
?name=thumb    → 缩略图 (150x150)
?name=small    → 小图 (680x680)
?name=medium   → 中图 (1200x1200)
?name=large    → 大图 (2048x2048)
?name=orig     → 原图 (无压缩，最高画质) ← 本工具使用
```

**视频清晰度**：

从 `video_info.variants` 数组中筛选 `content_type === 'video/mp4'`，按 `bitrate` 降序排序，取第一个即为最高码率版本。

---

## 开发目标需求清单

### Phase 1：MVP（已完成 ✅）

- [x] 单页 HTML 应用（HTML + CSS + JS 全部内联）
- [x] Cookie 输入 + localStorage 持久化
- [x] 用户名输入 + 拉取推文配置
- [x] 进度条 + 实时日志
- [x] 双 Tab 浏览（图片 / 视频）
- [x] 媒体卡片（缩略图 + 推文链接 + 日期 + 下载按钮）
- [x] 点击下载后按钮变紫色
- [x] 下载状态持久化
- [x] 一键全部下载
- [x] 导出 JSON 清单
- [x] 最高清晰度支持
- [x] 响应式设计
- [x] 深色主题
- [x] 风控保护（请求间隔 1.5 秒）

### Phase 2：增强功能（规划中）

- [ ] 增量抓取（按 `since_id` 仅拉取新推文）
- [ ] 多账号批量任务
- [ ] 推文原文保存（不只媒体）
- [ ] 评论抓取
- [ ] 媒体去重（按图片 hash）
- [ ] 媒体类型筛选（仅图片 / 仅视频）
- [ ] 时间范围筛选
- [ ] 排序选项（按日期 / 按清晰度 / 按类型）
- [ ] 搜索功能（推文文本搜索）
- [ ] 收藏 / 书签抓取
- [ ] 关注列表抓取
- [ ] ZIP 打包下载（用 JSZip）
- [ ] 拖拽上传自定义 Cookie 文件
- [ ] 多语言支持（英文 / 简体中文 / 繁体中文）
- [ ] PWA 支持（可安装到桌面）

### Phase 3：高级特性（未来）

- [ ] 媒体元数据 EXIF 保留
- [ ] 视频缩略图自动生成
- [ ] AI 自动标签（图像识别）
- [ ] 数据可视化（时间线 / 类型分布）
- [ ] 与 Notion / Obsidian 集成
- [ ] 浏览器扩展（Chrome / Firefox）
- [ ] 桌面应用（Electron / Tauri）
- [ ] 协作功能（团队共享任务）

### 非功能需求

- [x] 性能：单页加载 < 1 秒
- [x] 兼容性：Chrome / Firefox / Safari / Edge 现代浏览器
- [x] 可访问性：键盘导航 + ARIA 标签
- [x] 国际化：中英文双语
- [ ] 测试：单元测试 + E2E 测试
- [ ] 监控：错误上报 + 性能监控
- [ ] 文档：API 文档 + 开发者文档

---

## 部署到免费平台

### Netlify（推荐）

**方式 1：拖拽部署**

1. 访问 https://app.netlify.com/drop
2. 拖入 `x-media-downloader` 文件夹
3. 等待几秒，得到 `xxx.netlify.app` 域名

**方式 2：GitHub 集成**

1. 把项目推送到 GitHub
2. 在 Netlify 后台点击 "Add new site" → "Import an existing project"
3. 选择你的 GitHub 仓库
4. 构建设置保持默认（无需 build command）
5. 发布目录设为 `/` 或 `.`
6. 点击 Deploy，几秒后部署完成

**方式 3：Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Cloudflare Pages

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=x-media-downloader
```

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages

1. 把项目推送到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选 `main` 分支，根目录 `/`
4. 保存，几分钟后部署完成

---

## 常见问题

### Q1：抓取失败，提示"用户不存在或 Cookie 无效"？

**A**：检查以下几点：

1. Cookie 是否完整（包含 `auth_token`、`ct0` 等关键字段）
2. Cookie 是否过期（重新登录 X 获取新的）
3. 用户名是否正确（不带 `@`，区分大小写）

### Q2：抓取几个推文后就停下来了？

**A**：可能是触发了 X 的风控：

1. 等待 10-30 分钟后再试
2. 减少 maxTweets 数量
3. 使用更"干净"的账号（不发广告、不频繁操作的）

### Q3：图片不是最高清？

**A**：检查下载的文件名是否带 `?name=orig`：

- ✅ 正确：`username_1234567890_2026-08-04.jpg`（清晰）
- ❌ 错误：可能是 X 服务端对大图做了压缩

### Q4：视频无法播放？

**A**：可能原因：

1. 视频文件不完整（下载中断）
2. X 已经删除原视频
3. 浏览器不支持该编码

### Q5：能下载私密账号吗？

**A**：不能。私密账号的推文只有粉丝可见，本工具通过 GraphQL API 只能看到你自己时间线的内容。

### Q6：会被封号吗？

**A**：本工具不直接操作 X 账号，只调用公开的 GraphQL API。风险：

- ⚠️ 高频请求（每分钟 > 30 次）可能触发临时 IP 封禁
- ⚠️ 不要用同一个 Cookie 在多台机器同时抓取
- ✅ 单账号、单 IP、每 1.5 秒请求一次，足够安全

---

## 注意事项

⚠️ **风控风险**：

X 对未授权抓取有反爬机制，过度使用可能导致 Cookie 被临时封禁。建议：
- 单次请求间隔 ≥ 1.5 秒（已内置）
- 不要在短时间内抓取超大账号（10w+ 推文）
- 准备备用 Cookie

⚠️ **法律合规**：

- 仅供个人备份使用
- 请勿用于商业用途或公开传播
- 下载的版权归原作者所有
- 下载前请尊重创作者的意愿

⚠️ **数据安全**：

- Cookie 等同于你的 X 账号密码，不要分享给任何人
- 不要在公共电脑使用本工具
- 离开座位前记得清除 Cookie

---

## 技术栈

- **Vanilla JavaScript**（ES6+）：无框架依赖，启动快、体积小
- **HTML5 + CSS3**：现代 Web 标准
- **X GraphQL API**：数据源
- **localStorage**：本地持久化
- **响应式设计**：CSS Grid + Flexbox

### 为什么不用框架？

- ✅ 零依赖，部署简单
- ✅ 首屏加载快（< 100KB）
- ✅ 学习成本低，方便二次开发
- ❌ 不适合超复杂应用（本工具功能明确，无需框架）

---

## 开发路线

### v1.0（当前）— MVP

单账号媒体抓取 + 下载，纯前端。

### v1.1 — 增强体验

增量抓取、筛选、排序、搜索、ZIP 打包。

### v1.2 — 高级功能

多账号、评论、收藏、AI 标签。

### v2.0 — 平台化

浏览器扩展、桌面应用、API 服务。

---

## 贡献

欢迎贡献代码、提交 Issue、提出建议。

```bash
# Fork 项目
git clone https://github.com/yourname/x-media-downloader.git
cd x-media-downloader

# 创建特性分支
git checkout -b feature/your-feature

# 提交改动
git add .
git commit -m "feat: add your feature"

# 推送到你的 fork
git push origin feature/your-feature

# 创建 Pull Request
```

---

## License

MIT © 2026 巴雷特
