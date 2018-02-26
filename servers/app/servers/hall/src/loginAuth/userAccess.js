const authSdk = require('./authSdk');
var utils = require('../utils/utils');
const buzz_cst_error = require('../buzz/cst/buzz_cst_error');
const loginConfig = require('./login.config'); 

let DEBUG = 1;
const TAG = '【UserAccess】';

class UserAccess {
    constructor() {
        authSdk.install(loginConfig.PLATFORM_TYPE.FACEBOOK);
        authSdk.install(loginConfig.PLATFORM_TYPE.INNER);
        authSdk.install(loginConfig.PLATFORM_TYPE.GOOGLE);
        authSdk.install(loginConfig.PLATFORM_TYPE.WANBA);
    }

    //渠道登录授权
    async enter(data, cb) {
        const FUNC = TAG + 'enter() --- ';
        // console.error('-------------------------data:', data);
        try {
            let sdkApi = authSdk.sdk(data.platformType);
            if (!sdkApi) {
                utils.invokeCallback(cb, '不支持此平台用户登录');
                return;
            }
            let userInfo = await sdkApi.getUserInfo(data);
            userInfo.platformType = data.platformType;
            let uid = await sdkApi.isRegiste({
                openid: userInfo.openid
            });
            if (!uid) {
                uid = await sdkApi.registe(userInfo);
                if (DEBUG) console.log(FUNC + '新用户注册：', uid);
            } else {
                if (DEBUG) console.log(FUNC + '新用户登录：', uid);
            }
            let account = await sdkApi.login({
                uid: uid
            });
            account.figure_url = userInfo.figure_url;
            account.commit();
            cb && cb(null, account.toJSON());
        } catch (err) {
            cb && cb(err);
        }
    }

    async registe(data, cb) {
        const FUNC = TAG + 'register() --- ';
        let sdkApi = authSdk.sdk(data.platformType);
        if (!sdkApi) {
            utils.invokeCallback(cb, '不支持此平台用户登录');
            return;
        }

        try {
            let isReg = await sdkApi.isRegiste(data);
            if (DEBUG) console.log(FUNC + '用户是否注册：', isReg);
            if (isReg) {
                utils.invokeCallback(cb, buzz_cst_error.ERROR_OBJ.USERNAME_EXIST.msg);
            } else {
                let uid = await sdkApi.registe(data);
                if (DEBUG) console.log(FUNC + '注册新用户：', uid);

                data.uid = uid;
                let account = await sdkApi.login(data);
                account.commit();
                utils.invokeCallback(cb, null, account.toJSON());
            }
        } catch (err) {
            console.error(FUNC + '新用户注册失败：', err);
            utils.invokeCallback(cb, err);
        }
    }
    async login(data, cb) {
        let sdkApi = authSdk.sdk(data.platformType);
        if (!sdkApi) {
            utils.invokeCallback(cb, '不支持此平台用户登录');
            return;
        }

        try {
            let account = await sdkApi.login(data)
            utils.invokeCallback(cb, null, account.toJSON());
        } catch (err) {
            utils.invokeCallback(cb, err);
        }
    }

    async modifyPassword(data, cb){
        let sdkApi = authSdk.sdk(data.platformType);
        if (!sdkApi) {
            utils.invokeCallback(cb, '不支持此平台用户登录');
            return;
        }

        try {
            await sdkApi.modifyPassword(data)
            utils.invokeCallback(cb, null);
        } catch (err) {
            utils.invokeCallback(cb, err);
        }
    }

    async bindPhone(data, cb){
        let sdkApi = authSdk.sdk(data.platformType);
        if (!sdkApi) {
            utils.invokeCallback(cb, '不支持此平台用户登录');
            return;
        }

        try {
            await sdkApi.bindPhone(data)
            utils.invokeCallback(cb, null);
        } catch (err) {
            utils.invokeCallback(cb, err);
        } 
    }
}

module.exports = new UserAccess();