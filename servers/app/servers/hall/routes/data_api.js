// const express = require('express');
// const router = express.Router();
const _ = require('underscore');
const StringUtil = require('../src/utils/StringUtil');
const FileUtil = require('../src/utils/FileUtil');
const data_util = require('../controllers/data/data_util');
const buzz_cst_game = require('../src/buzz/cst/buzz_cst_game');
const buzz_cst_sdk = require('../src/buzz/cst/buzz_cst_sdk');
const data_gold = require('../controllers/data/gold');
const data_pearl = require('../controllers/data/pearl');
const data_shop = require('../controllers/data/shop');
const data_weapon = require('../controllers/data/weapon');
const data_broadcast = require('../controllers/data/broadcast');
const data_activity = require('../controllers/data/activity');
const data_mail = require('../controllers/data/mail');
const data_aquarium = require('../controllers/data/aquarium');
const data_pay = require('../controllers/data/pay');
const data_goddess = require('../controllers/data/goddess');
const data_gift = require('../controllers/data/gift');
const data_rankgame = require('../controllers/data/rankgame');
const data_social = require('../controllers/data/social');
const data_reward = require('../controllers/data/reward');
const data_ai = require('../controllers/data/ai');
const data_feedback = require('../controllers/data/feedback');
const data_recieve = require('../controllers/data/recieve');
const data_level = require('../controllers/data/level');
const data_info = require('../controllers/data/info');
const reward_people = require('../controllers/data/reward_people');
const friend = require('../controllers/data/friend');
const chat = require('../controllers/data/chat');
const city = require('../controllers/data/city');
const happy_weekend = require('../controllers/data/happy_weekend');
const logger = loggerEx(__filename);
const httpHandler = require('../../common/httpHandler');
const update = require('../controllers/data/update');

