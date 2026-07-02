import { onUpdate, transition } from '../core/GameLoop.js';
import { GameState, getCurrentState } from '../core/State Machine.js';
import { isAction } from '../Input/Input.js';

export function initPauseSystem() {
    const toggle = () => {
        if (!isAction('pause')) return;
        const s = getCurrentState();
        if (s === GameState.PLAYING) transition(GameState.PAUSED);
        else if (s === GameState.PAUSED) transition(GameState.PLAYING);
    };
    onUpdate(GameState.PLAYING, 'Pause', toggle);
    onUpdate(GameState.PAUSED,  'Pause', toggle);
}