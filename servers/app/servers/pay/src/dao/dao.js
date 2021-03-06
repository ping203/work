const DaoUtil = require('./dao_utils');
const DaoAccount = require('./dao_account');
const DaoAccountRanking = require('./account/ranking');
const DaoGold = require('./dao_gold');
const DaoPearl = require('./dao_pearl');
const DaoShop = require('./dao_shop');
const DaoSkill = require('./dao_skill');
const DaoWeapon = require('./dao_weapon');
const DaoStatistics = require('./dao_statistics');
const DaoStatisticsHour = require('./dao_statistics_hour');
const DaoStatisticsDay = require('./dao_statistics_day');
const DaoAdminRealtime = require('./dao_admin_realtime');
const DaoActivity = require('./dao_activity');
const DaoCdKey = require('./dao_cdkey');
const DaoMail = require('./dao_mail');
const DaoDraw = require('./dao_draw');
const DaoImage = require('./dao_image');
const DaoAquarium = require('./dao_aquarium');
const DaoRank = require('./account/ranking');
const DaoReward = require('./dao_reward');
const DaoRankgame = require('./dao_rankgame');
const DaoBackdoor = require('./dao_backdoor');
const DaoSocial = require('./dao_social');
const DaoChange = require('./dao_change');
const DaoOperation = require('./dao_operation');
const AccountCommon = require('./account/common');
const DaoAdminPayuser = require('./dao_admin_payuser');

function _findAccountByToken(pool, token, cb) {
    var sql = 'SELECT `id`,`tempname`,`created_at`,`updated_at` FROM `tbl_account` WHERE `token`=?';
    pool.query(sql, [token], cb);
}

