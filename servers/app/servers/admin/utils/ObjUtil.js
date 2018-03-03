const crypto = require('crypto');
const ERROR_OBJ = require('../../../consts/error').ERROR_OBJ;
const API_CFGs = require('../configs/api');
const mysqlClient = require('../../../utils/database').mysqlClient;

exports.isUndefined = isUndefined;
exports.checkFields = checkFields;
exports.routes = routes;
exports.query = query;
exports.encodePwd = encodePwd;

function isUndefined(data, fields) {
    logger.info('params:', fields);
    logger.info('data:', data);
    for (let i = 0; i < fields.length; i++) {
        if (undefined == data[fields[i]]) {
            logger.error('undefined param:', data[fields[i]]);
            return true;
        }
    }
    return false;
}

function checkFields(data, api) {
    logger.info('api:', api);
    const API_PARAMS = API_CFGs[api].params;
    if (isUndefined(data, API_PARAMS)) {
        throw ERROR_OBJ.PARAM_MISSING;
    }
}

function routes(setRoute) {
    for (let api in API_CFGs) {
		let route = '/' + api;
		let method = api;
		let menu = API_CFGs[api].menu;

		// logger.info('route:', route);
		// logger.info('method:', method);
		// logger.info('menu:', menu);
		setRoute(route, menu, method);
	}
}

async function query(sql, fields) {
    return new Promise(function (resolve, reject) {
        mysqlClient.query(sql, fields, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function encodePwd(salt, pwd) {
    let sha = crypto.createHash('sha512');
    sha.update(salt);
    sha.update(pwd);

    let hv = sha.digest();
    let i;
    for (i = 0; i < 512; i++) {
        sha = crypto.createHash('sha512');
        sha.update(hv);
        hv = sha.digest();
    }

    return hv.toString('base64');
}