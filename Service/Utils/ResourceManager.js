// 资源管理器：加载、缓存、获取
// // 缓存结构
//   cache = {
//       'assets/zombie.png':  <img> 对象,
//       'assets/player.png':  <img> 对象,
//   }

const cache = new Map();           // key → 加载好的资源
const loaders = new Map();         // key → 正在加载的 Promise（防重复加载）

/**
 * 加载图片
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * 加载音频
 */
function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = reject;
        audio.src = src;
    });
}

/**
 * 加载 JSON
 */
async function loadJSON(src) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`JSON 加载失败: ${src}`);
    return res.json();
}

/** 根据文件后缀选加载器 */
function loadOne(path) {
    if (loaders.has(path)) return loaders.get(path);  // 正在加载中，复用
    let promise;
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.gif')) {
        promise = loadImage(path);
    } else if (path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.ogg')) {
        promise = loadAudio(path);
    } else if (path.endsWith('.json')) {
        promise = loadJSON(path);
    } else {
        promise = Promise.reject(new Error(`不支持的文件类型: ${path}`));
    }
    promise = promise.then(res => {
        cache.set(path, res);
        loaders.delete(path);
        return res;
    });
    loaders.set(path, promise);
    return promise;
}

/** 1️⃣ 加载单个资源 */
export function load(path) {
    if (cache.has(path)) return Promise.resolve(cache.get(path));
    return loadOne(path);
}

/** 2️⃣ 缓存（load 已内置去重，同一个资源绝不重复加载） */
export function isCached(path) {
    return cache.has(path);
}

/** 3️⃣ 获取已缓存资源 */
export function get(path) {
    if (!cache.has(path)) {
        console.warn(`资源未加载: ${path}`);
        return null;
    }
    return cache.get(path);
}

/** 4️⃣ 预加载：一次性加载列表中的所有资源 */
export async function preload(paths) {
    console.log(`[ResourceManager] 开始预加载 ${paths.length} 个资源...`);
    const results = await Promise.all(paths.map(p => loadOne(p)));
    console.log(`[ResourceManager] 预加载完成`);
    return results;
}

/** 清空缓存（切换场景时用） */
export function clear() {
    cache.clear();
    loaders.clear();
}
