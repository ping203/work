// const express = require('express');
// const router = express.Router();
const _ = require('underscore');
const StringUtil = require('../src/utils/StringUtil');
const FileUtil = require('../src/utils/FileUtil');
const data_util = require('./data/data_util');
const buzz_cst_game = require('../src/buzz/cst/buzz_cst_game');
const buzz_cst_sdk = require('../src/buzz/cst/buzz_cst_sdk');
const data_gold = require('./data/gold');
const data_pearl = require('./data/pearl');
const data_shop = require('./data/shop');
const data_weapon = require('./data/weapon');
const data_broadcast = require('./data/broadcast');
const data_cdkey = require('./data/cd_key');
const data_activity = require('./data/activity');
const data_draw = require('./data/draw');
const data_mail = require('./data/mail');
const data_aquarium = require('./data/aquarium');
const data_pay = require('./data/pay');
const data_goddess = require('./data/goddess');
const data_gift = require('./data/gift');
const data_rankgame = require('./data/rankgame');
const data_social = require('./data/social');
const data_reward = require('./data/reward');
const data_ai = require('./data/ai');
const data_feedback = require('./data/feedback');
const data_recieve = require('./data/recieve');
const data_level = require('./data/level');
const data_info = require('./data/info');
const reward_people = require('./data/reward_people');
const friend = require('./data/friend');
const chat = require('./data/chat');
const city = require('./data/city');
const buzz_update = require('../src/buzz/buzz_update');
const logger = loggerEx(__filename);

const TAG = "【data_api】";


const httpHandler = require('../../common/httpHandler');

module.exports = (router) => {
	router.prefix = '/data_api';

    // 获取话费券数量.
	router.post('/get_huafeiquan', async (ctx) => {
		await httpHandler(ctx, data_info, 'getHuafeiquan');
    });
    
	router.post('/level_up', async (ctx) => {
		await httpHandler(ctx, data_level, 'levelUp');
    });

	router.post('/open_box', async (ctx) => {
		await httpHandler(ctx, data_recieve, 'openBox');
    });

	router.post('/level_up', async (ctx) => {
		await httpHandler(ctx, data_level, 'levelUp');
    });

	router.post('/level_up', async (ctx) => {
		await httpHandler(ctx, data_level, 'levelUp');
    });
    
};


// 获取话费券数量.
router.post('/get_huafeiquan', function (req, res) {
    data_info.getHuafeiquan(req, res);
});

//----------------------------------------------------------
// 升级接口
//----------------------------------------------------------
// 玩家升级时调用接口
router.post('/level_up', function (req, res) {
    data_level.levelUp(req, res);
});

//----------------------------------------------------------
// 领取接口
//----------------------------------------------------------
// DONE
/**
 * 开宝箱.
 * token, box_id
 */
router.post('/open_box', function (req, res) {
    data_recieve.openBox(req, res);
});

/**
 * 开宝箱(作为掉落处理).
 * token, droplist_key, dropcount
 */
router.post('/open_box_as_drop', function (req, res) {
    data_recieve.openBoxAsDrop(req, res);
});
// /drop_reward是/open_box_as_drop的别名
router.post('/drop_reward', function (req, res) {
    data_recieve.openBoxAsDrop(req, res);
});

/**
 * 转盘抽奖
 * token, goldlevel
 */
router.post('/turntable_draw', function (req, res) {
    data_recieve.turntableDraw(req, res);
});

/**
 * 背包合成
 * token
 */
router.post('/pack_mix', function (req, res) {
    data_recieve.packMix(req, res);
});

/**
 * 实物兑换
 * token
 */
router.post('/change_in_kind', function (req, res) {
    data_recieve.changeInKind(req, res);
});

/**
 * 实物兑换记录查询
 * token
 */
router.post('/get_cik_log', function (req, res) {
    data_recieve.getCikLog(req, res);
});

/**
 * 实物兑换获取剩余兑换数
 * token
 */
router.post('/get_cik_info', function (req, res) {
    data_recieve.getCikInfo(req, res);
});

/**
 * 实物兑换取消(设置一个状态).
 * 兑换状态(0:处理中,1:成功,2:失败,3:玩家取消)
 * token, orderid
 */
router.post('/cacel_cik', function (req, res) {
    data_recieve.cancelCik(req, res);
});

