const events = require("events"),
    event = new events.EventEmitter();

const buzz_chat = require('./buzz_chat');
const REDIS_KEYS = require('../../../../database/consts').REDISKEY,
    CHANNEL = REDIS_KEYS.CH;
const feedback = require('../buzz/feedback');
const EVENT = require('../../../hall/src/buzz/cst/buzz_cst_event').EVENT;

let DEBUG = 0;
const TAG = "【RedisUtil】";


event.on(EVENT.REDIS, function(data) {
    const FUNC = TAG + "eventOn() --- ";

	if (DEBUG) logger.info(FUNC + EVENT.REDIS + '事件触发');
    handleChannelMessage(data);
});


//==========================================================
// exports
//==========================================================
exports.addListener = addListener;

//==========================================================
// implements
//==========================================================
/**
 * 添加事件处理器到RedisUtil中.
 */
function addListener() {
    _addListener(event);
    // Channel: Chat
    redisConnector.subCmd.subscribe(CHANNEL.WORLD_CHAT+":1");
    redisConnector.subCmd.subscribe(CHANNEL.WORLD_CHAT+":2");
    redisConnector.subCmd.subscribe(CHANNEL.PRIVATE_CHAT);
    //留言
    redisConnector.subCmd.subscribe(CHANNEL.FEEDBACK);
    redisConnector.subCmd.subscribe(CHANNEL.DEL_FEEDBACK);
    redisConnector.subCmd.subscribe(CHANNEL.LIKE_FEEDBACK);

}

function _addListener(emmiter) {
    redisConnector.subCmd.on('message', function (channel, message) {
        emmiter.emit(EVENT.REDIS, {
            channel: channel,
            message: message,
        });
    });
}

/**
 * 处理频道消息.
 */
function handleChannelMessage(data) {

    let channel = data.channel;
    let message = data.message;
    
    switch(channel) {

        //Channel: Chat
        case CHANNEL.WORLD_CHAT+":1":
        case CHANNEL.WORLD_CHAT+":2":
            buzz_chat.worldChat(channel,message);
            break;
        case CHANNEL.PRIVATE_CHAT:
            buzz_chat.privateChat(message);
            break;
        case CHANNEL.FEEDBACK:
            feedback.update(message);
            break;
        case CHANNEL.DEL_FEEDBACK:
            feedback.del(message);
            break;
        case CHANNEL.LIKE_FEEDBACK:
            feedback.like(message);
            break;
    }

}