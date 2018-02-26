const gameConfig = require('../../../../../../utils/imports').GAME_CFGS;
const common_const_cfg = gameConfig.common_const_cfg;
const common_log_const_cfg = gameConfig.common_log_const_cfg;
const ErrorUtil = require('../../../buzz/ErrorUtil');
const BuzzUtil = require('../../../utils/BuzzUtil');
const GameLog = require('../../../log/GameLog');

let DEBUG = 0;
let ERROR = 0;
const TAG = "【update/first_buy_gift】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.update = _update;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 首充大礼包是否领取的标记(初始化均为false, 更新后为true且不再变回为false).
 */
function _update(pool, data, cb, account) {
    const FUNC = TAG + "_update() --- ";
    if (DEBUG) console.log("CALL first_buy_gift.update()");
    
    let uid = account['id'];
    let token = account['token'];
        
    if (_isStatusFalse(data, cb)) return;
    if (_isPlayerCharge(account, cb)) return;
    if (_isGiftGotten(account, cb)) return;

    let item_list = [];
    for (let i = 0; i < common_const_cfg.FIRST_RECHARGE.length; i++) {
        let gift = common_const_cfg.FIRST_RECHARGE[i];
        item_list.push({
            item_id: gift[0],
            item_num: gift[1]
        });
    }
    console.log(FUNC + 'item_list:', item_list);

    let req = {pool: mysqlPool, dao: myDao};
    BuzzUtil.putIntoPack(req, account, item_list, function(err, res) {
        let scene = common_log_const_cfg.FIRST_BUY;
        let hint = '首充领取';
        GameLog.addGameLog(item_list, account, scene, hint);
        account.first_buy_gift = 1;
        account.commit();
        cb(null, [account]);
    });
}


//==============================================================================
// private
//==============================================================================
// 玩家首充状态只能从false设置为true, 不能从true设置为false.
function _isStatusFalse(data, cb) {
    let first_buy_gift = data['first_buy_gift'];
    console.log("first_buy_gift: " + first_buy_gift);
    if (first_buy_gift == "false") {
        first_buy_gift = false;
    }
    return ErrorUtil.checkError(!first_buy_gift, "玩家的首充状态不能被设置为假", cb);
}

// 玩家没有充值不允许领取
function _isPlayerCharge(result_account, cb) {
    let rmb = result_account['rmb'];
    return ErrorUtil.checkError(rmb == 0, "玩家未充值不能领取首充大礼包", cb);
}

// 玩家已经领取了首充礼包则返回错误信息
function _isGiftGotten(result_account, cb) {
    let first_buy_gift_old = result_account['first_buy_gift'];
    return ErrorUtil.checkError(first_buy_gift_old, "玩家已经领取了首充大礼包，请勿重复领取", cb);
}
