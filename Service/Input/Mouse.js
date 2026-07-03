export const MouseMap = {
    MOUSE_RIGHT: "2 ", 
    MOUSE_LEFT: "0",
    MOUSE_MIDDLE: "1"
}

export const mouseState = {
    x: 0,
    y: 0,
    buttons: {},        // 当前按住状态
    justPressed: {},    // 只按一次
};

window.addEventListener("mousemove", (e) => {
    mouseState.x = e.clientX;
    mouseState.y = e.clientY;
});

window.addEventListener("mousedown", (e) => {
    mouseState.buttons[e.button] = true;
    mouseState.justPressed[e.button] = true;
});

window.addEventListener("mouseup", (e) => {
    mouseState.buttons[e.button] = false;
});


//这个需要注册到主循环中
export function updateMouse() {
    mouseState.justPressed = {};
}

//按住检测
export function isMouseDown(button = 0) {
    return !!mouseState.buttons[button];
}

//单次点击
export function isJustClicked(button = 0) {
    return !!mouseState.justPressed[button];
}

//获取位置
export function getMousePos() {
    return { x: mouseState.x, y: mouseState.y };
}