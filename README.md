# X Media Downloader · 推特媒体下载器 v3.0

> 下载 X (Twitter) 账号的全部图片和视频，最高清晰度，零后端、纯静态、免费部署。支持多账号批量抓取、评论抓取、PWA 离线使用。

![License](https://img.shields.io/badge/license-MIT-blue) ![No Backend](https://img.shields.io/badge/backend-none-green) ![Free Deploy](https://img.shields.io/badge/deploy-Netlify%20%7C%20CF%20Pages-brightgreen) ![v3.0](https://img.shields.io/badge/version-3.0-orange) ![PWA](https://img.shields.io/badge/PWA-supported-blueviolet)

---

## 📋 目录

- [项目简介](#项目简介)
- [v3.0 新特性](#v30-新特性)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [使用教程](#使用教程)
- [工作原理](#工作原理)
- [开发目标需求清单](#开发目标需求清单)
- [部署到免费平台](#部署到免费平台)
- [本地服务器部署](#本地服务器部署)
- [详细使用教程](#详细使用教程)
- [故障排查](#故障排查)
- [常见问题](#常见问题)
- [部署兼容性矩阵](#部署兼容性矩阵)
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

## v3.0 新特性

相比 v2.0，v3.0 新增以下功能：

| 新功能 | 说明 |
|--------|------|
| 🆕 **多账号批量任务** | 一次添加多个账号，依次抓取 |
| 🆕 **评论抓取** | 抓取某条推文的所有评论，单独 Tab 管理 |
| 🆕 **PWA 支持** | 可安装到桌面/手机，支持离线访问 |
| 🆕 **Service Worker** | 智能缓存策略，离线可用 |
| 🆕 **桌面安装提示** | 浏览器原生安装对话框 |
| 🆕 **单元测试** | vitest 测试框架，43 个测试覆盖核心逻辑 |
| 🆕 **工具函数库** | 可测试的纯函数从主程序中抽离 |

## v2.0 新特性

相比 v1.0，v2.0 新增以下功能：

| 新功能 | 说明 |
|--------|------|
| ✅ **增量抓取** | 自动记忆 `since_id`，只拉取新推文，节省时间 |
| ✅ **GIF 单独 Tab** | 图片 / 视频 / GIF 分开管理 |
| ✅ **Lightbox 预览** | 点击缩略图大图查看，左右键盘切换，ESC 关闭 |
| ✅ **ZIP 打包下载** | 一键打包所有媒体 + 推文原文 + README |
| ✅ **搜索 + 日期筛选** | 按推文文本、推文 ID、日期范围筛选 |
| ✅ **推文文本显示** | 卡片显示推文原文前 200 字符 |
| ✅ **导出推文原文** | JSONL 格式导出所有推文（含点赞/转发数） |
| ✅ **自动重试机制** | 限流 (429/503) 自动指数退避重试 |
| ✅ **深色/亮色主题** | 一键切换，护眼 |
| ✅ **键盘快捷键** | Lightbox 模式下 ← → ESC 操作 |

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

## 🖥️ 本地服务器部署

如果你想部署到自己的服务器（局域网或公网），有以下几种方式：

### 方式 1：Python 内置 HTTP 服务器（最简单）

适合临时测试或局域网共享：

```bash
cd /root/Projects/x-media-downloader
python3 -m http.server 8000
```

**访问：**
- 本机：http://localhost:8000
- 局域网：http://你的IP:8000

**后台运行（Linux）：**

```bash
# 用 nohup 后台启动
nohup python3 -m http.server 8000 > /tmp/xmd.log 2>&1 &

# 查看进程
ps aux | grep "http.server"
```

**停止：**
```bash
pkill -f "http.server 8000"
```

### 方式 2：Node.js serve（推荐）

更稳定，支持热重载：

```bash
# 安装 serve
npm install -g serve

# 启动
cd /root/Projects/x-media-downloader
serve -p 8000 -s .
```

**-s 参数**：单页应用模式，所有路由都返回 index.html

### 方式 3：Nginx（生产环境推荐）

适合长期运行、需要 HTTPS、高并发：

**1. 安装 Nginx（以 CentOS/AlmaLinux 为例）：**

```bash
sudo dnf install -y nginx
```

**2. 创建配置文件：**

```bash
sudo vim /etc/nginx/conf.d/xmd.conf
```

**内容：**

```nginx
server {
    listen 8000;
    server_name _;  # 或你的域名/局域网IP

    root /root/Projects/x-media-downloader;
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA 路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Service Worker 必须从根路径加载
    location = /sw.js {
        add_header Cache-Control "no-cache";
        proxy_pass http://127.0.0.1:8000;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**3. 启动 Nginx：**

```bash
sudo nginx -t                    # 测试配置
sudo systemctl start nginx
sudo systemctl enable nginx     # 开机自启
```

**4. 开放防火墙：**

```bash
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

**5. 访问：**

- http://服务器IP:8000
- http://yourdomain.com:8000（如有域名）

### 方式 4：systemd 服务（开机自启）

将 XMD 注册为 systemd 服务，开机自动启动：

**1. 创建服务文件：**

```bash
sudo vim /etc/systemd/system/xmd.service
```

**内容：**

```ini
[Unit]
Description=X Media Downloader
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/Projects/x-media-downloader
ExecStart=/usr/bin/python3 -m http.server 8000
Restart=always
RestartSec=10
StandardOutput=append:/var/log/xmd.log
StandardError=append:/var/log/xmd.log

[Install]
WantedBy=multi-user.target
```

**2. 启动服务：**

```bash
sudo systemctl daemon-reload
sudo systemctl start xmd
sudo systemctl enable xmd
sudo systemctl status xmd
```

**3. 查看日志：**

```bash
tail -f /var/log/xmd.log
```

### 方式 5：Docker 部署

适合跨平台、隔离环境：

**1. 创建 Dockerfile：**

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**2. 构建并运行：**

```bash
cd /root/Projects/x-media-downloader
docker build -t xmd:latest .
docker run -d -p 8000:80 --name xmd --restart unless-stopped xmd:latest
```

**3. 查看状态：**

```bash
docker ps
docker logs -f xmd
```

**4. 停止/删除：**

```bash
docker stop xmd
docker rm xmd
```

### 方式 6：Docker Compose（多服务编排）

**docker-compose.yml：**

```yaml
version: '3.8'
services:
  xmd:
    build: .
    container_name: xmd
    ports:
      - "8000:80"
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/nginx
```

**启动：**

```bash
docker-compose up -d
```

### 公网部署（HTTPS）

如果需要公网访问 + HTTPS：

**1. 申请 SSL 证书（Let's Encrypt）：**

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**2. 自动续期：**

```bash
sudo systemctl enable certbot-renew.timer
```

**3. 完整 Nginx HTTPS 配置：**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /root/Projects/x-media-downloader;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📖 详细使用教程

### 场景一：单账号完整下载

**目标**：下载某账号的所有图片和视频

**步骤**：

1. 打开工具 URL
2. 粘贴 X Cookie（获取方式见上）
3. 输入用户名（如 `elonmusk`）
4. 设置最大推文数（建议先用 200 试水）
5. 勾选「记住 Cookie」
6. 点击「🚀 抓取媒体」
7. 等待抓取完成
8. 切换到「图片」/「视频」/「GIF」Tab
9. 点击单个「⬇️ 下载」按钮或「📥 全部下载」

### 场景二：增量监控某账号

**目标**：每天抓取新增推文

**步骤**：

1. 第一次抓取：按「场景一」操作
2. 工具自动保存 `since_id` 到 localStorage
3. 以后每天：
   - 重新打开工具
   - 勾选「增量抓取」
   - 点击「🚀 抓取媒体」
4. 工具只会拉取新推文，节省时间

### 场景三：批量下载多账号

**目标**：一次抓取多个账号

**步骤**：

1. 在「多账号批量任务」输入框输入多个用户名
   - 格式：`elonmusk, naval, paulg` 或 `elonmusk naval paulg`
2. 点击「➕ 添加到队列」
3. 检查任务列表
4. 点击「▶ 开始批量抓取」
5. 工具依次抓取每个账号（每个任务间隔 3 秒）
6. 完成后会显示每个账号的统计信息

### 场景四：备份到 ZIP

**目标**：下载所有媒体 + 推文原文

**步骤**：

1. 完成抓取后
2. 点击「📦 打包 ZIP 下载」
3. 工具会：
   - 下载所有图片/视频/GIF
   - 包含推文原文 JSON
   - 包含 README.txt 元数据
4. 浏览器自动下载 ZIP 文件

### 场景五：获取推文评论

**目标**：抓取某条推文的所有评论

**步骤**：

1. 先抓取账号媒体（让工具知道推文列表）
2. 找到要获取评论的推文 ID
3. 切换到「💬 评论」Tab
4. 点击「💬 抓取推文评论」
5. 输入推文 ID
6. 工具拉取评论并展示
7. 可以点击「💬 导出评论」下载 JSONL

### 场景六：离线使用（PWA）

**目标**：在没有网络时也能用

**步骤**：

1. 首次访问时，浏览器会缓存静态资源
2. 看到「📥 安装」按钮时点击
3. 浏览器弹出安装提示，确认
4. 应用会出现在桌面/开始菜单
5. 离线时打开应用，仍可使用（除 X API 调用）

### 数据存储位置

所有数据都保存在**浏览器本地**（localStorage）：

| 数据 | Key |
|------|-----|
| Cookie | `xCookie` |
| 主题 | `theme` |
| 下载记录 | `downloaded` |
| since_id | `sinceId_<username>` |
| 增量开关 | `rememberCookie` |

**清理数据：**
- 浏览器 DevTools → Application → Local Storage → 删除对应 key
- 或浏览器「清除浏览数据」

---

## 🌍 多平台部署配置

项目自带各平台部署配置文件，**选一个平台就能用**：

| 文件 | 适配平台 |
|------|---------|
| `netlify.toml` + `_redirects` + `_headers` | Netlify（完整） |
| `_headers` + `_redirects` | Cloudflare Pages |
| `vercel.json` | Vercel |
| `.github/workflows/test.yml` | GitHub Actions（自动跑测试） |
| 控制台手动配 | EdgeOne Pages / 腾讯云开发 |

### 各平台部署速查

**Netlify**：
1. 登录 https://app.netlify.com → Add new site → Import from Git
2. 选 `X-Media-Downloader` 仓库
3. Build command 留空，Publish directory 留空
4. Deploy

**Cloudflare Pages**：
1. 登录 https://dash.cloudflare.com → Workers & Pages → Create
2. Pages → Connect to Git → 选仓库
3. Build command 留空，Build output 填 `.`
4. Save and Deploy

**Vercel**：
1. 登录 https://vercel.com → Add New → Project
2. Import `X-Media-Downloader` 仓库
3. Framework: Other
4. Deploy

**EdgeOne Pages**：
1. 登录 https://console.cloud.tencent.com/edgeone/pages
2. 创建项目 → 连接 GitHub → 选仓库
3. Build command 留空，Output: `.`
4. 在控制台手动加 SPA 重定向规则：`(.*) → /index.html`
5. 手动加 SW headers：`/sw.js` → `Cache-Control: no-cache`

**GitHub Pages**（不推荐 PWA）：
1. 仓库 Settings → Pages → Source: Deploy from a branch → master / root
2. ⚠️ GitHub Pages **不支持 SW 缓存控制**，Service Worker 可能不工作

### 自动测试（GitHub Actions）

每次 push 到 master 时，GitHub Actions 会自动运行 43 个单元测试。结果显示在仓库的 Actions 标签页。

---

## 📊 部署兼容性矩阵

下表详细列出每个部署平台的兼容程度和所需配置：

| 平台 | 兼容性 | 配置文件 | 部署方式 | 难度 | 备注 |
|------|--------|---------|---------|------|------|
| **Netlify** | 🟢 完美 | `netlify.toml` + `_redirects` + `_headers` | GitHub 集成 | ⭐ | 最简单，一键部署 |
| **Cloudflare Pages** | 🟢 完美 | `_headers` + `_redirects` | GitHub 集成 | ⭐ | 国内访问快 |
| **Vercel** | 🟢 完美 | `vercel.json` | GitHub 集成 | ⭐ | 自动 HTTPS |
| **EdgeOne Pages** | 🟢 完美 | `_redirects` + 控制台规则 | GitHub 集成 | ⭐⭐ | 国内访问最快，需手动加 1 条规则 |
| **腾讯云开发** | 🟢 良好 | 控制台手动配 | 手动上传 | ⭐⭐ | 国内访问好 |
| **阿里云 OSS 静态网站** | 🟡 良好 | 需手动配 SPA | 手动上传 | ⭐⭐ | 需配置默认首页 |
| **AWS S3 + CloudFront** | 🟡 良好 | 需手动配 | CLI / 控制台 | ⭐⭐⭐ | 灵活但复杂 |
| **Azure Static Web Apps** | 🟡 良好 | 需 `staticwebapp.config.json` | GitHub 集成 | ⭐⭐ | 微软生态 |
| **GitHub Pages** | 🟠 限制 | 无 | GitHub 集成 | ⭐ | ⚠️ PWA 部分受限 |
| **Python HTTP** | 🟢 完美 | - | 命令行 | ⭐ | 单页应用够用 |
| **Node.js serve** | 🟢 完美 | - | 命令行 | ⭐ | `-s` 启用 SPA |
| **Nginx** | 🟢 完美 | server block | 配置文件 | ⭐⭐ | 生产环境首选 |
| **systemd** | 🟢 完美 | service unit | 配置文件 | ⭐⭐ | 开机自启 |
| **Caddy** | 🟢 完美 | Caddyfile | 配置文件 | ⭐ | 自动 HTTPS |
| **Docker** | 🟢 完美 | Dockerfile | 镜像构建 | ⭐⭐ | 跨平台一致 |
| **Docker Compose** | 🟢 完美 | docker-compose.yml | 容器编排 | ⭐⭐ | 多服务编排 |

### 图例说明

- 🟢 **完美** — 所有功能（包含 PWA）正常工作
- 🟡 **良好** — 核心功能正常，PWA 部分功能需要额外配置
- 🟠 **限制** — 部分高级功能不工作（如 Service Worker）

### 各平台特性对比

| 特性 | Netlify | Cloudflare | Vercel | EdgeOne | GitHub Pages | Nginx |
|------|---------|------------|--------|---------|--------------|-------|
| 免费额度 | 100GB/月 | 无限 | 100GB/月 | 30GB/月 | 1GB | 自有 |
| 自定义域名 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 自动 HTTPS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅（需配置）|
| 全球 CDN | ✅ | ✅ | ✅ | ✅ | ❌ | 需 CloudFlare |
| 国内访问速度 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ | 自建 |
| SPA 支持 | ✅ | ✅ | ✅ | 手动配 | ❌ | 手动配 |
| Service Worker | ✅ | ✅ | ✅ | 手动配 | ⚠️ | ✅ |
| 自动部署 | ✅ | ✅ | ✅ | ✅ | ✅ | 手动 |
| 预览部署 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### 推荐方案

**追求最简单的部署体验**：Netlify（GitHub 集成，3 步搞定）
**追求国内访问速度**：EdgeOne Pages 或 Cloudflare Pages
**追求全功能 PWA 离线**：Netlify / Cloudflare / Vercel / Nginx
**自有服务器**：Nginx + systemd + 域名
**快速预览测试**：Python `http.server` 或 Node `serve`

---

## 🛠️ 故障排查

### Q: 抓取时一直转圈，最终失败？

**检查项：**
1. Cookie 是否过期（重新登录 X 获取）
2. 网络是否可达 `api.x.com`
3. 是否被 X 限流（等待 10-30 分钟）
4. 浏览器控制台（F12）是否有错误

### Q: 图片/视频下载下来打不开？

**原因：** X 已删除原媒体，或链接失效

**解决：**
- 重新抓取
- 检查推文是否还存在

### Q: 部署后其他人访问不到？

**检查：**
1. 防火墙是否开放端口：`sudo firewall-cmd --list-all`
2. Nginx 是否监听正确 IP：`netstat -tlnp | grep nginx`
3. 服务器安全组规则（云服务器）

### Q: Service Worker 注册失败？

**原因：** PWA 必须在 HTTPS 或 localhost 下才能注册

**解决：**
- 本地测试用 `http://localhost:8000`
- 部署时配置 HTTPS

---

## 🤝 贡献

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
