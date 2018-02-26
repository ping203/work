const session = require('../../../config/session');
const CryptoJS = require("crypto-js");
const ERROR_CODE = require('../../consts/error').ERROR_CODE;
const answer = require('../../utils/answer');

class HttpAesFilter {
    constructor() {}

    before(ctx, next) {
        let body = ctx.request.body;
        if (body && body.aes && body.data) {
            let bytes = CryptoJS.AES.decrypt(decodeURIComponent(body.data), session.secret);
            let data = bytes.toString(CryptoJS.enc.Utf8);
            try {
                body.data = JSON.parse(data);
            } catch (e) {
                ctx.body = answer.httpResponse(ERROR_CODE.PARAM_MISSING, body.aes, true);
                logger.error(ctx.request.method, e);
                return;
            }
        }
        next();
    }

    after(ctx, next) {
        next();
    }
}

module.exports = new HttpAesFilter();