const Global = require('../../src/buzz/pojo/Global');
const logicResponse = require('../../../common/logicResponse');

exports.water = water;

/**
 * 获取服务器周期.
 */
async function water(data) {
    return logicResponse.ask(Global.getDataWater());
}
