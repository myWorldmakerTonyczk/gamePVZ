

//记录按键状态
export const keyState = {
    keys: {},
};

window.addEventListener("keydown", function(e) {
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

    Space: "fire"
};

 export function isAction(action) {
      for (const [code, name] of Object.entries(KEY_MAP)) {
          if (name === action && keyState.keys[code]) return true;
      }
      return false;
  }