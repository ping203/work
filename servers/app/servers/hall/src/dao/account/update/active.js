const _ = require('underscore');
const CacheAccount = require('../../../buzz/cache/CacheAccount');

const active_activequest_cfg = require('../../../../../../utils/imports').GAME_CFGS.active_activequest_cfg;
const RedisUtil = require('../../../utils/RedisUtil');
function keys() {
    let a = {};
    for (let idx in active_activequest_cfg) {
        let condition = active_activequest_cfg[idx].condition;
        let value1 = active_activequest_cfg[idx].value1;
        a[condition] = {};
        a[condition][value1] = 0;
    }
    return a;
}
const temp_keys = keys();
const prefix = "activity:";

exports.update = _update;

function _update(pool, data, cb, my_account) {
    CacheAccount.getAccountById(my_account.id, async function (err, account_in_cache) {
        if (account_in_cache) {
            //更新dfc
            let active = account_in_cache.active;
            for (let condition in temp_keys) {
                for (let value1 in temp_keys[condition]) {
                    try {
                        let newVar = await hgetFromRedis(prefix + condition + "_" + value1, account_in_cache.id);
                        if (!newVar) {
                            continue;
                        }
                        if (!active[condition]) {
                            active[condition] = {};
                        }
                        active[condition][value1] = newVar;
                    } catch (err) {
                        cb(err);
                    }
                }
            }
            account_in_cache.active = active;
            account_in_cache.commit();
            cb(null, active);
        }
    });
}

function hgetFromRedis(key, id) {
    return new Promise(function (resolve, reject) {
        RedisUtil.hget(key, id, function (err, res) {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        })
    })
}