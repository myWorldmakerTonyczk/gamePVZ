import { scene } from '@entity/Scene.js';
import { overlayManager } from '@overlay/OverlayManager.js';

const levelLoaders = {
    1: () => import('./level1.js').then(m => m.init()),
    2: () => import('./level1.js').then(m => m.init()),
    3: () => import('./level1.js').then(m => m.init()),
};

export async function loadLevel(id) {
    scene.clear();
    overlayManager.overlays = [];
    const loader = levelLoaders[id];
    if (loader) await loader();
}