module.exports = (router) => {
    router.prefix('/data_api');

    // 获取话费券数量.
    router.post('/get_huafeiquan', async (ctx) => {
        await httpHandler(ctx, data_info, 'getHuafeiquan');
    });

    // 玩家升级时调用接口
    router.post('/level_up', async (ctx) => {
        await httpHandler(ctx, data_level, 'levelUp');
    });

    // 领取接口
    /**
     * 开宝箱.
     * token, box_id
     */
    router.post('/open_box', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'openBox');
    });

    /**
     * 开宝箱(作为掉落处理).
     * token, droplist_key, dropcount
     */
    router.post('/open_box_as_drop', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'openBoxAsDrop');
    });

    // /drop_reward是/open_box_as_drop的别名
    router.post('/drop_reward', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'openBoxAsDrop');
    });

    /**
     * 转盘抽奖
     * token, goldlevel
     */
    router.post('/turntable_draw', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'turntableDraw');
    });

    /**
     * 背包合成
     * token
     */
    router.post('/pack_mix', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'packMix');
    });

    /**
     * 实物兑换
     * token
     */
    router.post('/change_in_kind', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'changeInKind');
    });

    /**
     * 实物兑换记录查询
     * token
     */
    router.post('/get_cik_log', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'getCikLog');
    });

    /**
     * 实物兑换获取剩余兑换数
     * token
     */
    router.post('/get_cik_info', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'getCikInfo');
    });

    /**
     * 实物兑换取消(设置一个状态).
     * 兑换状态(0:处理中,1:成功,2:失败,3:玩家取消)
     * token, orderid
     */
    router.post('/cacel_cik', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'cancelCik');
    });

    /**
     * 完成强制教学领奖.
     * token
     */
    router.post('/guide_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'guideReward');
    });

    /**
     * 日常领奖
     * token
     */
    router.post('/daily_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'dailyReward');
    });

    /**
     * 成就领奖
     * token
     */
    router.post('/achieve_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'achieveReward');
    });

    /**
     * 任务领奖
     * token
     */
    router.post('/mission_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'missionReward');
    });

    /**
     * 获取任务信息
     */
    router.post('/mission_info', async (ctx) => {
        await httpHandler(ctx, data_reward, 'missionInfo');
    });

    /**
     * 一键领取.
     * token, type(0成就,1日常,2邮件)
     */
    router.post('/onekey_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'onekeyReward');
    });

    /**
     * 活跃值领奖(4个等级, 参数就是0，1，2，3)
     * token, idx
     */
    router.post('/active_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'activeReward');
    });

    /**
     * 武器升级
     * token
     */
    router.post('/weapon_up', async (ctx) => {
        await httpHandler(ctx, data_weapon, 'levelup');
    });

    /**
     * yDONE: 97-皮肤升星
     * 皮肤升星
     */
    router.post('/weapon_skin_upstar', async (ctx) => {
        await httpHandler(ctx, data_weapon, 'upstar');
    });

    /**
     * 武器皮肤购买
     * token
     */
    router.post('/weapon_buy_skin', async (ctx) => {
        await httpHandler(ctx, data_weapon, 'buySkin');
    });

    /**
     * 武器皮肤装备
     * token
     */
    router.post('/weapon_equip', async (ctx) => {
        await httpHandler(ctx, data_weapon, 'equip');
    });

    /**
     * 皮肤支持率投票
     */
    router.post('/weapon_skin_vote', async (ctx) => {
        await httpHandler(ctx, data_weapon, 'vote');
    });

    /**
     * 查询投票排行榜
     */
    router.post('/query_skin_vote', async (ctx) => {
        await httpHandler(ctx, data_weapon, 'querySkinVote');
    });

    //----------------------------------------------------------
    // VIP

    /**
     * 购买VIP礼包
     * token
     */
    router.post('/buy_vip_gift', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'buyVipGift');
    });

    /**
     * 领取VIP每日奖励.
     * token
     */
    router.post('/vip_daily_reward', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'vipDailyReward');
    });


    /**
     * 小游戏结算
     * token
     */
    router.post('/minigame_reward', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'minigameReward');
    });

    /**
     * 对玩家封号.
     * token
     */
    router.post('/ban_user', async (ctx) => {
        await httpHandler(ctx, data_feedback, 'banUser');
    });

    //----------------------------------------------------------
    // 玩家互动接口
    //----------------------------------------------------------

    // 腾讯相关 start ----------------------------------------------
    /**
     * 获取好友邀请进度.
     */
    router.post('/get_invite_progress', async (ctx) => {
        await httpHandler(ctx, data_social, 'getInviteProgress');
    });

    /**
     * 获取好友分享状态.
     */
    router.post('/get_share_status', async (ctx) => {
        await httpHandler(ctx, data_social, 'getShareStatus');
    });

    /**
     * 获取收藏状态.
     */
    router.post('/get_enshrine_status', async (ctx) => {
        await httpHandler(ctx, data_social, 'getEnshrineStatus');
    });

    /**
     * 接收邀请好友成功记录.
     */
    router.post('/invite_success', async (ctx) => {
        await httpHandler(ctx, data_social, 'inviteSuccess');
    });

    /**
     * 每日首次邀请好友记录
     */
    router.post('/invite_friend', async (ctx) => {
        await httpHandler(ctx, data_social, 'inviteDaily');
    });

    /**
     * 分享成功记录.
     */
    router.post('/share_success', async (ctx) => {
        await httpHandler(ctx, data_social, 'shareSuccess');
    });

    /**
     * 社交奖励领取.
     */
    router.post('/get_social_reward', async (ctx) => {
        await httpHandler(ctx, data_social, 'getSocialReward');
    });

    /**
     * 快捷方式相关(创建, 领取奖励)
     */
    router.post('/enshrine_success', async (ctx) => {
        await httpHandler(ctx, data_social, 'enshrineSuccess');
    });
    // 腾讯相关 end ------------------------------------------------


    // 网络检测接口(同时提供post和get两种方式)
    router.get('/check_network', async (ctx) => {
        ctx.body = {
            type: 1,
            msg: '网络连接成功',
            data: {
                is_ok: 1
            }
        };
    });

    router.post('/check_network', async (ctx) => {
        ctx.body = {
            type: 1,
            msg: '网络连接成功',
            data: {
                is_ok: 1
            }
        };
    });

    // 获取广告礼包
    router.post('/get_adv_gift', async (ctx) => {
        await httpHandler(ctx, data_gift, 'getAdvGift');
    });

    // 获取观看广告的奖励
    router.post('/get_ad_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'getAdReward');
    });

    // 获取玩家今日领取观看广告奖励的次数
    router.post('/get_ad_reward_times', async (ctx) => {
        await httpHandler(ctx, data_reward, 'getAdRewardTimes');
    });

    ////////////////////////////////////////////////////////////
    // 女神接口

    /**
     * 领取保卫女神周排名奖励
     * token
     */
    router.post('/god_week_reward', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'weekReward');
    });

    /**
     * 查询当前有无保卫女神周奖励，且返回我的当前排名、以及可以领奖的dropkey
     * token
     */
    router.post('/goddess_query_week_reward', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'queryWeekReward');
    });

    /**
     * 女神解锁身体区域
     * token, idx
     */
    router.post('/goddess_unlock', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'unlock');
    });

    /**
     * 女神升级
     * token, goddess_id
     */
    router.post('/goddess_levelup', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'levelup');
    });

    // 获取女神数据
    router.post('/get_god_data', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'getDefend');
    });

    // 挑战女神
    // TASK211: 根据当前是否免费挑战，决定是否消耗钻石，消耗则扣除钻石，且返回剩余钻石；返回剩余挑战次数。
    router.post('/challenge_god', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'challengeGoddess');
    });

    // 挑战女神
    // TASK213: 保卫女神奖励按天叠加。
    router.post('/goddess_reward_times', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'rewardTimes');
    });


    // 获取保卫女神第一名数据
    router.post('/get_god_week_top1', async (ctx) => {
        await httpHandler(ctx, data_goddess, 'weekTop1');
    });

    // 排位赛
    // 获取排位赛的结算
    router.post('/rankgame_result', async (ctx) => {
        await httpHandler(ctx, data_rankgame, 'result');
    });

    // 客户端打开排位赛界面时获取排位赛的相关信息
    // TASK191
    router.post('/rankgame_info', async (ctx) => {
        await httpHandler(ctx, data_rankgame, 'info');
    });

    // 客户端操作宝箱的统一接口
    // TASK192
    router.post('/rankgame_box', async (ctx) => {
        await httpHandler(ctx, data_rankgame, 'box');
    });

    // 是否有正在进行中的排位赛, 如果有, 则返回房间地址
    // TASK194, 198
    router.post('/rankgame_ising', async (ctx) => {
        await httpHandler(ctx, data_rankgame, 'ongoing');
    });

    ////////////////////////////////////////////////////////////

    // 水族馆
    // 解锁或升级宠物鱼
    router.post('/upgrade_petfish', async (ctx) => {
        await httpHandler(ctx, data_aquarium, 'upgradePetfish');
    });

    // 放养宠物鱼
    router.post('/put_petfish', async (ctx) => {
        await httpHandler(ctx, data_aquarium, 'putPetfish');
    });

    // 领取宠物鱼奖励
    router.post('/reward_petfish', async (ctx) => {
        await httpHandler(ctx, data_aquarium, 'rewardPetfish');
    });

    // 放置女神
    router.post('/put_goddess', async (ctx) => {
        await httpHandler(ctx, data_aquarium, 'putGoddess');
    });

    // 获取当前鱼缸和女神状态
    router.post('/get_aquarium', async (ctx) => {
        await httpHandler(ctx, data_aquarium, 'getAquarium');
    });

    ////////////////////////////////////////////////////////////

    // 邮件
    // 获取邮件列表
    router.post('/mail_list', async (ctx) => {
        await httpHandler(ctx, data_mail, 'mailList');
    });

    ////////////////////////////////////////////////////////////
    // 活动(左边活动按钮里面的内容)

    // 领取活动奖励
    router.post('/get_activity_reward', async (ctx) => {
        await httpHandler(ctx, data_activity, 'getReward');
    });

    // 返回给客户端活动列表
    router.post('/show_me_activity', async (ctx) => {
        await httpHandler(ctx, data_activity, 'showMeActivity');
    });

    //设置通告(data_api/set_broadcast)
    router.post('/set_broadcast', async (ctx) => {
        await httpHandler(ctx, data_broadcast, 'set_broadcast');
    });

    //获取通告(data_api/get_broadcast)
    router.post('/get_broadcast', async (ctx) => {
        await httpHandler(ctx, data_broadcast, 'get_broadcast');
    });

    //增加一条金币改动的记录(data_api/add_gold_log)
    router.post('/add_gold_log', async (ctx) => {
        await httpHandler(ctx, data_gold, 'add_gold_log');
    });

    //增加一条钻石改动的记录(data_api/add_pearl_log)
    router.post('/add_pearl_log', async (ctx) => {
        await httpHandler(ctx, data_pearl, 'add_pearl_log');
    });

    //增加一条上商城购买的记录(data_api/add_shop_log)
    router.post('/add_shop_log', async (ctx) => {
        await httpHandler(ctx, data_shop, 'add_shop_log');
    });

    /**
     * 增加一条武器升级的记录
     * data_api/add_weapon_log
     */
    router.post('/add_weapon_log', async (ctx) => {
        await httpHandler(ctx, data_weapon, 'add_weapon_log');
    });

    /**
     * 查询月签的相关数据.
     */
    router.post('/month_sign', async (ctx) => {
        await httpHandler(ctx, data_reward, 'monthSign');
    });

    /**
     * 领取每日奖励，领取后会把数据库中对应用户的day_reward字段设置为0
     * data_api/get_day_reward
     */
    router.post('/get_day_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'get_day_reward');
    });

    /**
    * 签到额外奖励
    * data_api/get_day_extra_reward
    */
    router.post('/get_day_extra_reward', async (ctx)=> {
        await httpHandler(ctx, data_reward, 'get_day_extra_reward');
    });

    /**
     * 领取破产补偿，每天可以获取5次，每次1000金币. 每次直接补满金币到1000.
     * data_api/get_bankruptcy_compensation
     */
    router.post('/get_bankruptcy_compensation', async (ctx) => {
        await httpHandler(ctx, data_reward, 'get_bankruptcy_compensation');
    });

    /**
     * 获取当前用户当天总的在线时间.
     * data_api/get_online_time
     */
    router.post('/get_online_time', async (ctx) => {
        await httpHandler(ctx, data_reward, 'get_online_time');
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
    router.post('/buy', async (ctx) => {
        await httpHandler(ctx, data_pay, 'buy');

        // if (ArrayUtil.contain(WHITE_LIST, uid)) {
        // if (620694 == uid || 301 == uid || 298 == uid || 6911 == uid || 733 == uid) {
        //     data_pay.get_game_order(req, res);
        // } else {
        //     await httpHandler(ctx, data_pay, 'buy');
        // }
    });

    /**
     * 获取游戏物品订单(包括订单号等).
     * data_api/get_game_order
     * 传入参数为用户token, 商品id, 是否测试test(测试传true, 正式环境false)
     */
    router.post('/get_game_order', async (ctx) => {
        await httpHandler(ctx, data_pay, 'get_game_order');
    });

    /**
     * 轮询接口, 在数据库中不停.
     * data_api/check_order_status
     * 传入参数为用户的Token以及game_order_id
     */
    router.post('/check_order_status', async (ctx) => {
        await httpHandler(ctx, data_pay, 'check_order_status');
    });

    /**
     * 模拟白鹭支付.
     * data_api/simulate_egret_pay
     */
    router.post('/simulate_egret_pay', async (ctx) => {
        // const FUNC = TAG + "/simulate_egret_pay --- ";

        // logger.info(FUNC + "CALL...");
        // logger.info(FUNC + "req.body:", req.body);

        // let aes = req.body.aes;
        // let dataObj = {};
        // try {
        //     dataObj = buzz_cst_game.getDataObj(req.body.data, req.body.aes);
        // } catch (json_parse_err) {
        //     logger.error(FUNC + "msg:", "模拟白鹭支付失败(json解析错误)");
        //     logger.error(FUNC + "err:", json_parse_err);
        //     res.success({
        //         type: 1,
        //         msg: '模拟白鹭支付失败(json解析错误)',
        //         err: '' + json_parse_err
        //     });
        //     return;
        // }
        // let goodsId = dataObj.goodsId;
        // let goodsNumber = dataObj.goodsNumber;
        // let serverId = dataObj.serverId;
        // let ext = dataObj.ext;

        // let cb_body = {
        //     "orderId": "423364485842425A4645704E63317442",
        //     "id": "423364485842425A4645704E63317442",
        //     "money": 1,
        //     "ext": ext,
        //     "time": "1478246101",
        //     "serverId": serverId,
        //     "goodsId": goodsId,
        //     "goodsNumber": goodsNumber,
        //     "sign": "6409178265947dcabae0d42f5d03c108"
        // };


        // // HTTP请求(此模拟仅在开发机上使用, port固定为1337)
        // let http = require('http');

        // let content = JSON.stringify(cb_body);

        // let options = {
        //     hostname: "localhost",
        //     port: 1337,
        //     path: '/data_api/callback_egret_pay',
        //     method: 'POST',
        //     headers: {
        //         "Content-Type": 'application/json',
        //         "Content-Length": content.length
        //     }
        // };

        // let req_cb = http.request(options, function (res_cb) {
        //     logger.info('STATUS: ' + res_cb.statusCode);
        //     logger.info('HEADERS: ' + JSON.stringify(res_cb.headers));
        //     res_cb.setEncoding('utf8');
        //     res_cb.on('data', function (chunk) {
        //         logger.info('chunk: ' + chunk);
        //     });
        // });

        // req_cb.on('error', function (e) {
        //     logger.info('problem with request: ' + e.message);
        // });

        // // write data to request body
        // req_cb.write(content + "\n");

        // req_cb.end();
        // // HTTP请求结束

        // res.success({
        //     type: 1,
        //     msg: '模拟白鹭支付成功',
        //     data: 1
        // });

    });

    let crypto = require('crypto');

    function md5(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    /**
     * 白鹭支付回调地址.
     * data_api/callback_egret_pay
     */
    router.post('/callback_egret_pay', async (ctx) => {
        //         const FUNC = TAG + "/callback_egret_pay --- ";

        //         logger.info(FUNC + "CALL...");
        //         logger.info(FUNC + "req.body:", req.body);

        //         //TODO: 处理回调信息，在数据库中进行记录
        //         // 数据格式
        //         /* 
        // req.body:
        // {
        //     "orderId":"423364485842425A4645704E63317442", 
        //     "id":"ce3af2e06a0c5dc981fcdb060ebc6bde",
        //     "money":"1",
        //     "ext":"xx",
        //     "time":"1478246101",
        //     "serverId":"1",
        //     "goodsId":"1",
        //     "goodsNumber":"1",
        //     "sign":"6409178265947dcabae0d42f5d03c108"
        // }
        //      */
        //         let orderId = req.body.orderId;
        //         let id = req.body.id;
        //         let money = req.body.money;
        //         let ext = req.body.ext;
        //         let time = req.body.time;
        //         let serverId = req.body.serverId;
        //         let goodsId = req.body.goodsId;
        //         let goodsNumber = req.body.goodsNumber;
        //         let sign = req.body.sign;
        //         let testsign = "ext=" + ext + "goodsId=" + goodsId + "goodsNumber=" + goodsNumber + "id=" + id + "money=" + money + "orderId=" +
        //             orderId + "serverId=" + serverId + "time=" + time + "i2rc2kyjTuNKstkT5ucIF";
        //         if (md5(testsign) != sign) {
        //             logger.error(FUNC + "签名验证失败");
        //             res.success({
        //                 code: 1013
        //             });
        //             return;
        //         }
        //         // 通过game_order_id来查询数据库中的订单并修改状态
        //         try {
        //             // 将转义符'&quot;'全部替换为双引号
        //             ext = StringUtil.replaceAll(ext, '&quot;', '"');
        //             ext = JSON.parse(ext);
        //         } catch (err_parse) {
        //             logger.error(FUNC + "解析错误", err_parse);
        //         }
        //         if (ext.game_order_id) {
        //             logger.info(FUNC + "ext:", ext);
        //             logger.info(FUNC + "game_order_id:", ext.game_order_id);

        //             let dataObj = {
        //                 channel_cb: req.body, //记录在订单的
        //                 game_order_id: ext.game_order_id,
        //                 channel: buzz_cst_sdk.CHANNEL_ID.EGRET
        //             }

        //             // TODO: 修改订单状态
        //             myDao.changeOrderStatus(dataObj, function (err, result) {
        //                 if (err) {
        //                     logger.error(FUNC + "支付失败:", err);
        //                     res.success({
        //                         code: 1013
        //                     });
        //                 } else {
        //                     logger.info(FUNC + "支付成功");
        //                     res.success({
        //                         code: 0
        //                     });
        //                 }
        //             });
        //         } else {
        //             logger.error(FUNC + "支付失败: ext中没有需要的字段(game_order_id, 游戏订单号)");
        //             res.success({
        //                 code: 1013
        //             });
        //         }
    });


    router.post('/update_account', async (ctx) => {
        await httpHandler(ctx, update, 'updateAccount');
    });

    /**
     * 获取好友排行榜
     */
    router.post('/get_friends_ranking', async (ctx) => {
        await httpHandler(ctx, data_social, 'getFriendsCharts');
    });

    /**
     * 获取实时排名
     */
    router.post('/get_ranking', async (ctx) => {
        await httpHandler(ctx, data_rankgame, 'get_ranking');
    });

    /**
     * 更新一条AI数据(记录到一个log表中)，然后返回统计算出的AI参考参数
     */
    router.post('/update_ai', async (ctx) => {
        await httpHandler(ctx, data_ai, 'update_ai');
    });

    /**
     * 打赏
     * @type {exports|module.exports}
     */
    router.post('/reward_people', async (ctx) => {
        await httpHandler(ctx, reward_people, 'reward_people');
    });

    /**
     * 发送聊天
     */
    router.post('/send_chat', async (ctx) => {
        await httpHandler(ctx, chat, 'sendChat');
    });

    /**
     * 禁言
     */
    router.post('/forbid_player_world', async (ctx) => {
        await httpHandler(ctx, chat, 'forbid_player_world');
    });

    /**
     * 解除禁言
     */
    router.post('/unforbid_player_world', async (ctx) => {
        await httpHandler(ctx, chat, 'unforbid_player_world');
    });

    /**
     * 返回聊天个人信息
     */
    router.post('/get_user_info', async (ctx) => {
        await httpHandler(ctx, chat, 'userInfo');
    });

    /**
     * 添加好友
     */
    router.post('/add_friend', async (ctx) => {
        await httpHandler(ctx, friend, 'addFriend');
    });

    /**
     * 删除好友
     */
    router.post('/del_friend', async (ctx) => {
        await httpHandler(ctx, friend, 'delFriend');
    });

    /**
     * 设置城市
     */
    router.post('/set_city', async (ctx) => {
        await httpHandler(ctx, city, 'setCity');
    });

    /**
     * 获取玩家历史排行信息
     */
    router.post('/get_user_rank', async (ctx) => {
        await httpHandler(ctx, data_reward, 'getUserRank');
    });

    /**
     * 获取玩家排行榜奖励
     */
    router.post('/get_chart_reward', async (ctx) => {
        await httpHandler(ctx, data_reward, 'getChartReward');
    });


    /**
     * 查询周末狂欢活动状态
     * 是否开始、是否过期，距离领取的时间，是否已领取等
     * added by scott on 2017.10.16
     */
    router.post('/query_weekend_reward', async (ctx) => {
        await httpHandler(ctx, happy_weekend, 'getDataWithToken');
    });

    /**
     * 领取周末狂欢奖励
     * added by scott on 2017.10.16
     */
    router.post('/get_weekend_reward', async (ctx) => {
        await httpHandler(ctx, happy_weekend, 'check2GetReward');
    });

    /**
     * 更新周末狂欢捕鱼任意条进度
     * added by scott on 2017.10.17
     */
    router.post('/upload_hweekend_fishing', async (ctx) => {
        await httpHandler(ctx, happy_weekend, 'saveFishingCount');
    });

    /**
     * 查询玩家使用的喇叭和收到的鲜花
     * 注意是收到的鲜花，不是当前鲜花总量
     */
    router.post('/get_horn_flower', async (ctx) => {
        await httpHandler(ctx, data_info, 'getHornFlower');
    });

    /**
     * 查询指定某个道具剩余过期时间
     */
    router.post('/get_item_limit_time', async (ctx) => {
        await httpHandler(ctx, data_info, 'getItemLimitTime');
    });

    /**
     * 查询玩家限时道具获得时间
     */
    router.post('/get_item_limit_got_time', async (ctx) => {
        await httpHandler(ctx, data_info, 'getItemLimitGotTime');
    });

    /**
     * 查询本周本月邀请数量
     */
    router.post('/get_invite_info', async (ctx) => {

    });

    /**
     * 免费开通周卡月卡
     */
    router.post('/get_free_card', async (ctx) => {

    });
};