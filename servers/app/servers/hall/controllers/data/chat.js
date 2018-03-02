/**
 * 聊天
 * Created by zhenghang on 2017/9/15.
 */
var data_util = require('./data_util');
var buzz_chat = require('../../src/buzz/buzz_chat');
const logicResponse = require('../../../common/logicResponse');
var TAG = "【data/chat】";
var DEBUG = 0;

async function getChat(data) {
    return new Promise(function(resolve, reject){
        buzz_chat.getChat(data, function (err, result) {
            if(err){
                logger.error('获取聊天 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function sendChat(data) {
    return new Promise(function(resolve, reject){
        buzz_chat.sendChat({pool:global.mysqlPool}, data, function (err, result) {
            if(err){
                logger.error('发送消息 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function userInfo(data) {
    return new Promise(function(resolve, reject){
        buzz_chat.userInfo({pool:global.mysqlPool}, data, function (err, result) {
            if(err){
                logger.error('用户信息 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function forbid_player_world(data) {
    return new Promise(function(resolve, reject){
        buzz_chat.forbid_player_world({pool:global.mysqlPool}, data, function (err, result) {
            if(err){
                logger.error('禁言 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

async function unforbid_player_world(data) {
    return new Promise(function(resolve, reject){
        buzz_chat.unforbid_player_world({pool:global.mysqlPool}, data, function (err, result) {
            if(err){
                logger.error('解除禁言 err:', err);
                reject(err);
            }
            resolve(logicResponse.ask(result));
        });
    });
}

exports.getChat = getChat;
exports.sendChat = sendChat;
exports.userInfo = userInfo;
exports.forbid_player_world = forbid_player_world;
exports.unforbid_player_world = unforbid_player_world;