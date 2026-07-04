import { onEnter, transition } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { HookLabel } from '@system/HookLabel.js';
import { preload } from '@resource/ResourceManager.js';
import { getList } from '@resource/ResourceList.js';

onEnter(GameState.LOADING, HookLabel.LOAD_SYSTEM, preloadResources);

// 预加载 resourceList 中的所有资源，完成后进入 START
async function preloadResources() {
    const paths = getList();
    try {
        await preload(paths);
    } catch (err) {
        console.error('[LoadSystem] 部分资源加载失败，继续启动');
    }
    transition(GameState.START);
}
