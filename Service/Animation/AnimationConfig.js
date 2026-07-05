/**
 * 动画配置（不可变）
 *
 * 存于 AnimationRegistry 中，作为模板供各实体创建独立的 AnimationPlayer。
 * 同一个 config 可以被多个实体共享，因为 config 只描述"动画长什么样"，
 * 不包含任何运行时播放状态。
 */
export class AnimationConfig {
    /** @type {string[]} 帧图片路径列表 */
    frames = [];
    /** @type {number} 每帧持续时间（秒） */
    frameTime = 0.1;
    /** @type {boolean} 是否循环播放 */
    loop = true;

    /**
     * @param {object} opts
     * @param {string[]} opts.frames - 帧路径数组
     * @param {number} [opts.frameTime=0.1] - 帧间隔（秒）
     * @param {boolean} [opts.loop=true] - 是否循环
     */
    constructor({ frames, frameTime = 0.1, loop = true }) {
        this.frames = frames;
        this.frameTime = frameTime;
        this.loop = loop;
    }
}
