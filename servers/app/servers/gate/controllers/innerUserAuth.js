const phoneVerification = require('./loginAuth/phoneVerification');
const constDef = require('../../../consts/constDef');
const authSdk = require('./loginAuth/authSdk');
const ERROR_OBJ = require('../../../consts/error').ERROR_OBJ;
const logger = require('omelo-logger').getLogger('gate', __filename);
const logicResponse = require('../../common/logicResponse');

class InnerUserAuth {
    /**
     * {
     *  username:'zhansan',
     *  password:'213321',
     *  device:0
     * }
     */
    async register(data) {
        if (!data.username || !data.password) {
            throw ERROR_OBJ.PARAM_MISSING;
        }

        let sdkApi = authSdk.sdk(constDef.CHANNEL.INNER);
        if (!sdkApi) {
            throw ERROR_OBJ.NOT_SUPPORT_CHANNEL_LOGIN;
        }

        try {
            let isReg = await sdkApi.isRegiste(data);
            if (isReg) {
                throw ERROR_OBJ.USERNAME_EXIST;
            } else {
                let uid = await sdkApi.registe(data);
                data.uid = uid;
                let account = await sdkApi.login(data);
                account.commit();
                logger.info(`注册新用户${uid}`)
                return logicResponse.ask(account.toJSON());
            }
        } catch (err) {
            logger.error('用户注册失败', err);
            throw ERROR_OBJ.USER_REGISTE_FAILED;
        }
    }

    async login(data) {
        if (!data.username || !data.password) {
            throw ERROR_OBJ.PARAM_MISSING;
        }

        let sdkApi = authSdk.sdk(constDef.CHANNEL.INNER);
        if (!sdkApi) {
            throw ERROR_OBJ.NOT_SUPPORT_CHANNEL_LOGIN;
        }

        try {
            let account = await sdkApi.login(data);
            account.commit();
            return logicResponse.ask(account.toJSON());
        } catch (err) {
            logger.error('用户登录失败', err);
            throw ERROR_OBJ.USERNAME_PASSWORD_ERROR;
        }
    }

    async modifyPassword(data) {
        if (!data.username || !data.oldPassword || data.newPassword) {
            throw ERROR_OBJ.PARAM_MISSING;
        }

        let sdkApi = authSdk.sdk(constDef.CHANNEL.INNER);
        if (!sdkApi) {
            throw ERROR_OBJ.NOT_SUPPORT_CHANNEL_LOGIN;
        }

        try {
            await sdkApi.modifyPassword(data);
        } catch (err) {
            logger.error('用户密码修改失败', err);
            throw ERROR_OBJ.OLD_PASSWORD_ERROR;
        }
    }

    async bindPhone(data) {
        let sdkApi = authSdk.sdk(constDef.CHANNEL.INNER);
        if (!sdkApi) {
            throw ERROR_OBJ.NOT_SUPPORT_CHANNEL_LOGIN;
        }

        try {
            await sdkApi.bindPhone(data)
        } catch (err) {
            logger.error('用户手机号绑定失败', err);
            throw ERROR_OBJ.OLD_PASSWORD_ERROR;
        }
    }
}

module.exports = new InnerUserAuth();