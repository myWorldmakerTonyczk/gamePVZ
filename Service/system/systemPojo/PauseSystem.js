import { onUpdate, transition } from '../../core/GameLoop.js';
import { GameState, getCurrentState } from '../../core/State Machine.js';
import { isJustPressed } from '../../Input/Input.js';
import { KEY_MAP } from '../../Input/Input.js';
import { HookLabel } from '../HookLabel.js';
 import { eventBus } from '../../core/EventBus/EventBus.js'
import { EventTypes } from '../../core/EventBus/EventTypes.js'

    const toggle = () => {
        if (!isJustPressed(KEY_MAP.KeyP)) return;
        const s = getCurrentState();
        if (s === GameState.PLAYING) transition(GameState.PAUSED);
        else if (s === GameState.PAUSED) transition(GameState.PLAYING);
    };
    onUpdate(GameState.PLAYING, HookLabel.PAUSE, toggle);
    onUpdate(GameState.PAUSED,  HookLabel.PAUSE, toggle);

    //测试方法
    
 let handled = false;

  eventBus.on(EventTypes.COLLISION, () => {
      if (handled) return;
      handled = true;
      transition(GameState.PAUSED);
  });
