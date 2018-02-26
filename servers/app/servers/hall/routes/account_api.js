const express = require('express');
const router = express.Router();
const _ = require('underscore');
const buzz_cst_game = require('../src/buzz/cst/buzz_cst_game');
const buzz_call_sdk_api = require('../src/buzz/buzz_call_sdk_api');
const buzz_cst_sdk = require('../src/buzz/cst/buzz_cst_sdk');
const login = require('../src/dao/account/login');
const sdk_egret = require('../src/buzz/sdk/egret');
const logger = loggerEx(__filename);

let DEBUG = 0;
let ERROR = 1;
const TAG = "【account_api】";

/**
 * 渠道中用户点击按钮刚进入游戏登陆页面时发送此消息, 用于计算首页流失率.
 */
router.post('/channel_login', function (req, res) {
    const FUNC = TAG + "/channel_login --- ";

    loggerEx(FUNC + "Call API...");

    let dataObj = getReqDataObj(req, res);
    if (dataObj == null) return;

    res.success({type: 1, msg: '渠道点击记录成功', data: null, aes: false});
});

/**
 * 通用方法, 稍后替换.
 * 获取请求数据对象.
 */
function getReqDataObj(req, res) {
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '渠道点击记录失败(json解析错误)', err: '' + json_parse_err});
        return null;
    }
    return dataObj;
}

let TEMP_ACCOUNT_FORBIDDEN = 0;

// API: get_temp_account
// 获取临时账户
router.post('/get_temp_account', function (req, res) {

    if (TEMP_ACCOUNT_FORBIDDEN) {
        res.success({type: 1, msg: '创建临时账户失败', err: '禁止创建临时账户'});
        return;
    }

    logger.info("req.body", req.body);
    let aes = req.body.aes;

    if (0) {
        let regData = {
            channel: 1002,
            channel_account_id: "xxaaddccfsdfsdfsdfsd_1",
            channel_account_info: {
                nickname: 'channelUser'
            }
        };

        login.register(regData, function (err, account) {
            let res_data = buzz_cst_game.getResData(account, aes);
            res.success({type: 1, msg: '创建临时账户成功', data: res_data, aes: aes});
        });
    }
    else {
        login.register(null, function (err, account) {
            let res_data = buzz_cst_game.getResData(account, aes);
            res.success({type: 1, msg: '创建临时账户成功', data: res_data, aes: aes});
        });
    }

});

// API: login_temp_account
// 使用临时账户登录
router.post('/login_temp_account', function (req, res) {
    const FUNC = TAG + "/login_temp_account --- ";

    if (TEMP_ACCOUNT_FORBIDDEN) {
        res.success({type: 1, msg: '登录临时账户失败', err: '禁止登录临时账户'});
        return;
    }

    logger.info(FUNC + "call API...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '登录临时账户失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    if (0) {
        let channel_login_data = {
            channel: 1002,
            channel_account_id: "xxaaddccfsdfsdfsdfsd_1",
        };

        login.login_channel(channel_login_data, function (err, account) {
            if (err) {
                logger.error(FUNC + "msg:", "登录渠道账户失败");
                logger.error(FUNC + "err:", err);
                res.success({type: 1, msg: '登录渠道账户失败', err: err});
            } else {
                let res_data = buzz_cst_game.getResData(account, aes);

                logger.info(FUNC + "是否加密:", aes);
                logger.info(FUNC + "用户信息:", account);
                logger.info(FUNC + "加密数据:", res_data);

                res.success({type: 1, msg: '登录渠道账户成功', data: res_data, aes: aes});

                sdk_egret.notifyLogin(account.channel_account_id);
                // tail -f /home/server/log/fjs.log | grep "DEBUG NEW USER LOGIN --- "
                logger.info("DEBUG NEW USER LOGIN --- " + "CALL sdk_egret.notifyLogin:", account.channel_account_id);
            }
        });
    }
    else {
        login.login(dataObj, function (err, account) {
            if (err) {
                logger.error(FUNC + "msg:", "登录临时账户失败");
                logger.error(FUNC + "err:", err);
                res.success({type: 1, msg: '登录临时账户失败', err: err});
            }
            else {
                let res_data = buzz_cst_game.getResData(account, aes);
                res.success({type: 1, msg: '登录临时账户成功', data: res_data, aes: aes});
            }

        });
    }
});


