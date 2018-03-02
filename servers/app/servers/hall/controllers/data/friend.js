/**
 * 好友系统
 * Created by zhenghang on 2017/9/9.
 */
var data_util = require('./data_util');
var buzz_friends = require('../../src/buzz/buzz_friends');
const logicResponse = require('../../../common/logicResponse');
var TAG = "【data/friend】";
var DEBUG = 0;

async function addFriend(data) {
    return new Promise(function (resolve, reject) {
        buzz_friends.addFriend({pool: global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('添加好友 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function delFriend(data) {
    return new Promise(function (resolve, reject) {
        buzz_friends.delFriend({pool: global.mysqlPool}, data, function (err, result) {
            if (err) {
                logger.error('删除好友 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

exports.addFriend = addFriend;
exports.delFriend = delFriend;