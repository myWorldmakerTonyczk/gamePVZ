import { onUpdate, transition } from '@core/GameLoop.js';
import { GameState, getCurrentState } from '@core/State Machine.js';
import { isJustPressed } from '@input/Input.js';
import { KEY_MAP } from '@input/Input.js';
import { HookLabel } from '@system/HookLabel.js';

onUpdate(GameState.PLAYING, HookLabel.PAUSE, toggle);
onUpdate(GameState.PAUSED,  HookLabel.PAUSE, toggle);


function toggle() {
    if (!isJustPressed(KEY_MAP.KeyP)) return;
    const s = getCurrentState();
    if (s === GameState.PLAYING) transition(GameState.PAUSED);
    else if (s === GameState.PAUSED) transition(GameState.PLAYING);
};