/**
 * 完成强制教学领奖.
 * token
 */
router.post('/guide_reward', function (req, res) {
    data_reward.guideReward(req, res);
});

/**
 * 日常领奖
 * token
 */
router.post('/daily_reward', function (req, res) {
    data_reward.dailyReward(req, res);
});

/**
 * 成就领奖
 * token
 */
router.post('/achieve_reward', function (req, res) {
    data_reward.achieveReward(req, res);
});

/**
 * 任务领奖
 * token
 */
router.post('/mission_reward', function (req, res) {
    data_reward.missionReward(req, res);
});

/**
 * 获取任务信息
 */
router.post('/mission_info', function (req, res) {
    data_reward.missionInfo(req, res);
});

/**
 * 一键领取.
 * token, type(0成就,1日常,2邮件)
 */
router.post('/onekey_reward', function (req, res) {
    data_reward.onekeyReward(req, res);
});

/**
 * 活跃值领奖(4个等级, 参数就是0，1，2，3)
 * token, idx
 */
router.post('/active_reward', function (req, res) {
    data_reward.activeReward(req, res);
});

/**
 * 武器升级
 * token
 */
router.post('/weapon_up', function (req, res) {
    data_weapon.levelup(req, res);
});

/**
 * yDONE: 97-皮肤升星
 * 皮肤升星
 */
router.post('/weapon_skin_upstar', function (req, res) {
    data_weapon.upstar(req, res);
});

/**
 * 武器皮肤购买
 * token
 */
router.post('/weapon_buy_skin', function (req, res) {
    data_weapon.buySkin(req, res);
});

/**
 * 武器皮肤装备
 * token
 */
router.post('/weapon_equip', function (req, res) {
    data_weapon.equip(req, res);
});

/**
 * 皮肤支持率投票
 */
router.post('/weapon_skin_vote', function (req, res) {
    data_weapon.vote(req, res);
});

/**
 * 查询投票排行榜
 */
router.post('/query_skin_vote', function (req, res) {
    data_weapon.querySkinVote(req, res);
});

//----------------------------------------------------------
// VIP

/**
 * 购买VIP礼包
 * token
 */
router.post('/buy_vip_gift', function (req, res) {
    data_recieve.buyVipGift(req, res);
});

/**
 * 领取VIP每日奖励.
 * token
 */
router.post('/vip_daily_reward', function (req, res) {
    data_recieve.vipDailyReward(req, res);
});


//----------------------------------------------------------
// TODO

/**
 * 小游戏结算
 * token
 */
router.post('/minigame_reward', function (req, res) {
    data_recieve.minigameReward(req, res);
});

//----------------------------------------------------------
// 玩家反馈接口
//----------------------------------------------------------
/**
 * 接收玩家发来的一条留言
 * token, text
 */
/*router.post('/player_propose', function (req, res) {
    data_feedback.playerPropose(req, res);
});*/

/**
 * 客户端拉取留言板内容.
 * token, timestamp, count, hot4
 */
/*router.post('/query_msgboard', function (req, res) {
    data_feedback.queryMsgboard(req, res);
});*/

/**
 * 玩家点赞.
 * token, mid
 */
/*router.post('/like_msgboard', function (req, res) {
    data_feedback.likeMsgboard(req, res);
});*/

/**
 * 刪除留言.
 * token, mid
 */
/*router.post('/del_msgboard', function (req, res) {
    data_feedback.delMsgboard(req, res);
});*/

/**
 * 对玩家封号.
 * token
 */
router.post('/ban_user', function (req, res) {
    data_feedback.banUser(req, res);
});

//----------------------------------------------------------
// 玩家互动接口
//----------------------------------------------------------

// 腾讯相关 start ----------------------------------------------
/**
 * 获取好友邀请进度.
 */
router.post('/get_invite_progress', function (req, res) {
    data_social.getInviteProgress(req, res);
});

/**
 * 获取好友分享状态.
 */
router.post('/get_share_status', function (req, res) {
    data_social.getShareStatus(req, res);
});

/**
 * 获取收藏状态.
 */
router.post('/get_enshrine_status', function (req, res) {
    data_social.getEnshrineStatus(req, res);
});

/**
 * 接收邀请好友成功记录.
 */