const userAccess = require('../src/loginAuth/userAccess');
const phoneVerification = require('../src/loginAuth/phoneVerification');
const loginConfig = require('../src/loginAuth/login.config');

// 第三方登录
router.post('/auth', function (req, res) {
    let FUNC = 'auth ---';
    DEBUG = 1;
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        // res.success({ type: 1, msg: '登录渠道账户失败(json解析错误)', err: '' + json_parse_err });
        res.success({type: 1, msg: 'JSON parse error. ', err: '' + json_parse_err});
        return;
    }

    dataObj.platformType = dataObj.channel;
    userAccess.enter(dataObj, function (err, account) {
        if (err) {
            logger.info(FUNC + "渠道账户授权失败:", err);
            // res.success({ type: 1, msg: '渠道账户授权失败', err: '' + err });
            res.success({type: 1, msg: 'Account Access Fail. ', err: '' + err});
        }
        else {

            let res_data = buzz_cst_game.getResData(account, aes);

            // logger.info(FUNC + "是否加密:", aes);
            // logger.info(FUNC + "用户信息:", account);
            // logger.info(FUNC + "加密数据:", res_data);

            // res.success({ type: 1, msg: '渠道账户授权成功', data: res_data, aes: aes });
            res.success({type: 1, msg: 'Account Access Success. ', data: res_data, aes: aes});

        }
    });
});

router.post('/register', function (req, res) {

    let FUNC = 'register ---';
    DEBUG = 1;
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        // res.success({ type: 1, msg: '平台自建账户失败(json解析错误)', err: '' + json_parse_err });
        res.success({type: 1, msg: '', err: '' + json_parse_err});
        return;
    }

    dataObj.platformType = loginConfig.PLATFORM_TYPE.INNER;
    userAccess.registe(dataObj, function (err, account) {
        if (err) {
            logger.error(FUNC + "平台自建账户授权失败:", err);
            res.success({type: 1, msg: err, err: '' + err});
        }
        else {
            let res_data = buzz_cst_game.getResData(account, aes);
            res.success({type: 1, msg: '', data: res_data, aes: aes});

        }
    });

});

//账号登录
router.post('/login', function (req, res) {
    let FUNC = 'login ---'
    DEBUG = 1;
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '', err: '' + json_parse_err});
        return;
    }

    dataObj.platformType = loginConfig.PLATFORM_TYPE.INNER;
    userAccess.login(dataObj, function (err, account) {
        if (err) {
            logger.error(FUNC + "平台自建账户授权失败:", err);
            res.success({type: 1, msg: err, err: err});
        }
        else {
            let res_data = buzz_cst_game.getResData(account, aes);
            res.success({type: 1, msg: '渠道账户登录成功', data: res_data, aes: aes});

        }
    });
});


router.post('/modifyPassword', function (req, res) {
    let FUNC = 'login ---';
    DEBUG = 1;
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '修改密码失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    dataObj.platformType = loginConfig.PLATFORM_TYPE.INNER;
    userAccess.modifyPassword(dataObj, function (err, result) {
        if (err) {
            logger.error(FUNC + "修改密码失败:", err);
            res.success({type: 1, msg: err, err: '' + err});
        }
        else {
            let res_data = buzz_cst_game.getResData(result, aes);
            res.success({type: 1, msg: 'modify password ok', data: res_data, aes: aes});
        }
    });
});

router.post('/getVerifyCode', async function (req, res) {
    let FUNC = 'getVerifyCode ---';
    DEBUG = 1;
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '获取短信验证码失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    let obj = await phoneVerification.sendPhoneCode(dataObj);
    let res_data = buzz_cst_game.getResData(obj, aes);
    res.success({type: 1, msg: '获取短信验证码成功', data: res_data, aes: aes});

});

//账号注销
router.post('/logout', function (req, res) {

})

