logger.error('----changeSync load dbClient');
const redisClient = require('../../utils/dbclients').redisClient;
const redisKey = require('../../database').dbConsts.REDISKEY;
const EventEmitter = require('events').EventEmitter;
const eventType = require('../../consts/eventType');
const omelo = require('omelo');

class ChangeSync extends EventEmitter{
    constructor(){
        super();
    }

    start(){
        redisClient.sub(redisKey.DATA_EVENT_SYNC.PLATFORM_CATCHRATE, this.platform_catchrate.bind(this));
        redisClient.sub(redisKey.DATA_EVENT_SYNC.PLAYER_CATCH_RATE, this.player_catchrate.bind(this));
        redisClient.sub(redisKey.DATA_EVENT_SYNC.PLAYER_GAIN_LOSS_LIMIT, this.player_gain_loss_limit.bind(this));
        redisClient.sub(redisKey.DATA_EVENT_SYNC.CASH_RECHAREGE_PERCET, this.cash_recharege_percet.bind(this));
    }

    platform_catchrate(value){
        this.pub_value(redisKey.PLATFORM_DATA.PLATFORM_CATCHRATE, value);
    }

    player_catchrate(value){
        this.pub_value(redisKey.PLAYER_CATCH_RATE, value);
    }

    player_gain_loss_limit(value){
        this.pub_value(redisKey.GAIN_LOSS_LIMIT, value);
    }

    cash_recharege_percet(percet) {
        logger.debug('------------????????????:', percet);
       if (Number.isNaN(percet.value) || (percet.value > 1 || percet.value < 0)) {
           logger.warn('????????????', percet.value);
       } else {
            this.pub_value(redisKey.CASH_RECHAREGE_PERCET, percet.value);
       }
   }

    pub_value(type, value){
        this.emit(eventType.PLATFORM_DATA_CHANGE, type, value);
    }
}

module.exports = new ChangeSync();