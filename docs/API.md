# X GraphQL 接口文档

本工具使用的 X（Twitter）私有 GraphQL 接口说明。这些接口是 x.com 网页客户端
在用的**非公开接口**，没有官方文档，随时可能变更——所有接口的 query hash
都可以在「高级设置」里覆盖，不用改代码。

## 通用

- **Base URL**：`https://api.x.com/graphql/<queryId>/<OperationName>`
- **认证头**：
  - `authorization: Bearer <BEARER_TOKEN>`（公开的 web client 匿名 token，
    硬编码在 `index.html`）
  - `cookie: <完整的 x.com Cookie>`（需要包含 `auth_token`、`ct0`）
  - `x-twitter-active-user: yes`
  - `x-twitter-client-language: en`
- **查询参数**：`variables`（JSON）与 `features`（JSON）均需
  `encodeURIComponent` 后拼接。
- **错误形态**：X 改接口时往往仍返回 HTTP 200，但 body 带
  `errors` 数组（含 `persisted query not found` 等字样）。
  工具用 `classifyApiError` 把这种情况识别为「接口变更」而不是「Cookie 失效」。
- **限流**：429 / 503 时指数退避重试（2s → 8s → 18s）。
- **翻页**：所有时间线类接口的游标都在
  `instructions[].entries[]` 里 `entryType === 'TimelineTimelineCursor'`
  且 `cursorType === 'Bottom'` 的条目上，取其 `value` 作为下一页的
  `variables.cursor`。

## 接口一览

| 操作名 | 默认 queryId（内置快照） | 用途 | 响应根路径 |
|--------|--------------------------|------|------------|
| `UserByScreenName` | `GazOglcBvgLigl3ywt6b3x4Qb4OYxqKAhhD1AXgc40K0-7R3qA8iWA` | 用户名 → `rest_id` | `data.user.result` |
| `UserMedia` | `dexO_2tohK86JDudXXG3GRxZTrIuKtONB3vYJclbcQoO0JEhIiOtA1HUluB0dYyG` | 用户媒体时间线 | `data.user.result.timeline_v2.timeline` |
| `Bookmarks` | `vvgIHIejOsbp0Dn5KytkZg` | 当前账号的书签 | `data.bookmark_timeline_v2.timeline` |
| `Following` | `9l9tzqLGQU9eutAJffqqMw` | 某账号的关注列表 | `data.user.result.timeline.timeline` |
| `TweetDetail` | `BoHLKeBvibdYDiJON7oqTg` | 推文详情 + 评论（评论抓取用） | `data.tweet_result.tweetResult.timeline` |

> queryId 快照更新于 2026-10。过期后可参照下节方法获取新值。

## 各接口细节

### UserByScreenName

```jsonc
// variables
{ "screen_name": "elonmusk", "withSafetyModeUserFields": true }
```

响应里取 `data.user.result.rest_id` 作为后续接口的 `userId`，
`legacy.screen_name` / `legacy.name` 用于展示。

### UserMedia

```jsonc
// variables
{
  "userId": "<rest_id>",
  "count": 40,
  "includePromotedContent": false,
  "withClientEventToken": false,
  "withBirdwatchNotes": false,
  "withVoice": true,
  "withV2Timeline": true,
  "cursor": "<可选，上一页的 Bottom cursor>"
}
```

条目在 `instructions[type=TimelineAddEntries].entries[]`，过滤
`content.entryType === 'TimelineTimelineItem'` 后取
`itemContent.tweet_results.result`（即推文对象）。媒体在
`legacy.extended_entities.media`。

### Bookmarks

```jsonc
// variables
{
  "count": 20,
  "includePromotedContent": false,
  "withClientEventToken": false,
  "withBirdwatchNotes": false,
  "withVoice": true,
  "withV2Timeline": true
}
// features 额外需要
{ "graphql_timeline_v2_bookmark_timeline": true }
```

响应结构：`data.bookmark_timeline_v2.timeline.instructions`（旧版为
`data.bookmark_timeline`，工具两个路径都兼容）。条目结构同 UserMedia。

注意：只能抓**当前 Cookie 账号自己**的书签，userId 无关。

### Following

```jsonc
// variables
{ "userId": "<rest_id>", "count": 20, "includePromotedContent": false }
```

响应结构：`data.user.result.timeline.timeline.instructions`（注意**没有
`_v2`**，和 UserMedia 不同）。条目是 `itemContent.user_results.result`
而不是 `tweet_results`。用户对象在 `legacy` 下：
`screen_name` / `name` / `description` / `followers_count` /
`friends_count` / `profile_image_url_https`（把 `_normal` 换成
`_400x400` 可拿高清头像）。

X 会在列表里夹 `who-to-follow-*` 开头 entryId 的推荐模块，解析时按
entryId 前缀剔除。

### TweetDetail（评论抓取）

```jsonc
// variables
{
  "focalTweetId": "<tweet_id>",
  "withCommunity": true,
  "includePromotedContent": false,
  "withVoice": true
}
```

评论在 `data.tweet_result.tweetResult.timeline.instructions` 下，
结构与时间线相同。

## 如何获取新的 queryId（hash）

X 换 hash 后抓取会报「接口已变更」。取新值：

1. 浏览器登录 x.com，打开任意用户主页
2. F12 → Network 标签，筛选框输入接口名（如 `UserMedia`）
3. 点开请求，复制 URL 中 `graphql/<hash>/UserMedia` 中间的 hash 段
4. 粘贴进工具「高级设置」对应输入框，保存即可

调研新接口时，同样的抓包方法可以拿到完整 URL（含 variables / features），
把它响应里的关键路径抄进 mock fixtures（tests/e2e）即可做离线测试。
社区项目 [twscrape](https://github.com/vladkens/twscrape) 的 `api.py`
里也维护着各操作的 queryId，可交叉验证。

## 隐私与合规

- Cookie 只发送给 `api.x.com`，不经过任何第三方服务器
- 本工具不存储、不上传抓取结果，全在浏览器内存
- 这些是 X 的私有接口，调用它不受官方支持；请控制请求频率（工具内置
  页间隔 1.5s），仅用于个人备份
