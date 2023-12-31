interface throttleFnOption {
    // 第一次是否触发
    leading: boolean;
    // 最后一次是否触发
    trailing: boolean;
}
interface throttleFnArgs {
    // 触发间隔
    interval: number;
    // 需要节流的函数
    fn: Function;
    // 配置文件
    option: throttleFnOption;
}
interface throttleFnReturnType extends Function {
    cancel: Function;
}
type throttleFn = (
    interval: throttleFnArgs["interval"],
    fn: throttleFnArgs["fn"],
    option?: throttleFnArgs["option"]
) => throttleFnReturnType;

export const throttle: throttleFn = (interval, fn, option = { leading: true, trailing: false }) => {
    let lastTime = 0;
    let timer: any = undefined;

    const { leading, trailing } = option;

    const _throttle = (...args: any[]) => {
        // 获取现在时间
        const nowTime = new Date().getTime();
        // 判断第一次是否执行，若不执行则前后相等确保remainTime大于0
        if (!lastTime && !leading) lastTime = nowTime;
        // 计算离下一次执行还有多少时间
        const remainTime = interval - (nowTime - lastTime);

        if (remainTime <= 0) {
            if (timer) {
                clearTimeout(timer);
                timer = undefined;
            }
            fn.apply(this, args);
            lastTime = nowTime;
            return;
        }

        if (trailing && !timer) {
            timer = setTimeout(() => {
                timer = undefined;
                fn.apply(this, args);
                lastTime = new Date().getTime();
            }, remainTime);
        }
    };

    _throttle.cancel = function () {
        if (timer) clearTimeout(timer);
        timer = undefined;
        lastTime = 0;
    };
    return _throttle;
};
