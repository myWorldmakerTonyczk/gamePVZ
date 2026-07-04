// 资源清单：各模块注册自己需要的资源路径，LoadSystem 统一加载

const resourceList = new Set();

/**
 * 注册资源
 * @param  {...string} paths - 资源路径
 */
//音频等模块可以调用此方法注册资源路径
export function setResource(...paths) {
    paths.forEach(path => resourceList.add(path));
}

/** 获取所有已注册的资源路径 */
export function getList() {
    return [...resourceList];
}
