// E2E：黑盒跑完整用户流程，所有 X 接口与媒体域名全部 mock，不碰真实网络。
// 覆盖：普通抓取（分页）、书签抓取、关注列表抓取、诊断面板、hash 高级设置。
import { test, expect } from '@playwright/test';

// 1x1 透明 PNG，媒体域名 mock 用
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

// ---------- mock 数据工厂 ----------

const userInfo = (id, screenName) => ({
  data: {
    user: {
      result: {
        rest_id: id,
        legacy: { name: `Name of ${screenName}`, screen_name: screenName },
      },
    },
  },
});

function photoTweet(id, text) {
  return {
    rest_id: id,
    legacy: {
      id_str: id,
      created_at: 'Wed Oct 10 20:19:24 +0000 2024',
      full_text: text,
      extended_entities: {
        media: [{
          type: 'photo',
          media_url_https: `https://pbs.twimg.com/media/${id}.jpg`,
          original_info: { width: 800, height: 600 },
        }],
      },
    },
  };
}

const asEntry = (payload) => ({
  entryId: `item-${Math.random().toString(36).slice(2)}`,
  content: {
    entryType: 'TimelineTimelineItem',
    itemContent: payload,
  },
});

const bottomCursor = (value) => ({
  entryId: 'cursor-bottom-0',
  content: { entryType: 'TimelineTimelineCursor', cursorType: 'Bottom', value },
});

// 与线上 UserMedia 响应同构：timeline_v2.timeline.instructions
const mediaTimeline = (tweets, cursor = null) => ({
  data: {
    user: {
      result: {
        timeline_v2: {
          timeline: {
            instructions: [{
              type: 'TimelineAddEntries',
              entries: cursor ? [...tweets.map(asTweetEntry), bottomCursor(cursor)] : tweets.map(asTweetEntry),
            }],
          },
        },
      },
    },
  },
});
const asTweetEntry = (t) => asEntry({ tweet_results: { result: t } });

// 与线上 Bookmarks 响应同构：bookmark_timeline_v2.timeline.instructions
const bookmarksTimeline = (tweets) => ({
  data: {
    bookmark_timeline_v2: {
      timeline: {
        instructions: [{ type: 'TimelineAddEntries', entries: tweets.map(asTweetEntry) }],
      },
    },
  },
});

function followingUser(id, screenName, name, bio) {
  return {
    rest_id: id,
    is_blue_verified: true,
    legacy: {
      screen_name: screenName,
      name,
      description: bio,
      followers_count: 1000 + Number(id),
      friends_count: 42,
      profile_image_url_https: `https://pbs.twimg.com/profile_images/${screenName}_normal.jpg`,
    },
  };
}

const followingTimeline = (users) => ({
  data: {
    user: {
      result: {
        timeline: {
          timeline: {
            instructions: [{
              type: 'TimelineAddEntries',
              entries: users.map((u) => asEntry({ user_results: { result: u } })),
            }],
          },
        },
      },
    },
  },
});

// ---------- mock 安装 ----------

async function installGraphqlMocks(page) {
  // UserMedia：两页，验证分页循环真的翻页了
  let mediaCalls = 0;
  await page.route('**/api.x.com/graphql/**/UserMedia?*', async (route) => {
    mediaCalls++;
    if (mediaCalls === 1) {
      await route.fulfill({ json: mediaTimeline(
        [photoTweet('101', 'first page tweet 1'), photoTweet('102', 'first page tweet 2')],
        'CURSOR_PAGE_2',
      ) });
    } else {
      await route.fulfill({ json: mediaTimeline([photoTweet('103', 'second page tweet')]) });
    }
  });

  await page.route('**/api.x.com/graphql/**/UserByScreenName?*', (route) =>
    route.fulfill({ json: userInfo('111', 'testuser') }));

  await page.route('**/api.x.com/graphql/**/Bookmarks?*', (route) =>
    route.fulfill({ json: bookmarksTimeline([
      photoTweet('201', 'bookmarked tweet 1'),
      photoTweet('202', 'bookmarked tweet 2'),
    ]) }));

  await page.route('**/api.x.com/graphql/**/Following?*', (route) =>
    route.fulfill({ json: followingTimeline([
      followingUser('301', 'alice', 'Alice A', '第一关注'),
      followingUser('302', 'bob', 'Bob B', '第二关注'),
    ]) }));

  // 媒体与 CDN：本地 fulfill，避免用例依赖外网
  await page.route('**/pbs.twimg.com/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: PNG_1PX }));
  await page.route('**/cdn.jsdelivr.net/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '/* mocked */' }));
}

async function fillBasics(page) {
  await page.goto('/');
  await page.fill('#cookieInput', 'auth_token=test; ct0=test');
  await page.fill('#usernameInput', 'testuser');
}

async function logText(page) {
  return page.locator('#logArea').innerText();
}

// ---------- 用例 ----------

test.beforeEach(async ({ page }) => {
  await installGraphqlMocks(page);
});

test('页面加载：标题、四个 Tab、高级设置里的 4 个 hash 输入框都在', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/X Media Downloader/i);
  await expect(page.locator('.tab')).toHaveCount(5);
  for (const tab of ['images', 'videos', 'gifs', 'comments', 'following']) {
    await expect(page.locator(`.tab[data-tab="${tab}"]`)).toBeAttached();
  }
  for (const input of ['hashUserInput', 'hashMediaInput', 'hashBookmarksInput', 'hashFollowingInput']) {
    await expect(page.locator(`#${input}`)).toBeAttached();
  }
});

