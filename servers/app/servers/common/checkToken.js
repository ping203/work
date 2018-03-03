const redisAccountSync = require('../../utils/redisAccountSync');
const ACCOUNTKEY = require('../../database/consts').ACCOUNTKEY;
const ERROR_OBJ = require('../../consts/error').ERROR_OBJ;

module.exports = async function (uid, token) {
    let account = await redisAccountSync.getAccountAsync(uid, [ACCOUNTKEY.TOKEN]);
    if (account.token == "daily_reset") {
        throw ERROR_OBJ.DAILY_RESET;
    }else if (account.token.search('cheat') >= 0) {
        throw ERROR_OBJ.PLAYER_CHEAT;
    } 
    else if (account.token != token) {
        throw ERROR_OBJ.TOKEN_INVALID;
    } 
};