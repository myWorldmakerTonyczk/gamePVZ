import { onUpdate } from '@core/GameLoop.js';
import { GameState } from '@core/State Machine.js';
import { HookLabel } from '@system/HookLabel.js';
import { updateMouse } from '@input/Mouse.js';


 for (const state of Object.values(GameState)) {
      onUpdate(state, HookLabel.MOUSE_SYSTEM, updateMouse);
  }