//状态机
const GameState = {
    START: "Start",    // 开始界面
    PLAYING: "Playing",// 进行中状态
    PAUSED: "Paused",
    WIN: "WIN",
    LOSE: "LOSE"
}

//当前状态
let currentState;

//状态转换函数
function setState(newState){
    currentState = newState;
}
