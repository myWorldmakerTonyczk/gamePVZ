export class Animation {
    frames = [];          // 帧图片路径数组（key 列表）
    frameTime = 0.1;      // 每帧持续秒数
    loop = true;          // 是否循环
    playing = false;      // 是否播放中

    #index = 0;
    #timer = 0;

    constructor({ frames, frameTime = 0.1, loop = true }) {
        this.frames = frames;
        this.frameTime = frameTime;
        this.loop = loop;
    }

    update(dt) {
        if (!this.playing) return;

        this.#timer += dt;
        if (this.#timer >= this.frameTime) {
            this.#timer -= this.frameTime;
            this.#index++;

            if (this.#index >= this.frames.length) {
                if (this.loop) {
                    this.#index = 0;
                } else {
                    this.#index = this.frames.length - 1;
                    this.playing = false;
                }
            }
        }
    }

    /** 返回当前帧的图片路径 key */
    getCurrentFrame() {
        return this.frames[this.#index] ?? null;
    }

    //play只是恢复动画
    play() { this.playing = true; }
    stop()  { this.playing = false; this.#index = 0; this.#timer = 0; }
    pause() { this.playing = false; }
    // reset 重置动画到第一帧并开始播放
    reset() { this.#index = 0; this.#timer = 0; this.playing = true; }
}
