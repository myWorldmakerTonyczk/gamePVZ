import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { overlayManager } from '@overlay/OverlayManager.js';

const UI_STATES = [GameState.START, GameState.PLAYING, GameState.WIN, GameState.LOSE];

for (const state of UI_STATES) {
    onUpdate(state, 'OverlaySystem', (dt) => { overlayManager.update(dt); });
}
