import { eventBus } from "../core/EventBus/EventBus.js";
import {EntityType} from "../Entity/EntityType.js";
import {EventTypes} from "../core/EventBus/EventTypes.js";


//碰撞规则(前面为Entity类型，后面为碰撞类型列表type)
const collisionRules ={
    [EntityType.PLAYER]:[EntityType.ENEMY],
    [EntityType.ENEMY]:[EntityType.BULLET,EntityType.PLAYER],
    [EntityType.BULLET]:[EntityType.ENEMY]
}

//新增碰撞规则方法
export function addCollisionRule(type1,type2){ 
    if(!collisionRules[type1]){
        collisionRules[type1] = [];
    }
    collisionRules[type1].push(type2);
}

//删除碰撞规则方法
export function removeCollisionRule(type1,type2){
    if(!collisionRules[type1]){
        return;
    }
    const index = collisionRules[type1].indexOf(type2);
    if(index !== -1){
        collisionRules[type1].splice(index,1);
    }
}

//获取当前碰撞规则方法
export function getCollisionRules(){
    return collisionRules;
}

//检测是否可以碰撞
export function canCollide(type1,type2){
    return collisionRules[type1]?.includes(type2)||
    collisionRules[type2]?.includes(type1);
}

//AABB方法检测是否碰撞
export function checkCollisionABB(a,b){ 
     return a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h && 
            a.y + a.h > b.y;
}

// 传scene.entities数组
export function checkCollisions(entities) {
      for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
              const a = entities[i];
              const b = entities[j];
              if (canCollide(a.type, b.type) && checkCollisionABB(a.getBounds(), b.getBounds())) {
                  eventBus.emit(EventTypes.COLLISION, { a, b });
              }
          }
      }
  }