import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { HookLabel } from '@system/HookLabel.js';
import { overlayManager } from '@overlay/OverlayManager.js';

onUpdate(GameState.PLAYING, HookLabel.OVERLAY, (dt) => {
    overlayManager.update(dt);
});