exports.withDbPool = function () {
    var pool = {
        query: function (sql, values, cb) {
            mysqlConnector.query(sql, values, function (err,data) {
                cb(err, data);
            });
        }
    };
    return {
        
        findAccountByToken: function (token, cb) {
            _findAccountByToken(pool, token, cb);
        },
        
        getAccountByToken: function (token, cb) {
            AccountCommon.getAccountByToken(pool, token, cb);
        },

        //!!!
        setField: function (data, cb) {
            DaoUtil.setField(pool, data, cb);
        },

        //!!!
        channelLogin: function (data, cb) {
            DaoAccount.channelLogin(pool, data, cb);
        },
        
        //!!!
        logout: function (data, cb) {
            DaoAccount.logout(pool, data, cb);
        },
        
        //!!!
        getDayReward: function (data, cb) {
            DaoAccount.getDayReward(pool, data, cb);
        },
        
        //!!!
        resetDaillyShare: function (id_list, cb) {
            DaoSocial.resetDaillyShare(pool, id_list, cb);
        },

        //!!!
        genCharts: function (cb) {
            DaoAccountRanking.genCharts(pool, cb);
        },
        
        getFriendsCharts: function (data, cb) {
            DaoAccount.getFriendsCharts(pool, data, cb);
        },

        token4DailyReset: function (data, cb) {
            DaoAccount.token4DailyReset(pool, data, cb);
        },
        
        //!!!
        genStatistics: function (cb) {
            DaoStatistics.genStatistics(pool, cb);
        },
        
        //!!!
        getDailyStatistics: function (data, cb) {
            DaoStatistics.getDailyStatistics(pool, data, cb);
        },
        
        //!!!
        addGoldLog: function (data, cb) {
            DaoGold.addGoldLog(pool, data, cb);
        },
        
        getBankruptcyCompensation: function (data, cb) {
            DaoAccount.getBankruptcyCompensation(pool, data, cb);
        },
        
        //!!!
        addPearlLog: function (data, cb) {
            DaoPearl.addPearlLog(pool, data, cb);
        },
        
        //!!!
        addShopLog: function (data, account, cb) {
            DaoShop.addShopLog(pool, data, account, cb);
        },
        
        //!!!
        getGameOrder: function (data, cb) {
            DaoShop.getGameOrder(pool, data, cb);
        },
        
        //!!!
        checkOrderStatus: function (data, cb) {
            DaoShop.checkOrderStatus(pool, data, cb);
        },
        
        //!!!
        changeOrderStatus: function (data, cb) {
            DaoShop.changeOrderStatus(pool, data, cb);
        },
        
        //!!!
        setOrderFail: function (data, cb) {
            DaoShop.setOrderFail(pool, data, cb);
        },
        
        //通用获取奖励的方法
        getCommonReward: function (data, cb) {
            DaoReward.getCommonReward(pool, data, cb);
        },
        //通用消耗的方法
        rewardCost: function (data, cb) {
            DaoReward.costCommon(pool, data, cb);
        },
        
        //!!!
        getReward: function (data, cb) {
            DaoActivity.getReward(pool, data, cb);
        },
        
        //!!!
        showMeActivity: function (data, cb) {
            DaoActivity.showMeActivity(pool, data, cb);
        },
        
        //!!!
        updateGift: function (cb) {
            DaoActivity.updateGift(pool, cb);
        },
        
        //!!!
        addSkillLog: function (data, cb) {
            DaoSkill.addSkillLog(pool, data, cb);
        },

        //!!!
        addWeaponLog: function (data, cb) {
            DaoWeapon.addWeaponLog(pool, data, cb);
        },

        //!!!
        getOnlineTime: function (data, cb) {
            DaoGold.getOnlineTime(pool, data, cb);
        },

        //!!!
        sumUpLastHour: function (data, cb) {
            DaoStatisticsHour.sumUpLastHour(pool, data, cb);
        },
        
        sumUpLastDay: function (cb) {
            DaoStatisticsDay.sumUpLastDay(pool, cb);
        },

        getOrderList: function (data, cb) {
            DaoAdminPayuser.getOrderList(pool, data, cb);
        },
        
        getPayUserData: function (data, cb) {
            DaoAdminPayuser.getPayUserData(pool, data, cb);
        },
        
        getUserPayData: function (data, cb) {
            DaoAdminPayuser.getUserPayData(pool, data, cb);
        },
        
        getCardUserList: function (data, cb) {
            DaoAdminPayuser.getCardUserList(pool, data, cb);
        },
        
        getPayLogData: function (data, cb) {
            DaoAdminPayuser.getPayLogData(pool, data, cb);
        },
        
        getQueryPay: function (data, cb) {
            DaoAdminPayuser.getQueryPay(pool, data, cb);
        },
        
        generateCdKey: function (data, cb) {
            DaoCdKey.generate(pool, data, cb);
        },

        listCdKey: function (data, cb) {
            DaoCdKey.list(pool, data, cb);
        },

        useCdKey: function (data, cb) {
            DaoCdKey.use(pool, data, cb);
        },

        showCdkeyDetail: function (data, cb) {
            DaoCdKey.detail(pool, data, cb);
        },
        
        sendMail:function (data,cb) {
            DaoMail.sendMail(pool,data,cb);
        },

        readMail: function (data, cb) {
            DaoMail.readMail(pool, data, cb);
        },

        clearMail: function (cb) {
            DaoMail.clearMail(pool, cb);
        },

        mailList: function (data, cb) {
            DaoMail.mailList(pool, data, cb);
        },

        getDraw: function (data, cb) {
            DaoDraw.getDraw(pool, data, cb);
        },
        
        //---------------------Dao-Image------------------------
        getUrlFromWeb2Local: function (data, cb) {
            DaoImage.getUrlFromWeb2Local(pool, data, cb);
        },

        createImage: function (data, cb) {
            DaoImage.create(pool, data, cb);
        },
        
        getGoddessTop1: function (platform, cb) {
            DaoRank.getGoddessTop1(pool, platform, cb);
        },
        
        //---------------------Aquarium------------------------
        updateTableAquarium: function (account_id, aquarium, cb) {
            DaoAquarium.updateTableAquarium(pool, account_id, aquarium, cb);
        },

        //---------------------Rankgame------------------------
        getRankgame: function (data, cb) {
            DaoRankgame.getRankgame(pool, data, cb);
        },

        rankgameInfo: function (data, account, cb) {
            DaoRankgame.rankgameInfo(pool, data, account, cb);
        },

        rankgameBox: function (data, account, cb) {
            DaoRankgame.rankgameBox(pool, data, account, cb);
        },

        seasonEnd: function (cb) {
            DaoRankgame.seasonEnd(pool, cb);
        },

        //---------------------后门----------------------------
        modifyUserData: function (data, cb) {
            DaoBackdoor.modifyUserData(pool, data, cb);
        },

        kickUser: function (data, cb) {
            DaoBackdoor.kickUser(pool, data, cb);
        },

        accountForbidden: function (data, cb) {
            DaoBackdoor.accountForbidden(pool, data, cb);
        },

        accountAuth: function (data, cb) {
            DaoBackdoor.accountAuth(pool, data, cb);
        },

        switchMatch: function (data, cb) {
            DaoBackdoor.switchMatch(pool, data, cb);
        },

        switchCik: function (data, cb) {
            DaoBackdoor.switchCik(pool, data, cb);
        },

        //---------------------Social--------------------------
        getInviteProgress: function (data, cb) {
            DaoSocial.getInviteProgress(pool, data, cb);
        },
        
        getShareStatus: function (data, cb) {
            DaoSocial.getShareStatus(pool, data, cb);
        },

        getEnshrineStatus: function (data, cb) {
            DaoSocial.getEnshrineStatus(pool, data, cb);
        },
        
        inviteSuccess: function (data, cb) {
            DaoSocial.inviteSuccess(pool, data, cb);
        },
        
        shareSuccess: function (data, cb) {
            DaoSocial.shareSuccess(pool, data, cb);
        },
        
        getSocialReward: function (data, cb) {
            DaoSocial.getSocialReward(pool, data, cb);
        },

        getInviteDailyReward: function (data, cb) {
            DaoSocial.getInviteDailyReward(pool, data, cb);
        },
        
        enshrineSuccess: function (data, cb) {
            DaoSocial.enshrineSuccess(pool, data, cb);
        },
        
        writeUserException: function (cb) {
            DaoGold.writeUserException(pool, cb);
        },

        writeLogMailReward: function (cb) {
            DaoMail.writeLogMailReward(pool, cb);
        },
        
        addChangeLog: function (data, cb) {
            DaoChange.insert(pool, data, cb);
        },

        updateOperation: function (data, cb) {
            DaoOperation.update(pool, data, cb);
        },

        cancelCik: function (orderid, cb) {
            DaoChange.cancelCik(pool, orderid, cb);
        },

        updateShipTime: function (params, cb) {
            DaoChange.updateShipTime(pool, params, cb);
        },

        updateStutus: function (params, cb) {
            DaoChange.updateStutus(pool, params, cb);
        },

        updateWay: function (params, cb) {
            DaoChange.updateWay(pool, params, cb);
        },


    };
};