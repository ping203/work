class RandomUtil {
    constructor() { }

    /**
     * 随机函数的包装.
     */
    random() {
        return Math.random();
    }

    /**
     * 获取一个随机数，范围是0~maxNum.
     * @param maxNum 随机数的最大取值.
     */
    randomInt(maxNum) {
        return Math.floor(Math.random() * maxNum);
    }

    /**
     * 获取一个随机整数，范围是minNum~maxNum.
     * @param minNum 随机整数的最小取值.
     * @param maxNum 随机整数的最大取值.
     */
    randomNum(minNum, maxNum) {
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    }
}

exports.randomUtil = new RandomUtil();