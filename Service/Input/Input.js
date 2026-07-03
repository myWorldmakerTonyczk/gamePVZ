

//记录按键状态
export const keyState = {
    keys: {},
};

const _justPressed = {};  // 只在按下的第一帧为 true

window.addEventListener("keydown", function(e) {
    if (!keyState.keys[e.code]) {   // 真正的新按下（排除系统按键重复）
        _justPressed[e.code] = true;
    }
    keyState.keys[e.code] = true;
});

window.addEventListener("keyup", function(e) {
    keyState.keys[e.code] = false;
});

export const KEY_MAP = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",

    KeyW: "up",
    KeyA: "left",
    KeyS: "down",
    KeyD: "right",

    Space: "fire",
    KeyP: "pause"
};

// 按键是否按下
export function isAction(action) {
    for (const [code, name] of Object.entries(KEY_MAP)) {
        if (name === action && keyState.keys[code]) return true;
    }
    return false;
}

// 只在按下的第一帧返回 true，之后持续按住也不会重复触发
export function isJustPressed(action) {
    for (const [code, name] of Object.entries(KEY_MAP)) {
        if (name === action && _justPressed[code]) {
            _justPressed[code] = false;  // 读一次就清零
            return true;
        }
    }
    return false;
}