/**
 * 过滤未登陆用户请求
 */

class Filter {
    constructor() {}

    before(msg, session, next) {
        // logger.error('msg:',msg);
        // logger.error('msg.__route__:',msg.__route__);

        if (msg.__route__.search(/^game\.fishHandler\.c_login$/i) == -1 &&
            msg.__route__.search(/^gate\.gateHandler\.queryEntry$/i) == -1) {
            if (!session.uid) {
                next(CONSTS.SYS_CODE.PLAYER_NOT_LOGIN);
                return;
            }
        }
        next();
    }

}

module.exports = new Filter;