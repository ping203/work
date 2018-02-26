const answer = require('../../utils/answer');
const ERROR_OBJ = require('../../consts/error').ERROR_OBJ;
const logicResponse = require('./logicResponse');
const logger = require('omelo-logger').getLogger('http', __filename);

module.exports = async function handler(ctx, target, method) {
    if (!target[method]) {
        ctx.body = answer.httpResponse(ERROR_OBJ.NOT_SUPPORT_SERVICE, ctx.request.body.aes, true);
        return;
    }

    try {
        ctx.request.body.data.uid = ctx.session.uid;
        let {
            type,
            data
        } = await target[method](ctx.request.body.data);

        switch (type) {
            case logicResponse.TYPE.DATA:
                {
                    ctx.body = answer.httpResponse(data, ctx.request.body.aes);
                    return data;
                }
                break;
            case logicResponse.TYPE.EJS:
                {
                    ctx.render(data.template, data.data);
                }
                break;
            case logicResponse.TYPE.REDIRECT:
                {
                    ctx.redirect(data);
                }
                break;
            default:
                {
                    logger.error(`处理http请求${ctx.request.url}返回结果类型未知`);
                    ctx.body = answer.httpResponse(ERROR_OBJ.SERVER_INTERNAL_ERROR, ctx.request.body.aes, true);
                }
                break;
        }

    } catch (err) {
        logger.error(`处理http请求${ctx.request.url}发生异常`, err);
        ctx.body = answer.httpResponse(err, ctx.request.body.aes, true);
    }
}