router.post('/invite_success', function (req, res) {
    data_social.inviteSuccess(req, res);
});

/**
 * 每日首次邀请好友记录
 */
router.post('/invite_friend', function (req, res) {
    data_social.inviteDaily(req, res);
});

/**
 * 分享成功记录.
 */
router.post('/share_success', function (req, res) {
    data_social.shareSuccess(req, res);
});

/**
 * 社交奖励领取.
 */
router.post('/get_social_reward', function (req, res) {
    data_social.getSocialReward(req, res);
});

/**
 * 快捷方式相关(创建, 领取奖励)
 */
router.post('/enshrine_success', function (req, res) {
    data_social.enshrineSuccess(req, res);
});
// 腾讯相关 end ------------------------------------------------


// 网络检测接口(同时提供post和get两种方式)
router.get('/check_network', function (req, res) {
    res.success({type: 1, msg: '网络连接成功', data: {is_ok: 1}});
});

router.post('/check_network', function (req, res) {
    res.success({type: 1, msg: '网络连接成功', data: {is_ok: 1}});
});

// 获取广告礼包
router.post('/get_adv_gift', function (req, res) {
    data_gift.getAdvGift(req, res);
});

// 获取观看广告的奖励
router.post('/get_ad_reward', function (req, res) {
    data_reward.getAdReward(req, res);
});

// 获取玩家今日领取观看广告奖励的次数
router.post('/get_ad_reward_times', function (req, res) {
    data_reward.getAdRewardTimes(req, res);
});

////////////////////////////////////////////////////////////
// 女神接口

/**
 * 领取保卫女神周排名奖励
 * token
 */
router.post('/god_week_reward', function (req, res) {
    data_goddess.weekReward(req, res);
});

/**
 * 查询当前有无保卫女神周奖励，且返回我的当前排名、以及可以领奖的dropkey
 * token
 */
router.post('/goddess_query_week_reward', function (req, res) {
    data_goddess.queryWeekReward(req, res);
});

/**
 * 女神解锁身体区域
 * token, idx
 */
router.post('/goddess_unlock', function (req, res) {
    data_goddess.unlock(req, res);
});

/**
 * 女神升级
 * token, goddess_id
 */
router.post('/goddess_levelup', function (req, res) {
    data_goddess.levelup(req, res);
});

// 获取女神数据
router.post('/get_god_data', function (req, res) {
    data_goddess.getDefend(req, res);
});

// 挑战女神
// TASK211: 根据当前是否免费挑战，决定是否消耗钻石，消耗则扣除钻石，且返回剩余钻石；返回剩余挑战次数。
router.post('/challenge_god', function (req, res) {
    data_goddess.challengeGoddess(req, res);
});

// 挑战女神
// TASK213: 保卫女神奖励按天叠加。
router.post('/goddess_reward_times', function (req, res) {
    data_goddess.rewardTimes(req, res);
});


// 获取保卫女神第一名数据
router.post('/get_god_week_top1', function (req, res) {
    data_goddess.weekTop1(req, res);
});

// 排位赛
// 获取排位赛的结算
router.post('/rankgame_result', function (req, res) {
    data_rankgame.result(req, res);
});

// 客户端打开排位赛界面时获取排位赛的相关信息
// TASK191
router.post('/rankgame_info', function (req, res) {
    data_rankgame.info(req, res);
});

// 客户端操作宝箱的统一接口
// TASK192
router.post('/rankgame_box', function (req, res) {
    data_rankgame.box(req, res);
});

// 是否有正在进行中的排位赛, 如果有, 则返回房间地址
// TASK194, 198
router.post('/rankgame_ising', function (req, res) {
    const FUNC = TAG + "/rankgame_ising --- ";
    logger.info(FUNC + "CALL..");
    data_rankgame.ongoing(req, res);
});

////////////////////////////////////////////////////////////

// 水族馆
// 解锁或升级宠物鱼
router.post('/upgrade_petfish', function (req, res) {
    data_aquarium.upgradePetfish(req, res);
});

// 放养宠物鱼
router.post('/put_petfish', function (req, res) {
    data_aquarium.putPetfish(req, res);
});

// 领取宠物鱼奖励
router.post('/reward_petfish', function (req, res) {
    data_aquarium.rewardPetfish(req, res);
});

