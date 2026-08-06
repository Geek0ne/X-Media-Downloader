# X Media Downloader · 推特媒体下载器 v2.0

> 下载 X (Twitter) 账号的全部图片和视频，最高清晰度，零后端、纯静态、免费部署。

![License](https://img.shields.io/badge/license-MIT-blue) ![No Backend](https://img.shields.io/badge/backend-none-green) ![Free Deploy](https://img.shields.io/badge/deploy-Netlify%20%7C%20CF%20Pages-brightgreen) ![v2.0](https://img.shields.io/badge/version-2.0-orange)

---

## 📋 目录

- [项目简介](#项目简介)
- [v2.0 新特性](#v20-新特性)
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

**X Media Downloader** 是一个零后端的纯静态 Web 工具，用于批量下载 X (Twitter) 账号下的所有图片、视频和 GIF。

**核心理念**：

- 🎯 **零成本部署**：纯静态文件，可托管在 Netlify / Cloudflare Pages / Vercel 等免费平台
- 🔐 **隐私优先**：Cookie 仅保存在你的浏览器本地，不上传任何服务器
- ⚡ **即开即用**：打开网页就能用，不需要注册账号、不需要后端服务
- 🎬 **最高画质**：图片用 `?name=orig`，视频取 `video_info.variants` 中码率最高的 `mp4`
- 📦 **ZIP 打包**：一键打包所有媒体 + 推文原文

---

## v2.0 新特性

相比 v1.0，v2.0 新增以下功能：

| 新功能 | 说明 |
|--------|------|
| 🆕 **增量抓取** | 自动记忆 `since_id`，只拉取新推文，节省时间 |
| 🆕 **GIF 单独 Tab** | 图片 / 视频 / GIF 分开管理 |
| 🆕 **Lightbox 预览** | 点击缩略图大图查看，左右键盘切换，ESC 关闭 |
| 🆕 **ZIP 打包下载** | 一键打包所有媒体 + 推文原文 + README |
| 🆕 **搜索 + 日期筛选** | 按推文文本、推文 ID、日期范围筛选 |
| 🆕 **推文文本显示** | 卡片显示推文原文前 200 字符 |
| 🆕 **导出推文原文** | JSONL 格式导出所有推文（含点赞/转发数） |
| 🆕 **自动重试机制** | 限流 (429/503) 自动指数退避重试 |
| 🆕 **深色/亮色主题** | 一键切换，护眼 |
| 🆕 **键盘快捷键** | Lightbox 模式下 ← → ESC 操作 |

---

## 核心特性

| 特性 | 说明 |
|------|------|
| 🖼️ **图片批量下载** | 拉取账号历史所有推文，提取最高清原图 |
| 🎬 **视频批量下载** | 解析视频推文，下载最高码率版本 |
| 🎞️ **GIF 支持** | 单独 Tab 列出所有动图 |
| 📑 **三 Tab 浏览** | 图片 / 视频 / GIF 分开管理 |
| 🟣 **下载状态标记** | 点击下载后按钮变紫色，状态持久化 |
| 📋 **导出 JSON 清单** | 一键导出所有媒体元数据 |
| ⬇️ **触发式下载** | 利用浏览器原生下载对话框 |
| 🔄 **增量抓取** | 智能记忆 since_id，避免重复 |
| 🌗 **主题切换** | 深色/亮色自由切换 |
| 📱 **响应式设计** | 适配桌面、平板、手机 |
| 💾 **本地持久化** | Cookie、下载记录、主题都保存在 localStorage |

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

### 第二步：配置工具

1. 打开部署好的网页
2. 粘贴 Cookie 到第一个输入框
3. 输入目标用户名（不带 `@`）
4. 设置最大推文数（默认 200）
5. 勾选"记住 Cookie"和"增量抓取"

### 第三步：抓取媒体

点击「🚀 抓取媒体」按钮：
- 限流自动重试（指数退避：2s → 8s → 18s）
- 进度条 + 实时日志
- 抓取完成后自动展示媒体列表

### 第四步：浏览与下载

- 切换「🖼️ 图片 / 🎬 视频 / 🎞️ GIF」Tab
- 搜索框：按推文文本或 ID 搜索
- 日期筛选：选择时间范围
- **点击缩略图**：打开 Lightbox 大图模式
- **键盘快捷键**：
  - `←` 上一张
  - `→` 下一张
  - `ESC` 关闭

**高级操作**：

- 「📥 全部下载」：依次触发所有文件下载
- 「📦 打包 ZIP 下载」：下载所有文件 + 推文原文 + README，浏览器内打包
- 「📋 导出清单」：JSON 格式导出
- 「📝 导出推文原文」：JSONL 格式导出
- 「重置下载状态」：清空所有已下载标记

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
渲染到 UI（三 Tab 列表 + Lightbox）
       ↓
用户操作：
- 单个下载：<a download> 触发浏览器原生下载
- ZIP 打包：JSZip 压缩后下载
```

### 关键 API 端点

| 端点 | 用途 |
|------|------|
| `UserByScreenName` | 通过用户名解析 `user_id` |
| `UserMedia` | 分页拉取用户发布的媒体推文 |

### 增量抓取原理

- 第一次抓取：记录最大 `tweet_id` 为 `since_id`，保存到 localStorage
- 后续抓取：API 只返回 `id > since_id` 的推文，遇到旧推文自动停止
- 这样既节省时间，又避免重复

### 限流重试机制

- 触发条件：HTTP 429 (Too Many Requests) 或 503 (Service Unavailable)
- 重试策略：指数退避
  - 第 1 次：2 秒
  - 第 2 次：8 秒
  - 第 3 次：18 秒
- 最大重试：3 次

### 图片清晰度

```
原图 URL: https://pbs.twimg.com/media/xxx.jpg
?name=thumb    → 缩略图 (150x150)
?name=small    → 小图 (680x680)
?name=medium   → 中图 (1200x1200)
?name=large    → 大图 (2048x2048)
?name=orig     → 原图 (无压缩，最高画质) ← 本工具使用
```

### 视频清晰度

从 `video_info.variants` 数组中筛选 `content_type === 'video/mp4'`，按 `bitrate` 降序排序，取第一个即为最高码率版本。

---

## 开发目标需求清单

### Phase 1：MVP（v1.0 已完成 ✅）

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

### Phase 2：增强功能（v2.0 已完成 ✅）

- [x] **增量抓取**（since_id 记忆）
- [x] **GIF 单独 Tab**
- [x] **Lightbox 预览**（键盘快捷键）
- [x] **ZIP 打包下载**（JSZip）
- [x] **搜索筛选**（推文文本 + ID）
- [x] **日期范围筛选**
- [x] **推文文本显示**
- [x] **导出推文原文**（JSONL）
- [x] **自动重试机制**（指数退避）
- [x] **深色/亮色主题切换**
- [x] **视频时长显示**
- [x] **图片尺寸显示**
- [x] **视频码率显示**

### Phase 3：高级特性（规划中）

- [ ] 多账号批量任务
- [ ] 评论抓取
- [ ] 媒体去重（按图片 hash）
- [ ] 收藏 / 书签抓取
- [ ] 关注列表抓取
- [ ] AI 自动标签（图像识别）
- [ ] 与 Notion / Obsidian 集成
- [ ] 浏览器扩展（Chrome / Firefox）
- [ ] 桌面应用（Electron / Tauri）

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
2. 拖入项目文件夹
3. 等待几秒，得到 `xxx.netlify.app` 域名

**方式 2：GitHub 集成**

1. 把项目推送到 GitHub
2. 在 Netlify 后台点击 "Add new site" → "Import an existing project"
3. 选择你的 GitHub 仓库
4. 构建设置保持默认（无需 build command）
5. 发布目录设为 `/` 或 `.`
6. 点击 Deploy

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
4. 保存

---

## 常见问题

### Q1：抓取失败，提示"用户不存在或 Cookie 无效"？

检查：
1. Cookie 是否完整（包含 `auth_token`、`ct0` 等关键字段）
2. Cookie 是否过期（重新登录 X 获取新的）
3. 用户名是否正确（不带 `@`，区分大小写）

### Q2：限流被 ban 了怎么办？

本工具有自动重试机制：
- 触发 429/503 会自动等待 2/8/18 秒后重试
- 如果持续被 ban，等待 10-30 分钟后再试
- 减少 maxTweets 数量

### Q3：ZIP 打包失败？

- 网络问题：部分文件下载失败会跳过，ZIP 仍可生成
- 浏览器内存：超过 1000 个文件可能内存不足
- 建议：分批下载，或用「全部下载」+ 浏览器自带 ZIP

### Q4：增量抓取怎么用？

- 第一次抓取：自动记录 since_id
- 勾选「增量抓取」后再次抓取：只拉取新推文
- 不勾选：清空旧数据，全量重新抓取

### Q5：能下载私密账号吗？

不能。私密账号的推文只有粉丝可见，本工具通过 GraphQL API 只能看到你自己时间线的内容。

### Q6：会被封号吗？

- 本工具不直接操作 X 账号
- 风险：高频请求（每分钟 > 30 次）可能触发 IP 封禁
- 建议：单账号、单 IP、每 1.5 秒请求一次（已内置）

### Q7：Lightbox 不显示视频？

- 视频可能因为格式不被浏览器支持
- 尝试用「⬇️ 下载」按钮下载后用播放器打开

### Q8：搜索不到内容？

- 搜索是基于推文文本的，不是图片内容
- 如果推文没有文字只有媒体，搜索会匹配推文 ID

---

## 注意事项

⚠️ **风控风险**：

- X 对未授权抓取有反爬机制
- 过度使用可能导致 Cookie 临时封禁
- 建议：单次请求间隔 ≥ 1.5 秒（已内置）
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
- ZIP 打包的推文原文含元数据，请妥善保管

⚠️ **浏览器限制**：

- 大量下载时浏览器可能变慢
- Chrome 限制同时下载 6 个文件
- 建议分批下载（每批 50 个以内）

---

## 技术栈

- **Vanilla JavaScript**（ES6+）：无框架依赖
- **HTML5 + CSS3**：现代 Web 标准
- **JSZip 3.10.1**（CDN）：ZIP 打包
- **X GraphQL API**：数据源
- **localStorage**：本地持久化
- **CSS Grid + Flexbox**：响应式布局
- **CSS Variables**：主题切换

### 为什么不用框架？

- ✅ 零依赖，部署简单
- ✅ 首屏加载快（< 100KB + JSZip CDN）
- ✅ 学习成本低，方便二次开发
- ❌ 不适合超复杂应用（本工具功能明确）

---

## 开发路线

### v1.0（已完成）— MVP

单账号媒体抓取 + 下载，纯前端。

### v2.0（已完成）— 增强体验

✅ 增量抓取、Lightbox、ZIP 打包、搜索、主题切换、自动重试。

### v3.0（未来）— 平台化

- 浏览器扩展
- 桌面应用
- API 服务
- 多账号支持

---

## 贡献

```bash
git clone https://github.com/yourname/x-media-downloader.git
cd x-media-downloader
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

---

## License

MIT © 2026 巴雷特
