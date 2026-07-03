import { start, transition, GameState } from '@core/GameLoop.js';
import './level/level1.js';
import '@system/index.js';
console.log("main loaded");

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

start(ctx, canvas);
