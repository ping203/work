const https = require('https');
const User = require('./user');

class GooglePlusUser extends User {
  constructor() {
    super();
    this._baseInfo_url = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
  }

  getUserInfo(data) {
    console.log('----GooglePlusUser', data);
    return new Promise(function (resolve, reject) {
      https.get(`${this._baseInfo_url}?id_token=` + data.sdkAuthResponse.id_token, (res) => {
        console.log('状态码：', res.statusCode);
        console.log('请求头：', res.headers);
        res.on('data', (d) => {
          try {
            let sdk_user_info = JSON.parse(d.toString());
            console.log('----GooglePlusUser sdk_user_info', sdk_user_info);
            let info = {};
            if (sdk_user_info) {
              info.nickname = sdk_user_info.name;
              info.sex = 'male' == sdk_user_info.gender ? 1 : 0;
              info.city = sdk_user_info.locale || 'secret';
              info.figure_url = sdk_user_info.picture;
              info.openid = sdk_user_info.sub;
              resolve(info);
            } else {
              console.error('----------------------sdk_user_info is empty');
              reject('sdk_user_info is empty');
            }
          } catch (err) {
            reject(err);
          }
        });

      }).on('error', (err) => {
        reject(err);
      });
    }.bind(this));

  }

}
module.exports = GooglePlusUser;