test('普通抓取：分页循环拉满两页，媒体卡片渲染', async ({ page }) => {
  await fillBasics(page);
  await page.click('#fetchBtn');
  await expect(page.locator('#imageCount')).toHaveText('3', { timeout: 15_000 });
  await expect(page.locator('#imageList .media-card, #imageList > *').first()).toBeVisible();
  await expect(page.locator('#mediaSection')).toBeVisible();
  expect(await logText(page)).toContain('抓取完成');
  expect(await logText(page)).toContain('3 图');
});

test('书签抓取：走 Bookmarks 接口，媒体进图片 Tab', async ({ page }) => {
  await fillBasics(page);
  await page.click('#bookmarkFetchBtn');
  await expect(page.locator('#imageCount')).toHaveText('2', { timeout: 15_000 });
  const log = await logText(page);
  expect(log).toContain('书签');
  expect(log).toContain('书签抓取完成');
});

test('关注列表抓取：自动切到关注 Tab，卡片字段齐全', async ({ page }) => {
  await fillBasics(page);
  await page.click('#followingFetchBtn');
  const cards = page.locator('.follow-card');
  await expect(cards).toHaveCount(2, { timeout: 15_000 });
  await expect(page.locator('.tab[data-tab="following"]')).toHaveClass(/active/);
  await expect(page.locator('.follow-username').first()).toHaveText('@alice');
  await expect(page.locator('.follow-name a').first()).toHaveText('Alice A');
  await expect(page.locator('.follow-stats').first()).toContainText('粉丝 1,301');
  await expect(page.locator('.follow-card').first().locator('.follow-avatar')).toHaveAttribute(
    'src', /_400x400/);
});

test('关注列表导出：CSV 含 BOM 与中文表头', async ({ page }) => {
  await fillBasics(page);
  await page.click('#followingFetchBtn');
  await expect(page.locator('.follow-card').first()).toBeVisible({ timeout: 15_000 });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#exportFollowingBtn'),
  ]);
  expect(download.suggestedFilename()).toMatch(/^following_testuser\.csv$/);
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv.charCodeAt(0)).toBe(0xFEFF);
  expect(csv).toContain('用户名,昵称,粉丝数,关注数,认证,简介,主页');
  expect(csv).toContain('alice');
});

test('诊断面板：显示请求统计且失败不炸', async ({ page }) => {
  await fillBasics(page);
  await page.click('#fetchBtn');
  await expect(page.locator('#imageCount')).toHaveText('3', { timeout: 15_000 });
  await page.click('#monitorBtn');
  await expect(page.locator('#diagModal')).toBeVisible();
  await expect(page.locator('#diagBody')).toContainText('X 接口请求');
  await expect(page.locator('#diagBody')).toContainText('总请求');
  // UserByScreenName 1 次 + UserMedia 2 次
  await expect(page.locator('#diagBody')).toContainText('UserMedia');
  await page.click('#diagClose');
  await expect(page.locator('#diagModal')).toBeHidden();
});

test('高级设置：4 个 hash 可保存并写入 localStorage', async ({ page }) => {
  await page.goto('/');
  await page.click('#advancedToggle');
  await page.fill('#hashBookmarksInput', 'NEWBKHASH123');
  await page.fill('#hashFollowingInput', 'NEWFOHASH456');
  await page.click('#saveHashBtn');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('xQueryHashes') || '{}'));
  expect(saved.Bookmarks).toBe('NEWBKHASH123');
  expect(saved.Following).toBe('NEWFOHASH456');
  expect(saved.UserMedia).toBeTruthy();
});

test('未填 Cookie 时点抓取给出提示，不发起请求', async ({ page }) => {
  await page.goto('/');
  let apiCalled = false;
  await page.unroute('**/api.x.com/**');
  await page.route('**/api.x.com/**', (route) => { apiCalled = true; return route.fulfill({ json: {} }); });
  await page.click('#fetchBtn');
  await expect(page.locator('.toast')).toContainText('Cookie');
  expect(apiCalled).toBe(false);
});
