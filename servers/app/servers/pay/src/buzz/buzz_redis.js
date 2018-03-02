const events = require("events"),
    event = new events.EventEmitter();
const RedisUtil = require('../utils/RedisUtil');
const buzz_cst_game = require('./cst/buzz_cst_game');
const buzz_mail = require('./buzz_mail');
const redisKeys = require('../../../database/consts').REDISKEY;
const EVENT = require('./cst/buzz_cst_event').EVENT;

event.on(EVENT.REDIS, function(data) {
    handleChannelMessage(data);
});

exports.addListener = addListener;

/**
 * 添加事件处理器到RedisUtil中.
 */
function addListener() {
    RedisUtil.addListener(event);

    // Channel: Broadcast
    RedisUtil.subscribe(redisKeys.CH.BROADCAST_SERVER);
    RedisUtil.subscribe(redisKeys.CH.BROADCAST_GAME_EVENT);
    RedisUtil.subscribe(redisKeys.CH.BROADCAST_FAMOUS_ONLINE);
    RedisUtil.subscribe(redisKeys.CH.BROADCAST_DRAW);
    RedisUtil.subscribe(redisKeys.CH.BROADCAST_REWARD_PEOPLE);

    // Channel: Mail
    RedisUtil.subscribe(redisKeys.CH.MAIL_SEND);
    RedisUtil.subscribe(redisKeys.CH.MAIL_RANK);
    RedisUtil.subscribe(redisKeys.CH.MAIL_RELOAD);
}

/**
 * 处理频道消息.
 */
function handleChannelMessage(data) {
    let channel = data.channel;
    let message = data.message;
    
    switch(channel) {
        // Channel: Broadcast
        case redisKeys.CH.BROADCAST_SERVER:
        case redisKeys.CH.BROADCAST_GAME_EVENT:
        case redisKeys.CH.BROADCAST_FAMOUS_ONLINE:
        case redisKeys.CH.BROADCAST_DRAW:
        case redisKeys.CH.BROADCAST_REWARD_PEOPLE:
            buzz_cst_game.redisNotifyBroadcast(channel, message);
        break;

        // Channel: Mail
        case redisKeys.CH.MAIL_SEND:
        case redisKeys.CH.MAIL_RANK:
            buzz_mail.redisNotifyMail(channel, message);
        break;
        case redisKeys.CH.MAIL_RELOAD:
            buzz_mail.reloadMail(mysqlConnector, channel, message);
        break;

    }
}