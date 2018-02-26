const Facebook = require('./facebookUser');
const InnerUser = require('./innerUser');
const WanbaUser = require('./wanbaUser');
const EgretUser = require('./egretUser');
const GooglePlusUser = require('./googlePlusUser');

module.exports = {
    PLATFORM_TYPE: {
        TEST: 1000,
        EGRET: 1001,
        WANBA: 1002,
        FACEBOOK: 1003,
        GOOGLE: 1004,
        INNER: 1005,
    },

    PLATFORM_CONFIG: {
        1001: {
            Class:EgretUser,
            sdk:{
                host:'',
                appId: '90866',
                appSecret: 'wcCKDghgzbDqlPosikMnr',
                timeout: 5000
            }

        },
        1002: {
            Class:WanbaUser,
            sdk:{
                host:'http://openapi.tencentyun.com',
                appId: '1105938023',
                appSecret: 'b5U7V8gXW2XvGz7k',
                timeout: 5000,
                uri:{
                    get_info:'/v3/user/get_info',
                    buy_playzone_item:'/v3/user/buy_playzone_item',
                    is_login:'/v3/user/is_login',
                    get_app_friends:'/v3/relation/get_app_friends',
                }
            }

        },
        1003: {
            Class:Facebook,
            sdk:{
                url:'https://graph.facebook.com/v2.11',
                appId: '166435350758141',
                appSecret: 'c8b601148a0040f4fb1050a860bf8eb0',
                timeout: 5000
            }

        },
        1004:{
            Class:GooglePlusUser,
            sdk:{}
        },
        1005: {
            Class:InnerUser,
            sdk:{}
        }
    }
}