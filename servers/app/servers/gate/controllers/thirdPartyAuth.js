const phoneVerification = require('./loginAuth/phoneVerification');
const loginConfig = require('./loginAuth/login.config');
const ERROR_OBJ = require('../../../consts/error').ERROR_OBJ;
const authSdk = require('./loginAuth/authSdk');
const logger = require('omelo-logger').getLogger('gate', __filename);
const logicResponse = require('../../common/logicResponse');

class ThirdPartyAuth {
    async login(data) {
        if (!data.channel || !data.sdkAuthResponse || !data.device) {
            throw ERROR_OBJ.PARAM_MISSING;
        }

        let sdkApi = authSdk.sdk(data.channel);
        if (!sdkApi) {
            throw ERROR_OBJ.NOT_SUPPORT_CHANNEL_LOGIN;
        }

        try {
            let userInfo = await sdkApi.getUserInfo(data);
            userInfo.channel = data.channel;
            let uid = await sdkApi.isRegiste({
                openid: userInfo.openid
            });
            if (!uid) {
                uid = await sdkApi.registe(userInfo);
                logger.info(`新用户${uid}注册`);
            } else {
                logger.info(`用户${uid}登录`);
            }
            let account = await sdkApi.login({
                uid: uid
            });
            account.figure_url = userInfo.figure_url;
            account.commit();
            return logicResponse.ask(account.toJSON());
        } catch (err) {
            logger.error(`第三方渠道${data.channel}登录授权失败`, err);
            throw ERROR_OBJ.THIRDPARTY_AUTH_FAILED;
        }
    }
}

module.exports = new ThirdPartyAuth();