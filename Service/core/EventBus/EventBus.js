export class EventBus {
    events = {};

    // 监听
    on(event, fn) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(fn);
    }

    // 触发
    emit(event, data, source = 'unknown') {
        if (DEBUG) console.log(`[EventBus] ▶ ${event}  ← ${source}`, data);

        const list = this.events[event];
        if (!list) return;

        list.forEach(fn => fn(data));
    }

    // 移除监听
    off(event, fn) {
        const list = this.events[event];
        if (!list) return;
        this.events[event] = list.filter(f => f !== fn);
    }
}

const DEBUG = true;

export const eventBus = new EventBus();
