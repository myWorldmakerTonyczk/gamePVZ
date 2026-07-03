
export const EntityType = {
    PLAYER:"player",
    ENEMY:"enemy",
    BULLET:"bullet"
}

//设置实体类型EntityType
export function setEntityType(key,type){
    if(!EntityType[key]){
        return;
    }
    EntityType[key] = type;
}
    