// API: signup_channel_account
// 注册渠道账户
router.post('/signup_channel_account', function (req, res) {
    const FUNC = TAG + "/signup_channel_account --- ";

    logger.info(FUNC + "call API...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '创建渠道账户失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    logger.info(FUNC + "channel:", dataObj.channel);
    logger.info(FUNC + "channel_account_id:", dataObj.channel_account_id);

    login.register(dataObj, function (err, account) {
        if (err) {
            logger.error(FUNC + "msg:", "创建渠道账户失败");
            logger.error(FUNC + "err:", err);
            res.success({type: 1, msg: '创建渠道账户失败', err: '' + err});
        }
        else {
            let res_data = buzz_cst_game.getResData(account, aes);
            res.success({type: 1, msg: '创建渠道账户成功'});
        }

    });
});

// API: login_channel_account
// 登录渠道账户
router.post('/login_channel_account', function (req, res) {
    const FUNC = TAG + "/login_channel_account --- ";

    logger.info(FUNC + "call API...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '登录渠道账户失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    logger.info(FUNC + "channel:", dataObj.channel);
    logger.info(FUNC + "channel_account_id:", dataObj.channel_account_id);

    //fake002(res, aes);
    login.login_channel(dataObj, function (err, account) {
        if (err) {
            logger.error(FUNC + "msg:", "登录渠道账户失败");
            logger.error(FUNC + "err:", err);
            res.success({type: 1, msg: '登录渠道账户失败', err: err});
        } else {
            let res_data = buzz_cst_game.getResData(account, aes);

            logger.info(FUNC + "是否加密:", aes);
            logger.info(FUNC + "用户信息:", account);
            logger.info(FUNC + "加密数据:", res_data);

            res.success({type: 1, msg: '登录渠道账户成功', data: res_data, aes: aes});

            sdk_egret.notifyLogin(account.channel_account_id);
            // tail -f /home/server/log/fjs.log | grep "DEBUG NEW USER LOGIN --- "
            logger.info("DEBUG NEW USER LOGIN --- " + "CALL sdk_egret.notifyLogin:", account.channel_account_id);
        }
    });
});

// NOTICE: 假数据
function fake002(res, aes) {
    let result = {
        id: 1634,
        tempname: 'wb_1634',
        nickname: null,
        channel_account_name: '流闻名',
        token: '1634_2726cf08574d5b8802533ddbfafb261c39554b91880f9324',
        vip: 0,
        rmb: 0,
        exp: 120,
        level: 1,
        gold: 26119,
        pearl: 0,
        weapon: 1,
        weapon_energy: '{"1":27,"5":2}',
        vip_weapon_id: null,
        skill: '{"1":3,"2":4,"3":3,"4":-1,"8":0,"9":0,"10":0}',
        broke_times: 0,
        day_reward: 0,
        day_reward_weekly: 2,
        vip_daily_fill: 0,
        level_mission: '{}',
        mission_daily_reset: '{"dailyTotal":0,"box0":0,"box1":0,"box2":0,"box3":0}',
        mission_only_once: '{"201148":13,"202100":2,"203000":1,"204500":5,"207101":2,"208100":500,"209000":25656,"achievePoint":0}',
        first_buy: '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0}',
        first_buy_gift: 0,
        activity_gift: '{"10000":{"buycount":0,"version":1},"10001":{"buycount":0,"version":1},"10002":{"buycount":0,"version":1},"10003":{"buycount":0,"version":1},"10004":{"buycount":0,"version":1}}',
        heartbeat: 1,
        achieve_point: 0,
        gold_shopping: 0,
        weapon_skin: '{"own":[1], "equip":1}',
        bonus: null,
        drop_reset: '{}',
        drop_once: '{}',
        comeback: '{}',
        vip_gift: null,
        pirate: '{}',
        card: null,
        get_card: '{"normal":false,"senior":false}',
        package: '{"7":{"i200":1}}',
        guide: 1,
        guide_weak: '{"laser":false,"achieve":false,"reward":false}',
        active: null,
        active_stat_once: null,
        active_stat_reset: '{}',
        free_draw: '{"gold":1,"diamond":0}',
        mail_box: [],
        roipct_time: 1490255824312,
        first_login: 0,
        has_new_mail: false,
        online_time: 3,
        vip_fill_this_time: false
    };
    let res_data = buzz_cst_game.getResData(result, aes);
    console.log("加密数据:", res_data);
    res.success({type: 1, msg: '登录渠道账户成功', data: res_data, aes: aes});
}

// API: logout_account
// 退出当前账户
router.post('/logout_account', function (req, res) {
    const FUNC = TAG + "/logout_account --- ";

    logger.info(FUNC + "call API...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '退出账户失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    myDao.logout(dataObj, function (err, rows) {
        if (err) {
            logger.error(FUNC + "msg:", "退出账户失败");
            logger.error(FUNC + "err:", err);
            res.success({type: 1, msg: '退出账户失败', err: '' + err});
        } else {
            res.success({type: 1, msg: '退出账户成功'});
        }
    });

    return;
});

/**
 * 处理每日重置后的token重新拉取和玩家最新数据的返回.
 */
router.post('/token_4_daily_reset', function (req, res) {
    const FUNC = TAG + "/token_4_daily_reset --- ";

    DEBUG = 0;

    logger.info(FUNC + "call API...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '登录临时账户失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    logger.info(FUNC + "uid:", dataObj.uid);

    myDao.token4DailyReset(dataObj, function (err, rows) {
        if (err) {
            logger.error(FUNC + "msg:", "拉取重置数据");
            logger.error(FUNC + "err:", err);
            res.success({type: 1, msg: '拉取重置数据失败', err: '' + err});
        } else {
            let res_data = buzz_cst_game.getResData(rows[0], aes);
            res.success({type: 1, msg: '拉取重置数据成功', data: res_data, aes: aes});
        }

        DEBUG = 0;
    });
});

// API: call_sdk_api
// 处理第三方SDK数据
router.post('/call_sdk_api', function (req, res) {
    const FUNC = TAG + "/call_sdk_api --- ";

    logger.info(FUNC + "call API...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '处理第三方SDK数据失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    let action = dataObj.action;
    let channel = dataObj.channel;

    logger.info(FUNC + "action:", dataObj.action);
    logger.info(FUNC + "channel:", dataObj.channel);

    // 假数据
    //fake001(res, action);

    // DONE: 处理接口, 在另一个模块中进行处理
    if (channel == buzz_cst_sdk.CHANNEL_ID.EGRET) {
        buzz_call_sdk_api.callEgretApi(dataObj, req, function (err, result) {
            if (err) {
                let msg = '调用接口' + action + '失败: ' + err.msg;
                logger.error(FUNC + "msg:", msg);
                logger.error(FUNC + "err:", err);
                res.success({type: 0, msg: msg, err: '' + err});
            } else {
                res.success({type: 1, msg: '调用接口' + action + '成功', data: result});
            }
        });
    }
    else if (channel == buzz_cst_sdk.CHANNEL_ID.WANBA) {
        buzz_call_sdk_api.callTencentApi(dataObj, req, function (err, result) {
            if (err) {
                let msg = '调用接口' + action + '失败: ' + err.msg;
                logger.error(FUNC + "msg:", msg);
                logger.error(FUNC + "err:", err);
                res.success({type: 0, msg: '调用接口' + action + '失败: ' + err.msg, err: '' + err});
            } else {
                console.log(FUNC + "result:", result);
                res.success({type: 1, msg: '调用接口' + action + '成功', data: result});
            }
        });
    } else if (channel == buzz_cst_sdk.CHANNEL_ID.FACEBOOK) {

    }
    else {
        res.success({type: 1, msg: '调用接口' + action + '失败', err: new Error("不合法的渠道ID:" + channel)});
    }
});

function fake001(res, action) {
    let result = {
        ret: 0,
        is_lost: 0,
        nickname: '流闻名',
        gender: '男',
        country: '巴西',
        province: '',
        city: '',
        figureurl: 'http://thirdapp2.qlogo.cn/qzopenapp/2eaee6da8ea3be0241f83d686689bbc4b8d30b870d605acb467c0906b3c2cc2b/50',
        is_yellow_vip: 0,
        is_yellow_year_vip: 0,
        yellow_vip_level: 0,
        is_yellow_high_vip: 0,
        data: {id: 'AE576BCBCC88268799CEB8C7FAC4CDC7'},
        openid: 'AE576BCBCC88268799CEB8C7FAC4CDC7',
        code: 0,
        already_signup: true
    };
    res.success({type: 1, msg: '调用接口' + action + '成功', data: result});
}

module.exports = router;