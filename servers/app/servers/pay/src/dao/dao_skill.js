﻿const StringUtil = require('../utils/StringUtil');
const ObjUtil = require('../buzz/ObjUtil');
const CstError = require('../buzz/cst/buzz_cst_error');
const AccountCommon = require('./account/common');
const ITEM_CFG = require('../../../../utils/imports').GAME_CFGS.item_item_cfg;
const CacheSkill = require('../buzz/cache/CacheSkill');
const ERROR_OBJ = CstError.ERROR_OBJ;

const ITEM_SKILL = 3;

var DEBUG = 0;
var ERROR = 1;

const TAG = "【dao_skill】";


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.write = write;
exports.addSkillLog = addSkillLog;
exports.addSkillLogEx = addSkillLogEx;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------

/**
 * 批量插入连接日志.
 */
function write(pool, cb) {
    const FUNC = TAG + "write() --- ";
    //----------------------------------

    var skill_list = CacheSkill.cache();
    _sumSkillInCache(pool, skill_list, function(err, result) {
        if (skill_list.length > 0) {
            _didWrite(pool, skill_list, cb);
        }
        else {
            cb(null, FUNC + "没有可以插入的数据");
        }
    });

}


/**
 * 增加技能记录(在一段时间内获取或使用的某种技能的数量)
 */
function addSkillLogEx(account, data, cb) {

    if (!_prepare(data, cb)) {
        return;
    }
    var nickname = (account.nickname != null);

    _didAddSkillLog(mysqlPool, data, cb, account, nickname);
}


/**
 * 增加技能记录(在一段时间内获取或使用的某种技能的数量)
 */
function addSkillLog(pool, data, cb) {
    
    if (!_prepare(data, cb)) {
        return;
    }
    var token = data['token'];

    AccountCommon.getAccountByToken(pool, token, function (err1, results1) {
        if (err1) {
            logger.info("err1：", err1);
            var extraErrInfo = {debug_info: "dao_skill.addSkillLog()-使用token查询玩家账户", err_obj: err1};
            logger.error(extraErrInfo.debug_info);
            cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.DB_ERR));
            return;
        }
        if (results1.length == 0) {
            logger.error('-----------------------------------------------------');
            logger.error('TOKEN_INVALID: dao_skill.addSkillLog()');
            logger.error('-----------------------------------------------------');
            cb(CstError.ERROR_OBJ.TOKEN_INVALID);
            return;
        }
        var account_result = results1[0];
        var nickname = (account_result.nickname != null);
        
        _didAddSkillLog(pool, data, cb, account_result, nickname);
    });
}


//==============================================================================
// private
//==============================================================================

function _didWrite(pool, skill_list, cb) {
    const FUNC = TAG + "_didWrite() --- ";
    DEBUG = 0;
    //----------------------------------
    // yPEND: 增加字段comment
    // ALTER TABLE tbl_skill_log ADD `comment` varchar(100) NOT NULL DEFAULT '无' COMMENT '技能使用注释';
    var count = skill_list.length;
    var sql = "";
    sql += "INSERT `tbl_skill_log` ";
    sql += '(`account_id`,`skill_id`,`gain`,`cost`,`total`,`log_at`,`nickname`,`comment`) ';
    sql += 'VALUES ';
    for (var i = 0; i < count; i++) {
        if (i > 0) sql += ',';
        sql += '(?,?,?,?,?,?,?,?)';
    }

    var sql_data = [];
    for (var i = 0; i < count; i++) {
        var one_link = skill_list.shift();
        sql_data.push(one_link.account_id);
        sql_data.push(one_link.skill_id);
        sql_data.push(one_link.gain);
        sql_data.push(one_link.cost);
        sql_data.push(one_link.total);
        sql_data.push(new Date(one_link.log_at));
        sql_data.push(one_link.nickname);
        sql_data.push(one_link.comment || '无');
    }

    if (DEBUG) logger.info(FUNC + 'sql:\n', sql);
    if (DEBUG) logger.info(FUNC + 'sql_data:\n', sql_data);
    
    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) logger.error(FUNC + "err:\n", err);
            if (ERROR) logger.error(FUNC + 'sql:\n', sql);
            if (ERROR) logger.error(FUNC + 'sql_data:\n', sql_data);
        } else {
            if (DEBUG) logger.info(FUNC + 'result: ', result);
        }
        cb(err, result);
        DEBUG = 0;
    });
}