// 放置女神
router.post('/put_goddess', function (req, res) {
    data_aquarium.putGoddess(req, res);
});

// 获取当前鱼缸和女神状态
router.post('/get_aquarium', function (req, res) {
    data_aquarium.getAquarium(req, res);
});

////////////////////////////////////////////////////////////

// 邮件
// 获取邮件列表
router.post('/mail_list', function (req, res) {
    data_mail.mailList(req, res);
});

// 领取邮件奖励
router.post('/read_mail', function (req, res) {
    data_mail.readMail(req, res);
});

////////////////////////////////////////////////////////////

//幸运大抽奖
router.post('/get_draw', function (req, res) {
    data_draw.getDraw(req, res);
});

////////////////////////////////////////////////////////////
// 活动(左边活动按钮里面的内容)

// 领取活动奖励
router.post('/get_activity_reward', function (req, res) {
    data_activity.getReward(req, res);
});

// 返回给客户端活动列表
router.post('/show_me_activity', function (req, res) {
    data_activity.showMeActivity(req, res);
});

////////////////////////////////////////////////////////////

// 使用CD-KEY
router.post('/use_cdkey', function (req, res) {
    data_cdkey.use(req, res);
});

//设置通告(data_api/set_broadcast)
router.post('/set_broadcast', function (req, res) {
    data_broadcast.set_broadcast(req, res);
});

//获取通告(data_api/get_broadcast)
router.post('/get_broadcast', function (req, res) {
    data_broadcast.get_broadcast(req, res);
});

//增加一条金币改动的记录(data_api/add_gold_log)
router.post('/add_gold_log', function (req, res) {
    data_gold.add_gold_log(req, res);
});

//增加一条钻石改动的记录(data_api/add_pearl_log)
router.post('/add_pearl_log', function (req, res) {
    data_pearl.add_pearl_log(req, res);
});

//增加一条上商城购买的记录(data_api/add_shop_log)
router.post('/add_shop_log', function (req, res) {
    data_shop.add_shop_log(req, res);
});

/**
 * 增加一条武器升级的记录
 * data_api/add_weapon_log
 */
router.post('/add_weapon_log', function (req, res) {
    data_weapon.add_weapon_log(req, res);
});

/**
 * 获得配置文件(需要传入路径)
 * data_api/get_cfg_file
 */
