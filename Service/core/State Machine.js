//状态机
export const GameState = {
    START: "Start",    // 开始界面
    PLAYING: "Playing",// 进行中状态
    PAUSED: "Paused",
    WIN: "WIN",
    LOSE: "LOSE"
}

//当前状态
export let currentState;

