const session = require('../../../config/session');
const CryptoJS = require("crypto-js");
const ERROR_OBJ = require('../../consts/error').ERROR_OBJ;
const answer = require('../../utils/answer');

class HttpAesFilter {
    constructor() { }

    async before(ctx, next) {
        let body = ctx.request.body;
        if (body && body.data) {
            logger.error('body:', body);
            let data = body.data;//decodeURIComponent(body.data);
            if (body.aes == 'false' || !body.aes) {

            }
            else {
                let bytes = CryptoJS.AES.decrypt(data, session.secret);
                data = bytes.toString(CryptoJS.enc.Utf8);
            }

            try {
                if (typeof data == 'string') {
                    logger.error('data:', data);
                    body.data = JSON.parse(data);
                }

            } catch (e) {
                ctx.body = answer.httpResponse(ERROR_OBJ.PARAM_MISSING, body.aes, true);
                logger.error(ctx.request.method, e);
                return;
            }
        }

        logger.error('body == ', body);
        await next();
    }

    async after(ctx, next) {
        await next();
    }
}

module.exports = new HttpAesFilter();