function _sumSkillInCache(pool, skill_list, cb) {
    cb(null, null);
}

/**
 * 增加技能数据log的准备工作, 准备好了返回true, 出现任何问题返回false.
 */
function _prepare(data, cb) {
    var token = data['token'];
    var skill_data = data['skill_data'];
    
    if (!_isParamExist(token, "接口调用请传参数token", cb)) return false;
    if (!_isParamExist(skill_data, "接口调用请传参数skill_data(玩家技能数据)", cb)) return false;
    
    if (typeof skill_data == "string") {
        try {
            skill_data = JSON.parse(skill_data);
        } catch (e) {
            cb(e);
            return false;
        }
    }
    
    if (skill_data.length == 0) {
        logger.info("更新的技能数据为空，数据库无需做出修改");
        cb(null, "更新的技能数据为空，数据库无需做出修改");
        return false;
    }
    return true;
}

/**
 * 检测客户端传入的参数, 如果参数不存在，返回false, 如果通过检测, 返回true.
 * @param param 待检测的参数.
 * @param err_info 如果检测失败，回调需要传回的信息.
 */
function _isParamExist(param, err_info, cb) {
    if (param == null) {
        logger.error(err_info);
        var extraErrInfo = { debug_info: "dao_skill.addSkillLog()-" + err_info };
        cb && cb(ObjUtil.merge(extraErrInfo, ERROR_OBJ.PARAM_MISSING));
        return false;
    }
    return true;
}

// 验证后加入一条log
function _didAddSkillLog(pool, data, cb, account, nickname) {
    const FUNC = TAG + "_didAddSkillLog() --- ";

    let account_skill = account.skill;
    var account_id = data['account_id'];
    var skill_data = data['skill_data'];

    if (DEBUG) logger.info(FUNC + "skill_data: ", skill_data);
    if (typeof skill_data == "string") {
        try {
            skill_data = JSON.parse(skill_data);
        } catch (e) {
            cb(e);
            return;
        }
    }

    if (skill_data.length == 0) {
        if (ERROR) logger.error(FUNC + '插入的技能日志为0条, 不做数据库操作');
        cb(new Error('插入的技能日志为0条, 不做数据库操作'));
        return;
    }

    // 临时处理

    var sql = '';
    sql += 'INSERT INTO `tbl_skill_log` ';
    sql += '(`account_id`,`skill_id`,`gain`,`cost`,`total`,`nickname`) ';
    sql += 'VALUES';
    sql += ' (?,?,?,?,?,?)';
    if (skill_data.length > 1) {
        for (var i = 0; i < skill_data.length - 1; i++) {
            sql += ', (?,?,?,?,?,?)';
        }
    }
    
    var sql_data = [];
    for (var i = 0; i < skill_data.length; i++) {
        var skill_obj = skill_data[i];
        sql_data.push(account_id);
        sql_data.push(skill_obj.id);
        sql_data.push(skill_obj.gain);
        sql_data.push(skill_obj.cost);
        sql_data.push(skill_obj.total);
        sql_data.push(nickname);
    }

    if (DEBUG) logger.info(FUNC + 'sql:\n', sql);
    if (DEBUG) logger.info(FUNC + 'sql_data:\n', sql_data);

    if (sql_data.length == 0) {
        if (ERROR) logger.error(FUNC + '---插入的技能日志为0条, 不做数据库操作');
        cb(new Error('插入的技能日志为0条, 不做数据库操作'));
        return;
    }

    pool.query(sql, sql_data, function (err, result) {
        if (err) {
            if (ERROR) logger.error(FUNC + "err:", err);
            if (ERROR) logger.error(FUNC + 'sql:\n', sql);
            if (ERROR) logger.error(FUNC + 'sql_data:\n', sql_data);
            cb(err);
        } else {
             if (DEBUG) logger.info(FUNC + 'result:\n', result);
            _updateSkillField(pool, data, account, cb, account_skill);
        }
    });
}

