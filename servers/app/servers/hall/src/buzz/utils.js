//==============================================================================
// import
//==============================================================================
var crypto = require('crypto');


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
exports.createSalt = createSalt;
exports.encodePassword = encodePassword;
exports.generateSessionToken = generateSessionToken;
exports.generateRandomKey = generateRandomKey;
exports.generateCdKeyList = generateCdKeyList;
exports.generateCdKey = generateCdKey;
exports.randomInt = randomInt;
exports.randomNum = randomNum;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
function createSalt() {
    return crypto.randomBytes(24).toString('hex');
}

function encodePassword(salt, password) {
    var sha = crypto.createHash('sha512');
    sha.update(salt);
    sha.update(password);

    var hv = sha.digest();
    var i;
    for (i = 0; i < 512; i++) {
        sha = crypto.createHash('sha512');
        sha.update(hv);
        hv = sha.digest();
    }

    return hv.toString('base64');
}

function generateSessionToken(userId) {
    return userId + '_' + crypto.randomBytes(24).toString('hex');
}

function generateRandomKey() {
    var str="", i=0, min=33, max=126;
    for(;i++<16;){
        var r = Math.random()*(max-min)+min <<0;
        // exclude ', ", \, /
        if (r == 34 || r == 39 || r == 47 || r == 92) {
            --i;
            continue;
        }
        str += String.fromCharCode(r);
    }
    return str;
}

/**
 * 锟斤拷锟斤拷一系锟叫的兑伙拷锟斤拷
 * @param num 锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟斤拷锟侥革拷锟斤拷
 */
function generateCdKeyList(prefix, num) {
    var ret = [];
    for (var i = 0; i < num; i++) {
        ret.push(prefix + generateCdKey());
    }
    return ret;
}

/**
 * 锟斤拷锟斤拷锟斤拷锟斤拷锟筋动锟斤拷(锟斤拷支锟街达拷小写锟斤拷母锟斤拷锟斤拷锟斤拷)
 */
function generateCdKey() {
    var str = "";
    for (var i = 0; i < 8; i++) {
        var charOrNum = randomInt(2) % 2 == 0 ? "char" : "num";
        var r = 0;
        //锟斤拷锟斤拷锟斤拷母锟斤拷锟斤拷锟斤拷锟斤拷  
        if ("char" == charOrNum) {
            //锟斤拷锟斤拷锟角达拷写锟斤拷母锟斤拷锟斤拷小写锟斤拷母  
            var temp = randomInt(2) % 2 == 0 ? 65 : 97;
            // 全锟斤拷写
            var temp = 65;
            r = randomInt(26) + temp;
        } else if ("num" == charOrNum) {
            r = randomInt(10) + 48;
        } 

        str += String.fromCharCode(r);
    }
    return str;
}

function randomInt(maxNum) {
    return Math.floor(Math.random() * maxNum);
}

function randomNum(minNum,maxNum) {
    return parseInt(Math.random() * (maxNum-minNum+1)+minNum,10);
} 