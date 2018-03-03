const data_recieve = require('../controllers/data/recieve');
const data_cdkey = require('../controllers/data/cd_key');
const data_draw = require('../controllers/data/draw');
const data_mail = require('../controllers/data/mail');
const data_reward = require('../controllers/data/reward');
const month_card = require('../controllers/data/month_card');
const pack = require('../controllers/data/pack');
const first_recharge = require('../controllers/data/first_recharge');

const httpHandler = require('../../common/httpHandler');

module.exports = (router) => {
    router.prefix('/data_api');

    /**
      * 实物兑换
     * token
     */
    router.post('/change_in_kind', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'changeInKind');
    });

    // 使用CD-KEY
    router.post('/use_cdkey', async (ctx) => {
        await httpHandler(ctx, data_cdkey, 'use');
    });

    //幸运大抽奖
    router.post('/get_draw', async (ctx) => {
        await httpHandler(ctx, data_draw, 'getDraw');
    });

    /**
     * 转盘抽奖
     * token, goldlevel
     */
    router.post('/turntable_draw', async (ctx) => {
        await httpHandler(ctx, data_recieve, 'turntableDraw');
    });

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
     * 领取邮件奖励
     * @test done
     */
    router.post('/read_mail', async (ctx) => {
        await httpHandler(ctx, data_mail, 'readMail');
    });

    /**
     * 领取破产补偿，每天可以获取5次，每次1000金币. 每次直接补满金币到1000.
     * data_api/get_bankruptcy_compensation
     * @test done
     */
    router.post('/get_bankruptcy_compensation', async (ctx) => {
        await httpHandler(ctx, data_reward, 'get_bankruptcy_compensation');
    });

    /**
     * 每日领取月卡奖励
     * @test done
     */
    router.post('/month_card_reward', async (ctx) => {
        await httpHandler(ctx, month_card, 'reward');
    });

    /**
     * 背包合成
     * @test done
     */
    router.post('/pack_mix', async (ctx) => {
        await httpHandler(ctx, pack, 'mix');
    });

    /**
     * 背包使用
     * @test done
     */
    router.post('/pack_use', async (ctx) => {
        await httpHandler(ctx, pack, 'use');
    });

    /**
     * 首充奖励领取
     * @test done
     */
    router.post('/first_recharge_reward', async (ctx) => {
        await httpHandler(ctx, first_recharge, 'reward');
    });

};

// // =========================================================
// // routes
// // =========================================================

// /**
//  * 实物兑换
//  * @test done
//  */
// router.post('/change_in_kind', function (req, res) {

//     data_recieve.changeInKind(req, res);
// });

// /**
//  * 使用CD-KEY
//  * @test done
//  */
// router.post('/use_cdkey', function (req, res) {
//     data_cdkey.use(req, res);
// });

// /**
//  * 幸运大抽奖
//  * @test done
//  */
// router.post('/get_draw', function (req, res) {
//     data_draw.getDraw(req, res);
// });


// /**
//  * 转盘抽奖
//  * token, goldlevel
//  * @test done
//  */
// router.post('/turntable_draw', function (req, res) {
//     data_recieve.turntableDraw(req, res);
// });

// /**
//  * 购买VIP礼包
//  * @test done
//  */
// router.post('/buy_vip_gift', function (req, res) {
//     data_recieve.buyVipGift(req, res);
// });

// /**
//  * 领取VIP每日奖励.
//  * token
//  * @test done
//  */
// router.post('/vip_daily_reward', function (req, res) {
//     data_recieve.vipDailyReward(req, res);
// });

// /**
//  * 领取邮件奖励
//  * @test done
//  */
// router.post('/read_mail', function (req, res) {
//     data_mail.readMail(req, res);
// });

// /**
//  * 领取破产补偿，每天可以获取5次，每次1000金币. 每次直接补满金币到1000.
//  * data_api/get_bankruptcy_compensation
//  * @test done
//  */
// router.post('/get_bankruptcy_compensation', function (req, res) {
//     data_reward.get_bankruptcy_compensation(req, res);
// });

// /**
//  * 每日领取月卡奖励
//  * @test done
//  */
// router.post('/month_card_reward', function (req, res) {
//     let mc = new MonthCard();
//     mc.reward(req, res);
// });

// /**
//  * 背包合成
//  * @test done
//  */
// router.post('/pack_mix', function (req, res) {
//     let pm = new Pack();
//     pm.mix(req, res);
// });

// /**
//  * 背包使用
//  * @test done
//  */
// router.post('/pack_use', function (req, res) {
//     let pm = new Pack();
//     pm.use(req, res);
// });

// /**
//  * 首充奖励领取
//  * @test done
//  */
// router.post('/first_recharge_reward', function (req, res) {
//     let fb = new FirstRecharge();
//     fb.reward(req, res);
// });


// module.exports = router;