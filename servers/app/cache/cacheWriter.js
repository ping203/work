const cache = require('./cache');
const redisKey = require('../database').dbConsts.REDISKEY;
const redisClient = require('../utils/dbclients').redisClient;

class CacheWriter{
    constructor(){
        this._data = new Map();
    }
}

module.exports = new CacheWriter();