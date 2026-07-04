/**
 * 图片命名规则：
 *   文件夹名_序号.拓展名
 *   如 assets/images/zombie/walk/ 目录下:
 *     walk_0.png  walk_1.png  walk_2.png  walk_3.png
 *count最好最好一定要传，不然性能消耗大
 * @param {string} dir     - 文件夹路径，文件夹名作为图片前缀
 * @param {number} [count] - 帧数；不传则自动检测（逐张试，404 停止）
 * @param {string} [ext='png'] - 拓展名
 * @returns {Promise<string[]>}
 */
export function getPhotoPathAsc(dir, count, ext = 'png', start = 0) {
    dir = dir.replace(/\/$/, '');
    const base = dir.split('/').pop();

    // 有 count → 同步返回数组
    if (count !== undefined) {
        const frames = [];
        for (let i = start; i < start + count; i++) {
            frames.push(`${dir}/${base}_${i}.${ext}`);
        }
        return frames;
    }

    // 自动检测 → 返回 Promise
    return (async () => {
        const frames = [];
        let i = 0;
        while (true) {
            const path = `${dir}/${base}_${i}.${ext}`;
            const ok = await new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = path;
            });
            if (!ok) break;
            frames.push(path);
            i++;
        }
        console.log(`[getPhotoPathAsc] ${dir}: 自动检测到 ${frames.length} 帧`);
        return frames;
    })();
}