router.post('/get_cfg_file', function (req, res) {
    const FUNC = TAG + "/get_cfg_file --- ";

    logger.info(FUNC + "CALL...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '获取配置文件失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    logger.info(FUNC + "path:", dataObj.path);

    // DONE: 使用读文件的方式来获取json文件的内容(同步方式)
    let contentCfgFile = FileUtil.readFileSync(dataObj.path);
    let ret_json = {};
    try {
        ret_json = JSON.parse(contentCfgFile);
    }
    catch (err_parse) {
        res.success({type: 1, msg: '获取配置文件成功，请从data中读取数据', data: contentCfgFile, aes: false});
        return;
    }
    let res_data = buzz_cst_game.getResData(ret_json, aes);
    res.success({type: 1, msg: '获取配置文件成功，请从data中读取数据', data: res_data, aes: aes});
});

/**
 * 查询月签的相关数据.
 */
router.post('/month_sign', function (req, res) {
    data_reward.monthSign(req, res);
});

/**
 * 领取每日奖励，领取后会把数据库中对应用户的day_reward字段设置为0
 * data_api/get_day_reward
 */
router.post('/get_day_reward', function (req, res) {
    data_reward.get_day_reward(req, res);
});

/**
 * 领取破产补偿，每天可以获取5次，每次1000金币. 每次直接补满金币到1000.
 * data_api/get_bankruptcy_compensation
 */
router.post('/get_bankruptcy_compensation', function (req, res) {
    data_reward.get_bankruptcy_compensation(req, res);
});

/**
 * 获取当前用户当天总的在线时间.
 * data_api/get_online_time
 */
router.post('/get_online_time', function (req, res) {
    data_reward.get_online_time(req, res);
});

const WHITE_LIST = [
    620694,
    301,
    298,
    6911
];

/**
 * 走渠道支付流程
 */
router.post('/buy', function (req, res) {

    const FUNC = TAG + "/buy --- ";
    const HINT = "玩家付费";

    let aes = req.body.aes;
    let dataObj = data_util.parseDataObj(req, HINT);

    let token = dataObj.token;
    let uid = token.split('_')[0];

    // if (ArrayUtil.contain(WHITE_LIST, uid)) {
    if (620694 == uid || 301 == uid || 298 == uid || 6911 == uid || 733 == uid) {
        data_pay.get_game_order(req, res);
    }
    else {
        data_pay.buy(req, res);
    }
});

/**
 * 获取游戏物品订单(包括订单号等).
 * data_api/get_game_order
 * 传入参数为用户token, 商品id, 是否测试test(测试传true, 正式环境false)
 */
router.post('/get_game_order', function (req, res) {
    data_pay.get_game_order(req, res);
});

/**
 * 轮询接口, 在数据库中不停.
 * data_api/check_order_status
 * 传入参数为用户的Token以及game_order_id
 */
router.post('/check_order_status', function (req, res) {
    data_pay.check_order_status(req, res);
});

/**
 * 模拟白鹭支付.
 * data_api/simulate_egret_pay
 */
router.post('/simulate_egret_pay', function (req, res) {
    const FUNC = TAG + "/simulate_egret_pay --- ";

    logger.info(FUNC + "CALL...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        logger.error(FUNC + "msg:", "模拟白鹭支付失败(json解析错误)");
        logger.error(FUNC + "err:", json_parse_err);
        res.success({type: 1, msg: '模拟白鹭支付失败(json解析错误)', err: '' + json_parse_err});
        return;
    }
    let goodsId = dataObj.goodsId;
    let goodsNumber = dataObj.goodsNumber;
    let serverId = dataObj.serverId;
    let ext = dataObj.ext;

    let cb_body = {
        "orderId": "423364485842425A4645704E63317442",
        "id": "423364485842425A4645704E63317442",
        "money": 1,
        "ext": ext,
        "time": "1478246101",
        "serverId": serverId,
        "goodsId": goodsId,
        "goodsNumber": goodsNumber,
        "sign": "6409178265947dcabae0d42f5d03c108"
    };


    // HTTP请求(此模拟仅在开发机上使用, port固定为1337)
    let http = require('http');

    let content = JSON.stringify(cb_body);

    let options = {
        hostname: "localhost",
        port: 1337,
        path: '/data_api/callback_egret_pay',
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": content.length
        }
    };

    let req_cb = http.request(options, function (res_cb) {
        logger.info('STATUS: ' + res_cb.statusCode);
        logger.info('HEADERS: ' + JSON.stringify(res_cb.headers));
        res_cb.setEncoding('utf8');
        res_cb.on('data', function (chunk) {
            logger.info('chunk: ' + chunk);
        });
    });

    req_cb.on('error', function (e) {
        logger.info('problem with request: ' + e.message);
    });

    // write data to request body
    req_cb.write(content + "\n");

    req_cb.end();
    // HTTP请求结束

    res.success({type: 1, msg: '模拟白鹭支付成功', data: 1});

});

let crypto = require('crypto');

function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * 白鹭支付回调地址.
 * data_api/callback_egret_pay
 */
