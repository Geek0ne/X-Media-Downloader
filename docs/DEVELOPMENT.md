# 开发者文档

本文档面向想参与开发或二次开发的开发者。项目定位：**零后端、纯静态、零框架**。

## 目录结构

```
X-Media-Downloader/
├── index.html          # 全部 UI + 业务逻辑（单文件应用）
├── lib/utils.js        # 纯函数工具库（浏览器 / Node 双环境）
├── tests/
│   ├── utils.test.js   # vitest 单元测试（跑 lib/utils.js）
│   └── e2e/
│       ├── app.spec.js # Playwright E2E（mock 全部 X 接口，不碰真实网络）
│       ├── server.mjs  # E2E 用的极简静态服务器
│       └── playwright.config.js
├── sw.js               # Service Worker（PWA 缓存）
├── manifest.json       # PWA 清单
├── docs/
│   ├── API.md          # X GraphQL 接口说明
│   └── DEVELOPMENT.md  # 本文档
└── .github/workflows/test.yml   # CI：单测 + E2E
```

## 开发环境

需要 Node.js ≥ 18。

```bash
git clone https://github.com/Geek0ne/X-Media-Downloader.git
cd X-Media-Downloader

# 本地起服务（任选其一）
python3 -m http.server 8000     # 方式 1
npx serve -p 8000 -s .          # 方式 2
```

浏览器打开 http://localhost:8000 即可调试。改代码后刷新即可，无构建步骤。

## 测试

### 单元测试（vitest，跑 `lib/utils.js`）

```bash
cd tests
npm ci            # 首次
npm test          # 或 npm run test:watch 边改边测
```

`lib/utils.js` 是纯函数集合，**不能**在里面引用 `window` / `document` / `fetch`。
页面从 `window.XMD_Utils` 取用这些函数；页面里同名函数只做委托 +
兜底（防止 `lib/utils.js` 加载失败白屏）。

**约定：新逻辑能写成纯函数的，一律进 `lib/utils.js` + 配套单测**，
页面内只留 DOM 编排。这是 v3.1 起的项目纪律——测试跑的必须就是线上跑的那份代码。

### E2E 测试（Playwright，黑盒跑完整页面）

```bash
cd tests/e2e
npm ci                    # 首次
npx playwright install chromium   # 首次，下载浏览器
npm test
```

要点：

- **不访问真实网络**：`app.spec.js` 里用 `page.route()` 把
  `api.x.com/graphql/*`、`pbs.twimg.com`、jsDelivr CDN 全部 mock 掉，
  用例在任何环境（包括 CI）都可重复运行。
- mock 数据结构与线上响应同构（`timeline_v2` / `bookmark_timeline_v2` /
  `user.result.timeline.timeline`），这样路径提取逻辑回归是真实的。
- 新功能请配套 E2E 用例：抓按钮 → 等 UI 状态 → 断言可见元素。
  用例里别 sleep，用 `expect(locator).toHaveText(...)` 等自动重试断言。

### CI

`.github/workflows/test.yml` 有两个 job：`unit`（vitest）与
`e2e`（Playwright + Chromium），push / PR 到 master 触发。

## 架构

### 数据流

```
Cookie + 用户名
   → GraphQL UserByScreenName      拿 user_id
   → GraphQL UserMedia / Bookmarks 分页拉时间线（cursor 翻页，页间隔 1.5s）
   → flattenXxx()                  从 instructions 提取条目
   → extractMedia()                提取最高清媒体 URL
   → state.images / videos / gifs  渲染三 Tab + Lightbox
```

### 关键模块（index.html 内）

| 模块 | 职责 |
|------|------|
| `state` | 全局状态（单例对象，无框架） |
| `QUERIES` / `DEFAULT_QUERIES` | GraphQL query hash，可被用户在「高级设置」覆盖 |
| `gqlRequest(label, queryName, vars, opts)` | 通用请求助手：观测（Mon）、限流重试、错误分类；返回 `async (cursor) => data` |
| `getUserId` / `getUserMedia` / `fetchTimeline` | 老抓取主链路（带 3s 通用重试） |
| `startBookmarkFetch` / `startFollowingFetch` | 书签 / 关注列表抓取 |
| `Mon` | 本地监控：环形缓冲存错误 + 请求耗时，`renderDiagnostics()` 负责展示 |
| `renderMedia` / `renderFollowing` / `renderComments` | 各 Tab 渲染 |

### X GraphQL 接口

见 [API.md](API.md)。query hash 会过期，过期后用户可在「高级设置」粘贴新值，
代码不用改。内置快照更新方式：改 `DEFAULT_QUERIES` 并跑一遍 E2E。

### 纯函数库（lib/utils.js）

| 函数 | 用途 |
|------|------|
| `extractMedia(tweets)` | 推文 → 图片/视频/GIF 三列表 |
| `flattenTweets` / `flattenBookmarks` | 时间线 → 推文数组 |
| `extractFollowing` | Following 响应 → 用户数组（剔除 who-to-follow 推荐位） |
| `filterNewTweets(tweets, sinceId)` | 增量过滤（BigInt 比较推文 ID） |
| `toNotionCsv` / `toObsidianMarkdown` / `toFollowingCsv` | 三种导出格式 |
| `classifyApiError(label, status, data)` | 错误分类（接口变更 / Cookie 失效 / 限流） |
| `mediaKey` / `sinceKey` | 去重键 / since_id 存储键 |
| `ringPush(arr, item, max)` / `summarizeRequests(entries)` | 监控用的环形缓冲与汇总 |

## 新增一个抓取功能的步骤（以关注列表为例）

1. **调研接口**：从 x.com 网页抓包拿到 query hash、variables、features、
   响应结构（见 API.md 的调研方法）。
2. **纯函数进 lib**：写响应解析函数（如 `extractFollowing`）+
   cursor 提取函数，配单测（fixtures 直接抄抓包 JSON 的关键路径）。
3. **页面接入**：`gqlRequest(...)` 拿请求函数 → while 循环翻页 →
   存 `state` → `renderXxx()`。
4. **UI**：加按钮 / Tab / 空态，错误走 `classifyApiError` + `isHashBroken` 引导。
5. **测试**：单测（lib 层）+ E2E（mock 响应跑全流程）。
6. **文档**：README 需求清单勾选、API.md 接口表、版本号四处同步
   （package.json / index.html 页脚 / sw.js CACHE_VERSION / README 徽章）。

## 约定与红线

- **Cookie 安全**：Cookie 只进 `api.x.com`，任何新功能不得把 Cookie
  发往第三方；监控数据（Mon）只留页面内存。
- **请求间隔 ≥ 1.5s**：所有翻页循环必须保留 `setTimeout(r, 1500)`，
  这是对 X 风控的基本礼貌。
- **无框架**：不引入构建工具和框架；第三方库只允许 CDN 的 JSZip 这类
  单文件、无传递依赖的库。
- **错误文案**：报错要说清「是谁的问题」——hash 过期 / Cookie 失效 /
  被限流是三种不同的处理方式，别让用户白折腾。
