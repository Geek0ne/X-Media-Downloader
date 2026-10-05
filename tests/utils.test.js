import { describe, test, expect } from 'vitest';
import Utils from '../lib/utils.js';

describe('sanitizeFilename', () => {
  test('保留合法字符', () => {
    expect(Utils.sanitizeFilename('hello_world-123.txt')).toBe('hello_world-123.txt');
  });

  test('替换非法字符', () => {
    expect(Utils.sanitizeFilename('hello/world\\test?')).toBe('hello_world_test_');
  });

  test('截断超长字符串', () => {
    const long = 'a'.repeat(300);
    expect(Utils.sanitizeFilename(long).length).toBe(200);
  });

  test('处理中文', () => {
    const result = Utils.sanitizeFilename('测试文件名.jpg');
    expect(result).toContain('jpg');
    expect(result).not.toContain('测'); // 中文字符被替换
  });
});

describe('getFilename', () => {
  test('图片生成 .jpg', () => {
    const f = Utils.getFilename('alice', {
      type: 'image', tweetId: '123',
      createdAt: 'Wed Oct 10 20:19:24 +0000 2018'
    });
    expect(f).toMatch(/^alice_123_/);
    expect(f.endsWith('.jpg')).toBe(true);
  });

  test('视频生成 .mp4', () => {
    const f = Utils.getFilename('bob', {
      type: 'video', tweetId: '456',
      createdAt: 'Mon Mar 15 12:00:00 +0000 2021'
    });
    expect(f).toMatch(/^bob_456_/);
    expect(f.endsWith('.mp4')).toBe(true);
  });

  test('GIF 生成 .mp4', () => {
    const f = Utils.getFilename('carol', {
      type: 'gif', tweetId: '789',
      createdAt: 'Sun Jan 01 00:00:00 +0000 2022'
    });
    expect(f.endsWith('.mp4')).toBe(true);
  });
});

describe('formatDate', () => {
  test('正确格式化 ISO 字符串', () => {
    expect(Utils.formatDate('2026-08-04T10:30:00Z')).toMatch(/^2026-08-0[34]$/);
  });

  test('处理空值', () => {
    expect(Utils.formatDate('')).toBe('');
    expect(Utils.formatDate(null)).toBe('');
    expect(Utils.formatDate(undefined)).toBe('');
  });

  test('处理无效输入', () => {
    expect(Utils.formatDate('not-a-date')).toBe('');
  });
});

describe('formatDuration', () => {
  test('秒数小于 60', () => {
    expect(Utils.formatDuration(45)).toBe('0:45');
  });

  test('分钟 + 秒', () => {
    expect(Utils.formatDuration(125)).toBe('2:05');
  });

  test('零或负数返回空', () => {
    expect(Utils.formatDuration(0)).toBe('');
    expect(Utils.formatDuration(-5)).toBe('');
    expect(Utils.formatDuration(null)).toBe('');
  });

  test('超过 10 分钟', () => {
    expect(Utils.formatDuration(605)).toBe('10:05');
  });
});

