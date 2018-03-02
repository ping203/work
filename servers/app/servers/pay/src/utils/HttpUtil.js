// var serviceConfig = require("../../../config").serviceConfig;

var DEBUG = 0;
var ERROR = 1;
var TAG = "【HttpUtils】";

exports.post = post;
exports.postBalance = postBalance;
exports.handleReturn = handleReturn;

/**
 * 通用post方法.
 */
function post(api, host, port, data, cb) {
    console.log('data:', data);

    data = require('querystring').stringify({
        data:JSON.stringify(data),
        aes:false
    });

    if (DEBUG) console.log("api:", api);
    if (DEBUG) console.log("data:", data);

    // 调用api
    var options = {
        hostname: host,
        port: port,
        path: api,
        method: 'POST',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": data.length
        }
    };
    
    var http = require('http');
    var req = http.request(options, function (res) {
        var responseString = "";
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            responseString += chunk;
        });
        res.on('end', function () {
            if (cb != null) cb(responseString);
        });
    });
    req.on('error', function (e) {
        if (ERROR) console.error('problem with request:', e);
        if (ERROR) console.error('api:', api);
        if (ERROR) console.error('host:', host);
        if (ERROR) console.error('port:', port);
        cb(e);
    });
    req.write(data + "\n");
    req.end();
}


/**
 * 通用post方法.
 */
function postHttps(api, host, port, data, cb) {
    console.log('data:', data);

    data = require('querystring').stringify({
        data:JSON.stringify(data),
        aes:false
    });

    if (DEBUG) console.log("api:", api);
    if (DEBUG) console.log("data:", data);

    // 调用api
    var options = {
        hostname: host,
        port: port,
        path: api,
        method: 'POST',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": data.length
        }
    };
    
    var https = require('https');
    var req = https.request(options, function (res) {
        var responseString = "";
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            responseString += chunk;
        });
        res.on('end', function () {
            if (cb != null) cb(responseString);
        });
    });
    req.on('error', function (e) {
        if (ERROR) console.error('problem with request:', e);
        if (ERROR) console.error('api:', api);
        if (ERROR) console.error('host:', host);
        if (ERROR) console.error('port:', port);
        cb(e);
    });
    req.write(data + "\n");
    req.end();
}

/**
 * 向负载服发起http.post请求
 * TODO: 过时
 */
function postBalance(api, data, cb) {
    // var host = serviceConfig.GATE.address;
    // if (serviceConfig.GATE.https_enable) {
    //     var port = serviceConfig.GATE.https_port;
    //     postHttps(api, host, port, data, cb);
    // }
    // else {
    //     var port = serviceConfig.GATE.port;
    //     post(api, host, port, data, cb);
    // }
}

/**
 * 处理返回值的通用方法.
 */
function handleReturn(ret, cb) {
    const FUNC = TAG + "handleReturn() --- ";
    if (DEBUG) console.log(FUNC + "ret:", ret);
    try {
        ret = JSON.parse(ret);
        if (ret.err) {
            if (ERROR) console.error(FUNC + "err:", ret.err);
            cb(ret.err);
        }
        else {
            if (DEBUG) console.log(FUNC + "data:", ret.data);
            cb(null, ret.data);
        }
    }
    catch(err) {
        cb(err);
    }
}