// 更新tbl_account表中的skill字段
function _updateSkillField(pool, data, account, cb, account_skill) {
    const FUNC = TAG + "_updateSkillField() --- ";

    if (DEBUG) console.info(FUNC + "CALL...");

    var uid = data['account_id'];
    var skill_data = data['skill_data'];
    
    //if (typeof skill_data == "string") {
    if (StringUtil.isString(skill_data)) {
        try {
            skill_data = JSON.parse(skill_data);
        } catch (e) {
            if (ERROR) logger.error(FUNC + "parse error(1):\n", e);
            cb(e);
            return;
        }
    }

    //校验售出道具时的合法性
    let failOperation = function () {
        logger.info('account.skill = 售卖技能失败');
        let ret1= {
            pearl: account.pearl,
            skill: account.skill,
            package: account.package,
        };
        cb(null, [ret1]);
    };
    if (!skill_data || skill_data.length === 0) {
        return failOperation();
    }
    var firstItem = skill_data[0];
    if (!firstItem) {
        return failOperation();
    } 
    if (!account.skill) {
        return failOperation();
    }
    let ownC = account.skill[firstItem.id] || 0;
    if (firstItem.sell) {
       if (firstItem.cost < 0 || ownC < firstItem.cost || firstItem.gain > 0 || Math.abs(firstItem.total - ownC) != firstItem.cost) {
            return failOperation();
        }
    }else{
        if (firstItem.gain < 0 || firstItem.cost > 0 || Math.abs(firstItem.total - ownC) != firstItem.gain) {
            return failOperation();
        }
    }
    var ret = {};
    if (account_skill == null) {
        if (DEBUG) logger.info(FUNC + 'account_skill == null');
        for (var i = 0; i < skill_data.length; i++) {
            var key = '' + skill_data[i].id;
            var value = skill_data[i].total;
            ret[key] = value;
        }
    }
    else {
        if (DEBUG) logger.info(FUNC + 'account_skill != null');
        try {
            if (StringUtil.isString(account_skill)) {
                if (DEBUG) logger.info(FUNC + "account_skill是一个字符串");
                ret = JSON.parse(account_skill);
            }
            else {
                if (DEBUG) logger.info(FUNC + "account_skill不是一个字符串");
                ret = account_skill;
            }
            //ret = JSON.parse(account_skill);
        } catch (e) {
            if (ERROR) logger.error(FUNC + "错误的玩家技能字符串---account_skill", account_skill);// BUG
            if (ERROR) logger.error(FUNC + "_updateSkillField()----parse error(2):\n", e);// BUG
            cb(e);
            return;
        }
        for (var i = 0; i < skill_data.length; i++) {
            var key = '' + skill_data[i].id;
            var value = skill_data[i].total;
            if (ret[key] == null) {
                var new_key = '' + skill_data[i].id;
                ret[new_key] = value;
            }
            else {
                ret[key] = value;
            }
        }
    }
    
    var firstItem = skill_data[0];
    var isSell = firstItem['sell'];
    var goldAdd = 0;
    // 处理卖出技能的逻辑
    if (isSell) {
        var sellItemId = firstItem['id'];
        var sellItemNum = firstItem['cost'];
        goldAdd = sellItemNum * _getItemSellPrice(sellItemId);
    }
    
    //--------------------------------------------------------------------------
    // 更新缓存中数据(重要:数据库操作将会被删除)
    //--------------------------------------------------------------------------

    account.skill = ret;
    account.gold = goldAdd;
    account.commit();

    var ret1= {
        gold: account.gold,
        skill: account.skill,
        package: account.package,
    };
    cb(null, [ret1]);
}

function _getItemSellPrice(skillId) {
    var sellPrice = 0;
    for (var itemId in ITEM_CFG) {
        var itemInfo = ITEM_CFG[itemId];
        if (itemInfo.type == ITEM_SKILL && itemInfo.id == skillId) {
            sellPrice = itemInfo.saleprice;
        }
    }
    return sellPrice;
}