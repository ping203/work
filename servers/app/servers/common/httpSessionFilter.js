const session = require('../../../config/session');
const CryptoJS = require("crypto-js");
const ERROR_CODE = require('../../consts/error').ERROR_CODE;
const answer = require('../../utils/answer');

class HttpSessionFilter {
    constructor() {
        this._ignoreRouteMap = new Set();
    }

    before(ctx, next) {
        let ignore = false;
        if(ctx.session.uid){
            
        }
        for (let route of this._ignoreRouteMap) {
            if (ctx.url.search(route) >= 0) {
                ignore = true;
                break;
            }
        }

        if (ignore) {
            next();
        } else {
            if (!ctx.session.uid) {
                ctx.body = answer.httpResponse(ERROR_CODE.SESSION_INVALID, ctx.request.body.aes, true);
                logger.error(ctx.url, '会话过期，请重新登录');
            }
        }
    }

    after(ctx, next) {
        next();
    }

    addIgnoreRoute(route) {
        this._ignoreRouteMap.add(route);
    }
}

module.exports = new HttpSessionFilter();