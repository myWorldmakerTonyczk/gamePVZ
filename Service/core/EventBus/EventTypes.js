export const EventTypes = {
    COLLISION:          'collision',
    PLAYER_SHOOT:       'player:shoot',
    DAMAGE:             'damage',             // { entity, damage } — HealthScript → 扣血
    ENTITY_STOP_MOVE:   'entity:stopMove',    // { entity } — AttackScript → MoveScript 暂停
    ENTITY_DIED:        'entity:died',        // { entity } — HealthScript → 死亡通知
};