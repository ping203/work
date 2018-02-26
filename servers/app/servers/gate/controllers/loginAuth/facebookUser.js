const User = require('./user');
const https = require('https');

class FacebookUser extends User {
    constructor(config) {
        super();
        this._sdkConfig = config;
    }

    //curl -i -X GET "https://graph.facebook.com/v2.11/me?access_token=EAACEdEose0cBAMOgvBAea36GE8uoFHTilrSGRZCsKFSJmnleNaXZCF8lDIZCbGermB66zQO1XdoH2KNf3Vks3rCm9NwZA2jIchzhQKWVzJXZCMZAzFguepR2qzMqeunNtUrlS2G6KTSsZAuMXZAalgcWOBfMtoX3JuGyfnVX8dveIiCyZAmJ7tdanyUWMbkMhbL7mquKibKqLlwZDZD"
    loginStatus(data) {
        let self = this;

        return new Promise(function (resolve, reject) {
            https.get(`${self._sdkConfig.url}/me?access_token=${data.token}`, function (err, resp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        }.bind(this));
    }

    //curl -i -X GET \
    //"https://graph.facebook.com/v2.11/me?fields=id%2Cgender%2Cname%2Clocation%2Cpicture.type(normal)&access_token=EAACEdEose0cBAMOgvBAea36GE8uoFHTilrSGRZCsKFSJmnleNaXZCF8lDIZCbGermB66zQO1XdoH2KNf3Vks3rCm9NwZA2jIchzhQKWVzJXZCMZAzFguepR2qzMqeunNtUrlS2G6KTSsZAuMXZAalgcWOBfMtoX3JuGyfnVX8dveIiCyZAmJ7tdanyUWMbkMhbL7mquKibKqLlwZDZD"
    getUserInfo(data) {
        let ext = data.ext || {
            picture: {
                type: 'normal'
            }
        };
        let self = this;
        return new Promise(function (resolve, reject) {
            // https.get(`https://graph.facebook.com/${this._sdkConfig.version}/me?fields=id%2Cgender%2Cname%2Clocation%2Cpicture.type(normal)&access_token=${token}`, function (err, resp) {
            https.get(`${self._sdkConfig.url}/me?fields=id,gender,name,location,picture.type(${ext.picture.type})&access_token=${data.token}`, function (err, resp) {
                if (err) {
                    reject(err);
                } else {
                    let info = null;
                    if (resp) {
                        info = {};
                        info.nickname = resp.name;
                        info.sex = 'male' == resp.gender ? 0 : 1;
                        info.city = resp.location && resp.location.name || 'secret';
                        info.figure_url = resp.picture.data.url;
                        info.openid = resp.id;
                    }
                    resolve(info);
                }
            });
        });
    }
    // curl -i -X GET \
    // "https://graph.facebook.com/v2.11/me?fields=friends.limit(10)%7Bid%2Cgender%2Cname%2Cpicture.type(normal)%7D&access_token=EAACEdEose0cBAMOgvBAea36GE8uoFHTilrSGRZCsKFSJmnleNaXZCF8lDIZCbGermB66zQO1XdoH2KNf3Vks3rCm9NwZA2jIchzhQKWVzJXZCMZAzFguepR2qzMqeunNtUrlS2G6KTSsZAuMXZAalgcWOBfMtoX3JuGyfnVX8dveIiCyZAmJ7tdanyUWMbkMhbL7mquKibKqLlwZDZD"
    /**
     * 获取朋友列表
     * @param token
     */
    getFriends(token, ext) {
        ext = ext || {
            picture: {
                type: 'normal'
            }
        };
        let self = this;
        return new Promise(function (resolve, reject) {
            //https.get(`https://graph.facebook.com/${this._sdkConfig.version}/me?fields=friends.limit(10)%7Bid%2Cgender%2Cname%2Cpicture.type(normal)%7D&access_token=${data.token}`, function (err, resp) {
            https.get(`${self._sdkConfig.url}/me?fields=friends.limit(10){id,gender,name,picture.type(${ext.picture.type})}&access_token=${token}`, function (err, resp) {
                if (err) {
                    reject(err);
                } else {
                    let info = {};
                    resolve(info);
                }
            });
        });
    }
}

module.exports = FacebookUser;