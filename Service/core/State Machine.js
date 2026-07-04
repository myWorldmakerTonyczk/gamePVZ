//状态机
export const GameState = {
    LOADING: "Loading",// 加载界面
    START: "Start",    // 开始界面
    PLAYING: "Playing",// 进行中状态
    PAUSED: "Paused",
    WIN: "WIN",
    LOSE: "LOSE"
}

//当前状态
export let currentState = GameState.LOADING;

export function getCurrentState() {
    return currentState;
}
 export function setCurrentState(newState) {
      currentState = newState;
  }