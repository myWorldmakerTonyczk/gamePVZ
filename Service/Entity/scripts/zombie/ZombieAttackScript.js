import { eventBus } from '@core/EventBus/EventBus.js';
import { EventTypes } from '@core/EventBus/EventTypes.js';
import { EntityType } from '@entity/EntityType.js';

export function createZombieAttackScript() {
    let _entity = null;
    let _target = null;
    let _attackTimer = 0;
    const ATTACK_RANGE = 80;
    const ATTACK_COOLDOWN = 1;

    function onCollision({ a, b }) {
        if (a !== _entity && b !== _entity) return;
        const other = a === _entity ? b : a;
        if (other.type !== EntityType.PLAYER) return;
        if (_entity.state === 'attack') return;

        _target = other;
        _entity.state = 'attack';
        _attackTimer = 0;
        eventBus.emit(EventTypes.ENTITY_STOP_MOVE, { entity: _entity }, 'ZombieAttackScript');
    }

    function enter(entity) {
        _entity = entity;
        eventBus.on(EventTypes.COLLISION, onCollision);
    }

    function update(entity, dt) {
        if (entity.state !== 'attack') return;
        if (!_target) return;

        const dx = _target.x - entity.x;
        const dy = _target.y - entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > ATTACK_RANGE) {
            entity.state = 'walk';
            _target = null;
            _attackTimer = 0;
            eventBus.emit(EventTypes.ENTITY_RESUME_MOVE, { entity }, 'ZombieAttackScript');
            return;
        }

        _attackTimer += dt;
        if (_attackTimer >= ATTACK_COOLDOWN) {
            _attackTimer -= ATTACK_COOLDOWN;
            eventBus.emit(EventTypes.DAMAGE, { entity: _target, damage: entity.attack }, 'ZombieAttackScript');
        }
    }

    function exit() {
        eventBus.off(EventTypes.COLLISION, onCollision);
    }

    return { stage: 'LOGIC', enter, update, exit };
}