describe('escapeHtml', () => {
  test('转义基本 HTML 字符', () => {
    expect(Utils.escapeHtml('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('转义单引号', () => {
    expect(Utils.escapeHtml("it's")).toBe('it&#39;s');
  });

  test('处理 null/undefined', () => {
    expect(Utils.escapeHtml(null)).toBe('');
    expect(Utils.escapeHtml(undefined)).toBe('');
  });

  test('普通文本不变', () => {
    expect(Utils.escapeHtml('hello world')).toBe('hello world');
  });
});

describe('parseUsernames', () => {
  test('逗号分隔', () => {
    expect(Utils.parseUsernames('alice, bob, carol'))
      .toEqual(['alice', 'bob', 'carol']);
  });

  test('空格分隔', () => {
    expect(Utils.parseUsernames('alice bob carol'))
      .toEqual(['alice', 'bob', 'carol']);
  });

  test('混合分隔符', () => {
    expect(Utils.parseUsernames('alice, bob;carol\ndave'))
      .toEqual(['alice', 'bob', 'carol', 'dave']);
  });

  test('移除 @ 前缀', () => {
    expect(Utils.parseUsernames('@alice, @bob'))
      .toEqual(['alice', 'bob']);
  });

  test('空输入', () => {
    expect(Utils.parseUsernames('')).toEqual([]);
    expect(Utils.parseUsernames(null)).toEqual([]);
  });
});

describe('toJsonl', () => {
  test('数组转 JSONL', () => {
    const arr = [{a: 1}, {b: 2}];
    expect(Utils.toJsonl(arr)).toBe('{"a":1}\n{"b":2}');
  });

  test('空数组', () => {
    expect(Utils.toJsonl([])).toBe('');
  });
});

describe('extractMedia', () => {
  test('提取图片（最高清）', () => {
    const tweets = [{
      legacy: {
        id_str: '111',
        created_at: 'Wed Oct 10 20:19:24 +0000 2018',
        full_text: 'Check this out https://t.co/abc',
        extended_entities: {
          media: [{
            type: 'photo',
            media_url_https: 'https://pbs.twimg.com/media/xyz.jpg',
            original_info: { width: 1920, height: 1080 },
          }],
        },
      },
    }];
    const { images, videos, gifs } = Utils.extractMedia(tweets);
    expect(images.length).toBe(1);
    expect(images[0].url).toBe('https://pbs.twimg.com/media/xyz.jpg?name=orig');
    expect(images[0].preview).toBe('https://pbs.twimg.com/media/xyz.jpg?name=small');
    expect(images[0].type).toBe('image');
    expect(images[0].tweetId).toBe('111');
    expect(images[0].text).toBe('Check this out'); // 短链接被移除
    expect(videos.length).toBe(0);
    expect(gifs.length).toBe(0);
  });

  test('提取视频（最高码率）', () => {
    const tweets = [{
      legacy: {
        id_str: '222',
        created_at: 'Wed Oct 10 20:19:24 +0000 2018',
        full_text: 'My video',
        extended_entities: {
          media: [{
            type: 'video',
            media_url_https: 'https://pbs.twimg.com/thumb.jpg',
            video_info: {
              duration_millis: 30000,
              variants: [
                { content_type: 'video/mp4', bitrate: 320000, url: 'low.mp4' },
                { content_type: 'video/mp4', bitrate: 1280000, url: 'high.mp4' },
                { content_type: 'application/x-mpegURL', url: 'playlist.m3u8' },
              ],
            },
          }],
        },
      },
    }];
    const { videos } = Utils.extractMedia(tweets);
    expect(videos.length).toBe(1);
    expect(videos[0].url).toBe('high.mp4');
    expect(videos[0].bitrate).toBe(1280000);
    expect(videos[0].duration).toBe(30);
  });

  test('提取 GIF', () => {
    const tweets = [{
      legacy: {
        id_str: '333',
        created_at: 'Wed Oct 10 20:19:24 +0000 2018',
        full_text: 'Funny gif',
        extended_entities: {
          media: [{
            type: 'animated_gif',
            media_url_https: 'https://pbs.twimg.com/thumb.jpg',
            video_info: {
              variants: [
                { content_type: 'video/mp4', bitrate: 500000, url: 'gif.mp4' },
              ],
            },
          }],
        },
      },
    }];
    const { gifs } = Utils.extractMedia(tweets);
    expect(gifs.length).toBe(1);
    expect(gifs[0].type).toBe('gif');
  });

  test('跳过无媒体的推文', () => {
    const tweets = [{
      legacy: { id_str: '444', full_text: 'No media' },
    }];
    const { images, videos, gifs } = Utils.extractMedia(tweets);
    expect(images.length + videos.length + gifs.length).toBe(0);
  });

  test('处理轮播图（多条媒体）', () => {
    const tweets = [{
      legacy: {
        id_str: '555',
        full_text: 'Carousel',
        extended_entities: {
          media: [
            { type: 'photo', media_url_https: 'https://x.com/1.jpg' },
            { type: 'photo', media_url_https: 'https://x.com/2.jpg' },
            { type: 'photo', media_url_https: 'https://x.com/3.jpg' },
          ],
        },
      },
    }];
    const { images } = Utils.extractMedia(tweets);
    expect(images.length).toBe(3);
  });

  test('空数组', () => {
    const result = Utils.extractMedia([]);
    expect(result.images.length).toBe(0);
  });

  test('非数组输入', () => {
    const result = Utils.extractMedia(null);
    expect(result.images.length).toBe(0);
  });
});

describe('flattenTweets', () => {
  test('从时间线提取推文', () => {
    const timeline = {
      data: {
        user: {
          result: {
            timeline_v2: {
              timeline: {
                instructions: [{
                  type: 'TimelineAddEntries',
                  entries: [
                    { content: { entryType: 'TimelineTimelineItem',
                      itemContent: { tweet_results: { result: { id: '1' } } } } },
                    { content: { entryType: 'TimelineTimelineItem',
                      itemContent: { tweet_results: { result: { id: '2' } } } } },
                  ],
                }],
              },
            },
          },
        },
      },
    };
    const tweets = Utils.flattenTweets(timeline);
    expect(tweets.length).toBe(2);
  });

  test('空时间线', () => {
    expect(Utils.flattenTweets({})).toEqual([]);
  });
});

describe('getNextCursor', () => {
  test('提取 Bottom cursor', () => {
    const timeline = {
      data: {
        user: {
          result: {
            timeline_v2: {
              timeline: {
                instructions: [{
                  type: 'TimelineAddEntries',
                  entries: [
                    { content: { entryType: 'TimelineTimelineCursor', cursorType: 'Bottom', value: 'cursor123' } },
                  ],
                }],
              },
            },
          },
        },
      },
    };
    expect(Utils.getNextCursor(timeline)).toBe('cursor123');
  });

  test('没有 cursor 返回 null', () => {
    expect(Utils.getNextCursor({})).toBe(null);
  });
});

describe('extractComments', () => {
  test('从评论时间线提取', () => {
    const timeline = {
      data: {
        tweet_result: {
          tweetResult: {
            timeline: {
              instructions: [{
                type: 'TimelineAddEntries',
                entries: [{
                  content: {
                    entryType: 'TimelineTimelineItem',
                    itemContent: {
                      tweet_results: {
                        result: {
                          legacy: {
                            id_str: 'c1',
                            full_text: 'Great tweet!',
                            favorite_count: 10,
                            retweet_count: 2,
                            created_at: 'Wed Oct 10 20:19:24 +0000 2018',
                          },
                          core: {
                            user_results: {
                              result: {
                                legacy: {
                                  screen_name: 'commenter',
                                  name: 'Commenter Name',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                }],
              }],
            },
          },
        },
      },
    };
    const comments = Utils.extractComments(timeline);
    expect(comments.length).toBe(1);
    expect(comments[0].author).toBe('commenter');
    expect(comments[0].text).toBe('Great tweet!');
    expect(comments[0].likes).toBe(10);
  });
});

describe('filterMedia', () => {
  const items = [
    { tweetId: '111', text: 'Hello world', timestamp: new Date('2026-01-15').getTime() },
    { tweetId: '222', text: 'Goodbye', timestamp: new Date('2026-02-20').getTime() },
    { tweetId: '333', text: 'Hello again', timestamp: new Date('2026-03-25').getTime() },
  ];

  test('按关键词筛选', () => {
    const r = Utils.filterMedia(items, { keyword: 'hello' });
    expect(r.length).toBe(2);
  });

  test('按推文 ID 筛选', () => {
    const r = Utils.filterMedia(items, { keyword: '222' });
    expect(r.length).toBe(1);
  });

  test('按日期范围筛选', () => {
    const r = Utils.filterMedia(items, {
      dateFrom: '2026-02-01',
      dateTo: '2026-03-01',
    });
    expect(r.length).toBe(1);
    expect(r[0].tweetId).toBe('222');
  });

  test('组合筛选', () => {
    const r = Utils.filterMedia(items, {
      keyword: 'hello',
      dateFrom: '2026-02-01',
    });
    expect(r.length).toBe(1);
    expect(r[0].tweetId).toBe('333');
  });

  test('无筛选条件返回全部', () => {
    const r = Utils.filterMedia(items, {});
    expect(r.length).toBe(3);
  });
});

describe('debounce', () => {
  test('延迟执行', async () => {
    let called = 0;
    const fn = Utils.debounce(() => called++, 50);
    fn();
    fn();
    fn();
    expect(called).toBe(0);
    await new Promise(r => setTimeout(r, 100));
    expect(called).toBe(1);
  });
});

describe('mediaKey', () => {
  test('忽略查询参数，同一张图视为同一个 key', () => {
    const a = Utils.mediaKey({ type: 'image', url: 'https://pbs.twimg.com/media/X?format=jpg&name=orig' });
    const b = Utils.mediaKey({ type: 'image', url: 'https://pbs.twimg.com/media/X?format=jpg&name=small' });
    expect(a).toBe(b);
  });

  test('不同类型即使 URL 相同也不同 key', () => {
    const img = Utils.mediaKey({ type: 'image', url: 'https://a.com/v.mp4' });
    const vid = Utils.mediaKey({ type: 'video', url: 'https://a.com/v.mp4' });
    expect(img).not.toBe(vid);
  });

  test('不同路径产出不同 key', () => {
    const a = Utils.mediaKey({ type: 'image', url: 'https://pbs.twimg.com/media/A?x=1' });
    const b = Utils.mediaKey({ type: 'image', url: 'https://pbs.twimg.com/media/B?x=1' });
    expect(a).not.toBe(b);
  });

  test('空输入不抛异常', () => {
    expect(Utils.mediaKey(null)).toBe('');
    expect(Utils.mediaKey({})).toBe('::');
  });
});

describe('classifyApiError', () => {
  test('query hash 失效时提示工具需更新，而非 Cookie 问题', () => {
    const data = { data: null, errors: [{ message: 'Could not parse query hash' }] };
    const e = Utils.classifyApiError('UserByScreenName', 200, data);
    expect(e.message).toContain('接口已变更');
    expect(e.message).not.toContain('请重新登录');
  });

  test('data 为 null 且带 errors 也判定为接口变更', () => {
    const e = Utils.classifyApiError('UserMedia', 200, { data: null, errors: [{ message: 'x' }] });
    expect(e.message).toContain('接口已变更');
  });

  test('401 归为 Cookie 问题', () => {
    const e = Utils.classifyApiError('UserByScreenName', 401, null);
    expect(e.message).toContain('Cookie 无效或已过期');
  });

  test('403 归为 Cookie 问题', () => {
    const e = Utils.classifyApiError('UserMedia', 403, {});
    expect(e.message).toContain('Cookie');
  });

  test('429 归为限流并给出等待建议', () => {
    const e = Utils.classifyApiError('UserMedia', 429, null);
    expect(e.message).toContain('限流');
  });

  test('无 errors 的 404 提示可能是 hash 过期', () => {
    const e = Utils.classifyApiError('UserMedia', 404, null);
    expect(e.message).toContain('404');
  });

  test('其他状态码带上服务端返回的详情', () => {
    const e = Utils.classifyApiError('UserMedia', 500, { errors: [{ message: 'boom' }] });
    expect(e.message).toContain('boom');
  });

  test('返回的是 Error 实例', () => {
    const e = Utils.classifyApiError('X', 500, null);
    expect(e).toBeInstanceOf(Error);
  });
});

describe('classifyApiError · isHashBroken 标记', () => {
  test('接口失效时带 isHashBroken 标记，UI 据此自动展开设置面板', () => {
    const e = Utils.classifyApiError('UserByScreenName', 200, {
      data: null, errors: [{ message: 'Could not parse query hash' }],
    });
    expect(e.isHashBroken).toBe(true);
  });

  test('Cookie 问题不带该标记（不该误导用户去改 hash）', () => {
    const e = Utils.classifyApiError('UserByScreenName', 401, null);
    expect(e.isHashBroken).toBeFalsy();
  });

  test('限流不带该标记', () => {
    const e = Utils.classifyApiError('UserMedia', 429, null);
    expect(e.isHashBroken).toBeFalsy();
  });

  test('提示语指向高级设置，而不是让用户回去折腾 Cookie', () => {
    const e = Utils.classifyApiError('UserMedia', 404, {
      errors: [{ message: 'persisted query not found' }],
    });
    expect(e.message).toContain('高级设置');
    expect(e.message).not.toContain('请重新登录');
  });
});

describe('sinceKey', () => {
  test('按用户名生成独立键', () => {
    expect(Utils.sinceKey('elonmusk')).toBe('sinceId_elonmusk');
  });

  test('去掉开头的 @', () => {
    expect(Utils.sinceKey('@elonmusk')).toBe('sinceId_elonmusk');
  });

  test('去掉首尾空白', () => {
    expect(Utils.sinceKey('  elonmusk  ')).toBe('sinceId_elonmusk');
  });

  test('@ 和空白混搭也能归一', () => {
    expect(Utils.sinceKey(' @elona musk ')).toBe('sinceId_elona musk');
  });

  test('不同账号得到不同键（这是本次修复的核心）', () => {
    expect(Utils.sinceKey('alice')).not.toBe(Utils.sinceKey('bob'));
  });

  test('带 @ 与不带 @ 视为同一账号', () => {
    expect(Utils.sinceKey('@alice')).toBe(Utils.sinceKey('alice'));
  });

  test('空用户名不抛异常', () => {
    expect(Utils.sinceKey('')).toBe('sinceId_');
    expect(Utils.sinceKey(undefined)).toBe('sinceId_');
  });
});

// 复现今天那个 bug 的场景：A 账号先增量抓过，再换 B 账号。
// 旧实现用全局 sinceId，B 会拿 A 的值去过滤，B 的推文被整片滤掉。
describe('filterNewTweets', () => {
  const t = (id) => ({ legacy: { id_str: String(id) } });
  const t2 = (id) => ({ rest_id: String(id) });

  test('没有 sinceId 时原样返回', () => {
    const arr = [t(3), t(2)];
    const r = Utils.filterNewTweets(arr, null);
    expect(r.fresh).toEqual(arr);
    expect(r.hitOld).toBe(false);
    expect(r.maxId).toBeNull();
  });

  test('过滤掉不比 sinceId 新的推文', () => {
    const r = Utils.filterNewTweets([t(105), t(104), t(103)], '104');
    expect(r.fresh.map(x => x.legacy.id_str)).toEqual(['105']);
    expect(r.hitOld).toBe(true);
  });

  test('遇到旧推文就停，后面的不再收（时间线是倒序的）', () => {
    // sinceId=104：105 是新的；103 比它旧，说明已越过边界，
    // 后面的 200 就算 ID 更大也不该收（时间线是倒序，边界之后即结束）
    const r = Utils.filterNewTweets([t(105), t(103), t(200)], '104');
    expect(r.fresh.map(x => x.legacy.id_str)).toEqual(['105']);
    expect(r.hitOld).toBe(true);
  });

  test('整批都新于 sinceId 时全部收下', () => {
    const r = Utils.filterNewTweets([t(105), t(103), t(200)], '100');
    expect(r.fresh.map(x => x.legacy.id_str)).toEqual(['105', '103', '200']);
    expect(r.hitOld).toBe(false);
    expect(r.maxId).toBe('200');
  });

  test('返回本批里最大的新 ID，用于推进 since_id', () => {
    const r = Utils.filterNewTweets([t(101), t(105), t(103)], '100');
    expect(r.maxId).toBe('105');
  });

  test('兼容 rest_id 格式', () => {
    const r = Utils.filterNewTweets([t2(105), t2(99)], '100');
    expect(r.fresh.map(x => x.rest_id)).toEqual(['105']);
  });

  test('★ 回归：换账号后不能拿上一个账号的 since_id 去过滤', () => {
    // A 账号最新是 500（活跃用户）
    const sinceA = '500';
    // B 账号推文 ID 全都小于 500（低活跃账号）
    const tweetsB = [t(120), t(115), t(110)];
    const r = Utils.filterNewTweets(tweetsB, sinceA);
    // 正确行为：全部视为已读，不返回任何“新”推文
    expect(r.fresh).toHaveLength(0);
    expect(r.hitOld).toBe(true);
    // 关键：不能崩溃、不能返回错误的 maxId
    expect(r.maxId).toBeNull();
  });

  test('空数组不抛异常', () => {
    expect(Utils.filterNewTweets([], '100').fresh).toEqual([]);
  });

  test('非数组输入不抛异常', () => {
    expect(Utils.filterNewTweets(null, '100').fresh).toEqual([]);
  });
});

describe('maxTweetId', () => {
  const t = (id) => ({ legacy: { id_str: String(id) } });

  test('取最大 ID', () => {
    expect(Utils.maxTweetId([t(3), t(99), t(50)])).toBe('99');
  });

  test('空数组返回 null', () => {
    expect(Utils.maxTweetId([])).toBeNull();
  });

  test('兼容 rest_id', () => {
    expect(Utils.maxTweetId([{ rest_id: '7' }, { rest_id: '12' }])).toBe('12');
  });

  test('ID 超 JS 安全整数也不出错（用 BigInt 比较）', () => {
    const big = '9007199254740993';
    expect(Utils.maxTweetId([t('9007199254740991'), t(big)])).toBe(big);
  });
});

describe('toNotionCsv', () => {
  const tw = (over = {}) => ({
    legacy: {
      id_str: '123',
      created_at: 'Wed Oct 10 20:19:24 +0000 2018',
      full_text: '看看这个 https://t.co/abc',
      favorite_count: 42,
      retweet_count: 7,
      reply_count: 3,
      ...over,
    },
  });

  test('表头是中文，便于 Notion 直接做属性名', () => {
    const lines = Utils.toNotionCsv([], 'alice').split('\r\n');
    expect(lines[0]).toContain('发布日期');
    expect(lines[0]).toContain('推文链接');
  });

  test('开头带 BOM，否则 Excel 会把中文认成乱码', () => {
    expect(Utils.toNotionCsv([], 'alice').charCodeAt(0)).toBe(0xFEFF);
  });

  test('正文里的 t.co 短链被清掉', () => {
    const csv = Utils.toNotionCsv([tw()], 'alice');
    expect(csv).not.toContain('t.co');
    expect(csv).toContain('看看这个');
  });

  test('生成可点击的推文链接', () => {
    expect(Utils.toNotionCsv([tw()], 'alice')).toContain('https://x.com/i/status/123');
  });

  test('★ 正文含逗号时必须转义，否则表格错列', () => {
    const csv = Utils.toNotionCsv([tw({ full_text: '第一句,第二句,第三句' })], 'alice');
    expect(csv).toContain('"第一句,第二句,第三句"');
  });

  test('★ 正文含双引号时要转成两个', () => {
    const csv = Utils.toNotionCsv([tw({ full_text: '他说"你好"' })], 'alice');
    expect(csv).toContain('"他说""你好"""');
  });

  test('正文含换行时用引号包住', () => {
    const csv = Utils.toNotionCsv([tw({ full_text: '第一行\n第二行' })], 'alice');
    expect(csv).toContain('"第一行\n第二行"');
  });

  test('日期转成 YYYY-MM-DD', () => {
    expect(Utils.toNotionCsv([tw()], 'alice')).toContain('2018-10-10');
  });

  test('空推文列表只输出表头', () => {
    const lines = Utils.toNotionCsv([], 'alice').split('\r\n');
    expect(lines.filter(Boolean)).toHaveLength(1);
  });

  test('缺 created_at 不抛异常', () => {
    const t = { legacy: { id_str: '1', full_text: 'x' } };
    expect(() => Utils.toNotionCsv([t], 'alice')).not.toThrow();
  });
});

describe('toObsidianMarkdown', () => {
  const tw = (id, date, text) => ({
    legacy: { id_str: String(id), created_at: date, full_text: text || '内容' },
  });
  const D1 = 'Wed Oct 10 20:19:24 +0000 2018';
  const D2 = 'Thu Oct 11 20:19:24 +0000 2018';

  test('开头是 YAML frontmatter', () => {
    const md = Utils.toObsidianMarkdown([], [], 'alice');
    expect(md.startsWith('---\n')).toBe(true);
    expect(md).toContain('username: alice');
    expect(md).toContain('tags:');
    expect(md).toContain('  - x-archive');
  });

  test('按日期分组', () => {
    const md = Utils.toObsidianMarkdown(
      [tw(1, D1), tw(2, D2)], [], 'alice');
    expect(md).toContain('## 2018-10-10');
    expect(md).toContain('## 2018-10-11');
  });

  test('★ 日期分组是倒序的，最新的在前', () => {
    const md = Utils.toObsidianMarkdown([tw(1, D1), tw(2, D2)], [], 'alice');
    expect(md.indexOf('2018-10-11')).toBeLessThan(md.indexOf('2018-10-10'));
  });

  test('图片用 Obsidian 嵌入语法', () => {
    const md = Utils.toObsidianMarkdown(
      [tw(1, D1)],
      [{ tweetId: '1', type: 'image', url: 'https://pbs.twimg.com/media/x.jpg' }],
      'alice');
    expect(md).toContain('![](https://pbs.twimg.com/media/x.jpg)');
  });

  test('视频用 ![[...]] 语法便于嵌入', () => {
    const md = Utils.toObsidianMarkdown(
      [tw(1, D1)],
      [{ tweetId: '1', type: 'video', url: 'https://video.twimg.com/v.mp4' }],
      'alice');
    expect(md).toContain('![[https://video.twimg.com/v.mp4]]');
  });

  test('媒体只挂在对应推文下', () => {
    const md = Utils.toObsidianMarkdown(
      [tw(1, D1), tw(2, D2)],
      [{ tweetId: '2', type: 'image', url: 'https://a.com/2.jpg' }],
      'alice');
    expect(md).toContain('https://a.com/2.jpg');
  });

  test('正文里的 t.co 被清掉', () => {
    const md = Utils.toObsidianMarkdown([tw(1, D1, '看看 https://t.co/xyz')], [], 'alice');
    expect(md).not.toContain('t.co');
  });

  test('frontmatter 里的计数与实际一致', () => {
    const md = Utils.toObsidianMarkdown(
      [tw(1, D1), tw(2, D2)],
      [{ tweetId: '1', type: 'image', url: 'https://a/1.jpg' }],
      'alice');
    expect(md).toContain('tweets: 2');
    expect(md).toContain('media: 1');
  });

  test('空输入也能出合法 frontmatter', () => {
    const md = Utils.toObsidianMarkdown([], [], 'alice');
    expect(md).toContain('tweets: 0');
    expect(md).toContain('# @alice 的推文存档');
  });

  test('非法日期归到「未知日期」而不是崩掉', () => {
    const md = Utils.toObsidianMarkdown(
      [{ legacy: { id_str: '1', created_at: 'not-a-date', full_text: 'x' } }], [], 'alice');
    expect(md).toContain('未知日期');
  });
});
