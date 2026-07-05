import { onEnter, onExit, transition } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { overlayManager } from '@overlay/OverlayManager.js';
import { createTitleScreen } from '@overlay/pojo/TitleScreen.js';
import { createLevelSelect } from '@overlay/pojo/LevelSelect.js';
import { createWinScreen } from '@overlay/pojo/WinScreen.js';
import { createLoseScreen } from '@overlay/pojo/LoseScreen.js';
import { loadLevel } from '../../../level/index.js';

const LEVELS = [
    { id: 1, title: '第 1 关' },
    { id: 2, title: '第 2 关' },
    { id: 3, title: '第 3 关' },
];

let currentLevel = 1;

async function reloadLevel() {
    await loadLevel(currentLevel);
    transition(GameState.PLAYING);
}

function goToMenu() {
    overlayManager.overlays = [];
    transition(GameState.START);
}

// ============ START ============

let _screen = null;

function showLevelSelect() {
    _screen = createLevelSelect({
        levels: LEVELS.map(l => ({ title: l.title, onClick: () => { currentLevel = l.id; _screen.close(); reloadLevel(); } })),
        onBack: () => { _screen.close(); showTitle(); },
    });
    overlayManager.add(_screen);
}

function showTitle() {
    _screen = createTitleScreen({ onStart: () => { _screen.close(); showLevelSelect(); } });
    overlayManager.add(_screen);
}

onEnter(GameState.START, 'UISystem', () => { showTitle(); });
onExit(GameState.START, 'UISystem', () => { if (_screen) { _screen.close(); _screen = null; } });

// ============ WIN ============

let _win = null;

onEnter(GameState.WIN, 'UISystem', () => {
    _win = createWinScreen({
        onNext: () => { _win.close(); reloadLevel(); },
        onMenu: () => { _win.close(); goToMenu(); },
    });
    overlayManager.add(_win);
});
onExit(GameState.WIN, 'UISystem', () => { if (_win) { _win.close(); _win = null; } });

// ============ LOSE ============

let _lose = null;

onEnter(GameState.LOSE, 'UISystem', () => {
    _lose = createLoseScreen({
        onRetry: () => { _lose.close(); reloadLevel(); },
        onMenu: () => { _lose.close(); goToMenu(); },
    });
    overlayManager.add(_lose);
});
onExit(GameState.LOSE, 'UISystem', () => { if (_lose) { _lose.close(); _lose = null; } });
