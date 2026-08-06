// X Media Downloader · 纯函数工具库
// 这些函数没有 DOM/fetch 依赖，可以在 Node.js 中测试

const Utils = {
  // 清理文件名（移除非法字符）
  sanitizeFilename(name) {
    return String(name).replace(/[^\w\-_.]/g, '_').slice(0, 200);
  },

  // 生成下载文件名
  getFilename(username, item) {
    const ext = item.type === 'gif' || item.type === 'video' ? 'mp4' : 'jpg';
    const date = (item.createdAt || '').replace(/[^\w]/g, '_').slice(0, 10);
    return this.sanitizeFilename(
      `${username}_${item.tweetId}_${date}.${ext}`
    );
  },

  // 格式化日期
  formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    } catch {
      return '';
    }
  },

  // 格式化视频时长
  formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  // HTML 转义
  escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  },

  // 解析用户名（移除 @，去空白）
  parseUsernames(input) {
    if (!input) return [];
    return String(input).split(/[\s,;]+/)
      .map(u => u.trim().replace(/^@/, ''))
      .filter(Boolean);
  },

  // JSONL 序列化
  toJsonl(arr) {
    return arr.map(item => JSON.stringify(item)).join('\n');
  },

  // 提取媒体（从推文数组）
  extractMedia(tweets) {
    const images = [];
    const videos = [];
    const gifs = [];
    if (!Array.isArray(tweets)) return { images, videos, gifs };

    for (const tweet of tweets) {
      const legacy = tweet.legacy || tweet.tweet?.legacy;
      if (!legacy) continue;

      const tweetId = legacy.id_str;
      const createdAt = legacy.created_at;
      const fullText = (legacy.full_text || '')
        .replace(/https:\/\/t\.co\/\w+/g, '')
        .trim();

      const extMedia = legacy.extended_entities?.media || [];
      for (const m of extMedia) {
        const baseItem = {
          tweetId,
          tweetUrl: `https://x.com/i/status/${tweetId}`,
          createdAt,
          text: fullText.slice(0, 200),
          timestamp: createdAt ? new Date(createdAt).getTime() : 0,
        };

        if (m.type === 'photo') {
          const origUrl = m.media_url_https + '?name=orig';
          images.push({
            ...baseItem,
            type: 'image',
            url: origUrl,
            preview: m.media_url_https + '?name=small',
            width: m.original_info?.width,
            height: m.original_info?.height,
          });
        } else if (m.type === 'video') {
          const variants = m.video_info?.variants || [];
          const mp4Variants = variants
            .filter(v => v.content_type === 'video/mp4')
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
          if (mp4Variants.length > 0) {
            const best = mp4Variants[0];
            videos.push({
              ...baseItem,
              type: 'video',
              url: best.url,
              preview: m.media_url_https,
              bitrate: best.bitrate,
              duration: m.video_info?.duration_millis ? m.video_info.duration_millis / 1000 : 0,
            });
          }
        } else if (m.type === 'animated_gif') {
          const variants = m.video_info?.variants || [];
          const mp4Variants = variants
            .filter(v => v.content_type === 'video/mp4')
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
          if (mp4Variants.length > 0) {
            const best = mp4Variants[0];
            gifs.push({
              ...baseItem,
              type: 'gif',
              url: best.url,
              preview: m.media_url_https,
              bitrate: best.bitrate,
            });
          }
        }
      }
    }
    return { images, videos, gifs };
  },

  // 从推文时间线扁平化
  flattenTweets(timeline) {
    const tweets = [];
    const instructions = timeline?.data?.user?.result?.timeline_v2?.timeline?.instructions || [];
    for (const inst of instructions) {
      if (inst.type === 'TimelineAddEntries') {
        for (const entry of inst.entries || []) {
          const content = entry.content;
          if (content?.entryType === 'TimelineTimelineItem') {
            const tweetResult = content.itemContent?.tweet_results?.result;
            if (tweetResult) tweets.push(tweetResult);
          }
        }
      }
    }
    return tweets;
  },

  // 提取下一批 cursor
  getNextCursor(timeline) {
    const instructions = timeline?.data?.user?.result?.timeline_v2?.timeline?.instructions || [];
    for (const inst of instructions) {
      if (inst.type === 'TimelineAddEntries') {
        for (const entry of inst.entries || []) {
          if (entry.content?.entryType === 'TimelineTimelineCursor' &&
              entry.content.cursorType === 'Bottom') {
            return entry.content.value;
          }
        }
      }
    }
    return null;
  },

  // 提取评论
  extractComments(timeline) {
    const comments = [];
    const instructions = timeline?.data?.tweet_result?.tweetResult?.timeline?.instructions || [];
    for (const inst of instructions) {
      if (inst.type === 'TimelineAddEntries') {
        for (const entry of inst.entries || []) {
          const content = entry.content;
          if (content?.entryType === 'TimelineTimelineItem') {
            const tweet = content.itemContent?.tweet_results?.result;
            if (!tweet) continue;
            const legacy = tweet.legacy || {};
            const user = tweet.core?.user_results?.result?.legacy;
            comments.push({
              id: legacy.id_str,
              author: user?.screen_name || 'unknown',
              authorName: user?.name || '',
              text: (legacy.full_text || '').replace(/https:\/\/t\.co\/\w+/g, '').trim(),
              likes: legacy.favorite_count || 0,
              retweets: legacy.retweet_count || 0,
              createdAt: legacy.created_at,
              timestamp: legacy.created_at ? new Date(legacy.created_at).getTime() : 0,
            });
          }
        }
      }
    }
    return comments;
  },

  // 防抖
  debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // 筛选媒体
  filterMedia(items, options) {
    const { keyword, dateFrom, dateTo } = options;
    return items.filter(item => {
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (!item.text?.toLowerCase().includes(kw) && !item.tweetId?.includes(kw)) {
          return false;
        }
      }
      if (dateFrom) {
        const fromTs = new Date(dateFrom).getTime();
        if ((item.timestamp || 0) < fromTs) return false;
      }
      if (dateTo) {
        const toTs = new Date(dateTo).getTime() + 86400000;
        if ((item.timestamp || 0) > toTs) return false;
      }
      return true;
    });
  },
};

// 浏览器环境
if (typeof window !== 'undefined') {
  window.XMD_Utils = Utils;
}
// Node 环境（CommonJS）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
