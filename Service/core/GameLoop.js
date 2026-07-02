import { GameState } from './State Machine.js';
import { currentState } from './State Machine.js';
//游戏主循环（生命周期）
function GameLoop() {
     switch(currentState) {
        case GameState.START:
            break;
        case GameState.PLAYING:
            break;
        case GameState.PAUSED:
            break;
        case GameState.WIN:
            break;
        case GameState.LOSE:
            break;
     }
}

export const hooks = {
    onEnter: {},
    onExit: {},
    onUpdate: {},// 每帧tick的回调
};

//state写状态GameState
//label写事件标签
//fn写回调函数
export function onEnter(state, label, fn){
    if(!hooks.onEnter[state]){
        hooks.onEnter[state] = [];
    }
    hooks.onEnter[state].push([label, fn]);
}

export function onExit(state, label, fn){
    if(!hooks.onExit[state]){
        hooks.onExit[state] = [];
    }
    hooks.onExit[state].push([label, fn]);
}
export function onUpdate(state, label, fn){
    if(!hooks.onUpdate[state]){
        hooks.onUpdate[state] = [];
    }
    hooks.onUpdate[state].push([label, fn]);
}

// !!重要：状态转换只能用这个函数，不能直接修改currentState变量
// —— 状态转换 ——
  export function transition(newState) {
      // 离开旧状态
      // 要先运行所有onExit中的回调函数
      hooks.onExit[currentState]?.forEach(h => h.fn());
      currentState = newState;
      // 进入新状态：所有注册了 PLAYING 的模块，逐个调用
      hooks.onEnter[newState]?.forEach(h => {
          console.log(`[SM] → ${h.label}`);
          h.fn();
      });
  }

  //每tick都要运行的函数
  export function tick(dt){
    hooks.onUpdate[currentState]?.forEach(h => h.fn(dt));
  }