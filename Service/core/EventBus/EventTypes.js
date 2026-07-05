export const EventTypes = {
    COLLISION:          'collision',
    PLAYER_SHOOT:       'player:shoot',
    DAMAGE:             'damage',             // { entity, damage } — HealthScript → 扣血
    ENTITY_STOP_MOVE:   'entity:stopMove',    // { entity } — AttackScript → MoveScript 暂停
    ENTITY_RESUME_MOVE: 'entity:resumeMove',  // { entity } — AttackScript → MoveScript 恢复
    ENTITY_DIED:        'entity:died',        // { entity } — HealthScript → 死亡通知
    LEVEL_WIN:          'level:win',          // 关卡胜利
    LEVEL_LOSE:         'level:lose',         // 关卡失败
};
