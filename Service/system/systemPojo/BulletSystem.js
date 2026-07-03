import { onUpdate, transition } from '../../core/GameLoop.js';
import { GameState, getCurrentState } from '../../core/State Machine.js';
import { isJustPressed } from '../../Input/Input.js';
import { KEY_MAP } from '../../Input/Input.js';
import { HookLabel } from '../HookLabel.js';
 import { eventBus } from '../../core/EventBus/EventBus.js'
import { EventTypes } from '../../core/EventBus/EventTypes.js'
import { Bullet } from '../../Entity/pojo/Bullet.js';



