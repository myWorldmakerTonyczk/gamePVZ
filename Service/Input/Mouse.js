export const MouseMap = {
    LEFT:   0,
    MIDDLE: 1,
    RIGHT:  2,
};

export const mouseState = {
    x: 0,
    y: 0,
    buttons: {},
    justPressed: {},
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

// 按住检测
export function isMouseAction(button) {
    return !!mouseState.buttons[button];
}

// 单次点击
export function isJustClicked(button) {
    if (mouseState.justPressed[button]) {
        mouseState.justPressed[button] = false;
        console.log(mouseState.x, mouseState.y);
        return true;
    }
    return false;
}

// 获取位置（传入 canvas 做坐标转换）
export function getMousePos(canvas) {
    if (!canvas) return { x: mouseState.x, y: mouseState.y };
    const rect = canvas.getBoundingClientRect();
    return {
        x: (mouseState.x - rect.left) * (canvas.width / rect.width),
        y: (mouseState.y - rect.top) * (canvas.height / rect.height),
    };
}
