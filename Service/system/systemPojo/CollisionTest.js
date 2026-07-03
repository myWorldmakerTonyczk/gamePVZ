import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { transition, GameState } from '@core/GameLoop.js';

// 测试：碰撞时暂停
let handled = false;
eventBus.on(EventTypes.COLLISION, () => {
    if (handled) return;
    handled = true;
    transition(GameState.PAUSED);
});
