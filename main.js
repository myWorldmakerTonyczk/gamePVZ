import { start, transition, GameState } from '@core/GameLoop.js';
import '@system/index.js';
import './level/level1.js';
console.log("main loaded");

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

transition(GameState.PLAYING);
start(ctx, canvas);
