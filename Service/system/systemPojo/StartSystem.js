import { onEnter, onExit, onUpdate, transition } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { isJustPressed } from '@input/Input.js';
import { KEY_MAP } from '@input/Input.js';
import { isJustClicked, MouseMap } from '@input/Mouse.js';
import { HookLabel } from '@system/HookLabel.js';
import { overlayManager } from '@overlay/OverlayManager.js';
import { StartScreen } from '@overlay/pojo/StartScreen.js';

let screen = null;

onEnter(GameState.START, HookLabel.START_SYSTEM, () => {
    const canvas = document.getElementById('game');
    screen = new StartScreen(canvas.width, canvas.height);
    overlayManager.add(screen);
});

onUpdate(GameState.START, HookLabel.START_SYSTEM, () => {
    if (isJustPressed(KEY_MAP.Space) || isJustClicked(MouseMap.LEFT)) {
        transition(GameState.PLAYING);
    }
});

onExit(GameState.START, HookLabel.START_SYSTEM, () => {
    overlayManager.remove(screen);
    screen = null;
});