router.post('/callback_egret_pay', function (req, res) {
    const FUNC = TAG + "/callback_egret_pay --- ";

    logger.info(FUNC + "CALL...");
    logger.info(FUNC + "req.body:", req.body);

    //TODO: 处理回调信息，在数据库中进行记录
    // 数据格式
    /* 
req.body:
{
    "orderId":"423364485842425A4645704E63317442", 
    "id":"ce3af2e06a0c5dc981fcdb060ebc6bde",
    "money":"1",
    "ext":"xx",
    "time":"1478246101",
    "serverId":"1",
    "goodsId":"1",
    "goodsNumber":"1",
    "sign":"6409178265947dcabae0d42f5d03c108"
}
     */
    let orderId = req.body.orderId;
    let id = req.body.id;
    let money = req.body.money;
    let ext = req.body.ext;
    let time = req.body.time;
    let serverId = req.body.serverId;
    let goodsId = req.body.goodsId;
    let goodsNumber = req.body.goodsNumber;
    let sign = req.body.sign;
    let testsign = "ext=" + ext + "goodsId=" + goodsId + "goodsNumber=" + goodsNumber + "id=" + id + "money=" + money + "orderId="
        + orderId + "serverId=" + serverId + "time=" + time + "i2rc2kyjTuNKstkT5ucIF";
    if (md5(testsign) != sign) {
        logger.error(FUNC + "签名验证失败");
        res.success({code: 1013});
        return;
    }
    // 通过game_order_id来查询数据库中的订单并修改状态
    try {
        // 将转义符'&quot;'全部替换为双引号
        ext = StringUtil.replaceAll(ext, '&quot;', '"');
        ext = JSON.parse(ext);
    }
    catch (err_parse) {
        logger.error(FUNC + "解析错误", err_parse);
    }
    if (ext.game_order_id) {
        logger.info(FUNC + "ext:", ext);
        logger.info(FUNC + "game_order_id:", ext.game_order_id);

        let dataObj = {
            channel_cb: req.body,//记录在订单的
            game_order_id: ext.game_order_id,
            channel: buzz_cst_sdk.CHANNEL_ID.EGRET
        }

        // TODO: 修改订单状态
        myDao.changeOrderStatus(dataObj, function (err, result) {
            if (err) {
                logger.error(FUNC + "支付失败:", err);
                res.success({code: 1013});
            } else {
                logger.info(FUNC + "支付成功");
                res.success({code: 0});
            }
        });
    }
    else {
        logger.error(FUNC + "支付失败: ext中没有需要的字段(game_order_id, 游戏订单号)");
        res.success({code: 1013});
    }
});

const userAccess = require('../src/loginAuth/userAccess');
const buzz_account = require('../src/buzz/buzz_account');
const loginConfig = require('../src/loginAuth/login.config');

router.post('/bindPhone', function (req, res) {
    let FUNC = 'login ---'
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '绑定手机号失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    buzz_account.getAccountByToken(req, dataObj.token, function (err, account) {
        if (err) {
            res.success({type: 1, msg: '绑定手机号获取用户信息失败', err: '' + err});
            return;
        }

        dataObj.platformType = loginConfig.PLATFORM_TYPE.INNER;
        dataObj.uid = account.id;
        userAccess.bindPhone(dataObj, function (err, result) {
            if (err) {
                logger.error(FUNC + "绑定手机号失败:", err);
                res.success({type: 1, msg: '绑定手机号失败', err: '' + err});
            }
            else {

                let res_data = buzz_cst_game.getResData(result, aes);
                res.success({type: 1, msg: '绑定手机号成功', data: res_data, aes: aes});

            }
        });
    })


});

function bindPhone_test() {
    let FUNC = 'login ---';
    let aes = 'aes';
    let dataObj = {};
    dataObj.phone = '222222222222';
    dataObj.verifyCode = '1233';
    dataObj.token = '211_werwerwerwerwerwe';

    logger.info('----------------bindPhone_test-----------------------');
    buzz_account.getAccountByToken(null, dataObj.token, function (err, account) {
        if (err) {
            logger.error(FUNC + "绑定手机号失败:", err);
            return;
        }

        dataObj.platformType = loginConfig.PLATFORM_TYPE.INNER;
        dataObj.uid = account.id;
        userAccess.bindPhone(dataObj, function (err, result) {
            if (err) {
                logger.error(FUNC + "绑定手机号失败:", err);
            }
            else {
                logger.info(FUNC + "绑定手机号成功");

            }
        });
    })
}

// setTimeout(function(){
//     bindPhone_test();
// }, 5000)

/**
 * 更新玩家数据(包括但不限于经验值(exp),...)
 */
router.post('/update_account', function (req, res) {
    const FUNC = TAG + "/update_account --- ";

    logger.info(FUNC + "CALL...");
    logger.info(FUNC + "req.body:", req.body);

    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '更新账户数据失败(json解析错误)', err: '' + json_parse_err});
        return;
    }


    logger.info(FUNC + dataObj);
    buzz_update.updateAccount(req, dataObj, function (err, results) {
        if (err) {
            logger.error(FUNC + "msg:", "更新账户数据失败");
            logger.error(FUNC + "err:", err);
            logger.error(FUNC + "dataObj:", dataObj);
            res.success({type: 1, msg: '更新账户数据失败:' + dataObj.type, err: err});
        } else {
            logger.info("update_account results:", results);
            res.success({type: 1, msg: '更新账户数据成功', data: results[0]});
        }
    });
});

