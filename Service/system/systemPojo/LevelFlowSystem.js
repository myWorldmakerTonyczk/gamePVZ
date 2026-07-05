import { onEnter, onExit, transition } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';

onEnter(GameState.PLAYING, 'LevelFlowSystem', () => {
    eventBus.on(EventTypes.LEVEL_WIN, onWin);
    eventBus.on(EventTypes.LEVEL_LOSE, onLose);
});

onExit(GameState.PLAYING, 'LevelFlowSystem', () => {
    eventBus.off(EventTypes.LEVEL_WIN, onWin);
    eventBus.off(EventTypes.LEVEL_LOSE, onLose);
});

function onWin() { transition(GameState.WIN); }
function onLose() { transition(GameState.LOSE); }
