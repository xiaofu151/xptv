// 导入必要的库
import axios from 'axios';
import cheerio from 'cheerio';

// 用户代理（模拟浏览器）
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';

// 网站配置
const appConfig = {
    site: 'https://www.mydangao.com',
    tabs: [
        { name: '电影', ext: { url: 'https://www.mydangao.com/vodshow/dianying.html' } },
        { name: '电视剧', ext: { url: 'https://www.mydangao.com/vodshow/dsj.html' } },
        { name: '综艺', ext: { url: 'https://www.mydangao.com/vodshow/zongyi.html' } },
        { name: '动漫', ext: { url: 'https://www.mydangao.com/vodtype/dongman.html' } },
        { name: '爽文短剧', ext: { url: 'https://www.mydangao.com/vodshow/shuangwenduanju.html' } },
    ],
};

// 请求页面并解析 HTML
async function fetchHtml(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': UA },
        });
        return cheerio.load(data);
    } catch (error) {
        console.error(`请求失败: ${url}`, error);
        throw new Error('页面请求失败');
    }
}

// 获取内容卡片列表
async function getCards(ext) {
    const { url } = ext;
    const $ = await fetchHtml(url); // 请求页面并解析 HTML
    const cards = [];

    // 根据页面结构解析内容卡片
    $('.module-items .module-item').each((_, element) => {
        const title = $(element).find('.module-item-title a').text();
        const cover = $(element).find('.module-item-pic img').attr('data-original');
        const href = $(element).find('.module-item-title a').attr('href');
        const remarks = $(element).find('.module-item-caption').text();

        cards.push({
            vod_name: title.trim(),
            vod_pic: cover,
            vod_id: href,
            vod_remarks: remarks.trim(),
            ext: { url: `${appConfig.site}${href}` },
        });
    });

    return { list: cards };
}

// 获取播放链接列表
async function getTracks(ext) {
    const { url } = ext;
    const $ = await fetchHtml(url);
    const tracks = [];

    // 根据页面结构解析播放链接
    $('.module-play-list a').each((_, element) => {
        const trackName = $(element).text().trim();
        const trackUrl = $(element).attr('href');

        tracks.push({
            name: trackName,
            ext: { url: `${appConfig.site}${trackUrl}` },
        });
    });

    return { list: [{ title: '播放列表', tracks }] };
}

// 获取播放信息
async function getPlayinfo(ext) {
    const { url } = ext;
    const $ = await fetchHtml(url);

    // 解析视频播放链接
    const playUrl = $('video source').attr('src');
    return { urls: [playUrl] };
}

// 搜索功能
async function search(text) {
    const searchUrl = `${appConfig.site}/vodsearch/-------------.html?wd=${encodeURIComponent(text)}`;
    const $ = await fetchHtml(searchUrl);
    const results = [];

    // 解析搜索结果
    $('.module-items .module-item').each((_, element) => {
        const title = $(element).find('.module-item-title a').text();
        const cover = $(element).find('.module-item-pic img').attr('data-original');
        const href = $(element).find('.module-item-title a').attr('href');
        const remarks = $(element).find('.module-item-caption').text();

        results.push({
            vod_name: title.trim(),
            vod_pic: cover,
            vod_id: href,
            vod_remarks: remarks.trim(),
            ext: { url: `${appConfig.site}${href}` },
        });
    });

    return { list: results };
}

// 测试功能
(async () => {
    try {
        console.log('获取电影内容：');
        const movieCards = await getCards(appConfig.tabs[0].ext);
        console.log(movieCards);

        console.log('获取播放链接：');
        const tracks = await getTracks({ url: 'https://www.mydangao.com/vodplay/12345.html' });
        console.log(tracks);

        console.log('搜索功能：');
        const searchResults = await search('测试');
        console.log(searchResults);
    } catch (error) {
        console.error('出错了：', error);
    }
})();