/**
 * 获取好友排行榜
 */
router.post('/get_friends_ranking', function (req, res) {
    data_social.getFriendsCharts(req, res);
});

/**
 * 获取实时排名
 */
router.post('/get_ranking', function (req, res) {
    data_rankgame.get_ranking(req, res);
});

/**
 * 更新一条AI数据(记录到一个log表中)，然后返回统计算出的AI参考参数
 */
router.post('/update_ai', function (req, res) {
    data_ai.update_ai(req, res);
});

/**
 * 打赏
 * @type {exports|module.exports}
 */
router.post('/reward_people', function (req, res) {
    // 打赏造成玩家被拉取到错误的服务器.
    // res.success({ type: 1, msg: '网络连接成功', err:{code:100001, msg: '打赏功能维护中'}});
    reward_people.reward_people(req, res);
});

/**
 * 发送聊天
 */
router.post('/send_chat', function (req, res) {
    chat.sendChat(req, res);
});

/**
 * 禁言
 */
router.post('/forbid_player_world', function (req, res) {
    chat.forbid_player_world(req, res);
});

/**
 * 解除禁言
 */
router.post('/unforbid_player_world', function (req, res) {
    chat.unforbid_player_world(req, res);
});

/**
 * 返回聊天个人信息
 */
router.post('/get_user_info', function (req, res) {
    chat.userInfo(req, res);
});

/**
 * 添加好友
 */
router.post('/add_friend', function (req, res) {
    friend.addFriend(req, res);
});

/**
 * 删除好友
 */
router.post('/del_friend', function (req, res) {
    friend.delFriend(req, res);
});

/**
 * 设置城市
 */
router.post('/set_city', function (req, res) {
    city.setCity(req, res);
});

/**
 * 获取玩家历史排行信息
 */
router.post('/get_user_rank', function (req, res) {
    data_reward.getUserRank(req, res);
});

/**
 * 获取玩家排行榜奖励
 */
router.post('/get_chart_reward', function (req, res) {
    data_reward.getChartReward(req, res);
});


/**
 * 查询周末狂欢活动状态
 * 是否开始、是否过期，距离领取的时间，是否已领取等
 * added by scott on 2017.10.16
 */
router.post('/query_weekend_reward', function (req, res) {
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '查询周末狂欢活动状态失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    let token = dataObj.token;
    let HappyWeekend = require('./data/happy_weekend');
    let hw = new HappyWeekend();
    hw.getDataWithToken(req.pool, token, res, aes);
});

/**
 * 领取周末狂欢奖励
 * added by scott on 2017.10.16
 */
router.post('/get_weekend_reward', function (req, res) {
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '领取周末狂欢失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    let token = dataObj.token;
    let HappyWeekend = require('./data/happy_weekend');
    let hw = new HappyWeekend();
    hw.check2GetReward(req, token, res, aes, dataObj.activityId);
});

/**
 * 更新周末狂欢捕鱼任意条进度
 * added by scott on 2017.10.17
 */
router.post('/upload_hweekend_fishing', function (req, res) {
    let aes = req.body.aes;
    let dataObj = {};
    try {
        dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
    }
    catch (json_parse_err) {
        res.success({type: 1, msg: '周末狂欢捕鱼进度更新失败(json解析错误)', err: '' + json_parse_err});
        return;
    }

    let token = dataObj.token;
    let HappyWeekend = require('./data/happy_weekend');
    let hw = new HappyWeekend();
    hw.saveFishingCount(req.pool, token, res, aes, dataObj.activityId, dataObj.fishing);
});

/**
 * 查询玩家使用的喇叭和收到的鲜花
 * 注意是收到的鲜花，不是当前鲜花总量
 */
router.post('/get_horn_flower', function (req, res) {
    data_info.getHornFlower(req, res);
});

/**
 * 查询指定某个道具剩余过期时间
 */
router.post('/get_item_limit_time', function (req, res) {
    data_info.getItemLimitTime(req, res);
});

/**
 * 查询玩家限时道具获得时间
 */
router.post('/get_item_limit_got_time', function (req, res) {
    data_info.getItemLimitGotTime(req, res);
});


module.exports = router;