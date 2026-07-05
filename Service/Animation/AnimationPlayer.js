/**
 * 动画播放器（可变状态）
 *
 * 每个实体持有独立的 AnimationPlayer 实例，
 * 各自维护独立的帧索引、计时器和播放状态。
 *
 * 同一种动画的多个实体共享同一个 AnimationConfig，
 * 但通过各自的 AnimationPlayer 实现独立的播放进度。
 */
export class AnimationPlayer {
    /** @type {import('./AnimationConfig.js').AnimationConfig} */
    #config;
    /** @type {number} 当前帧索引 */
    #index = 0;
    /** @type {number} 累计时间（秒），到达 frameTime 时推进一帧 */
    #timer = 0;
    /** @type {boolean} 是否正在播放 */
    playing = false;

    /**
     * @param {import('./AnimationConfig.js').AnimationConfig} config - 动画配置（模板）
     */
    constructor(config) {
        this.#config = config;
    }

    /** 每帧调用，推进动画时间 */
    update(dt) {
        if (!this.playing) return;

        this.#timer += dt;
        if (this.#timer >= this.#config.frameTime) {
            this.#timer -= this.#config.frameTime;
            this.#index++;

            if (this.#index >= this.#config.frames.length) {
                if (this.#config.loop) {
                    this.#index = 0;
                } else {
                    this.#index = this.#config.frames.length - 1;
                    this.playing = false;
                }
            }
        }
    }

    /** @returns {string|null} 当前帧的图片路径 */
    getCurrentFrame() {
        return this.#config.frames[this.#index] ?? null;
    }

    /** 恢复播放（不重置帧位置） */
    play() {
        this.playing = true;
    }

    /** 停止并回到第 0 帧 */
    stop() {
        this.playing = false;
        this.#index = 0;
        this.#timer = 0;
    }

    /** 暂停（保持当前帧位置） */
    pause() {
        this.playing = false;
    }

    /** 重置到第 0 帧并开始播放 */
    reset() {
        this.#index = 0;
        this.#timer = 0;
        this.playing = true;
    }
}
