/**
 * Created by Administrator on 2017/4/15.
 */

var omelo = require('omelo');


class PlayerFilter{
    constructor(){
    }

    before(msg, session, next){
        if(msg.__route__.indexOf('c_enter_room') == -1 && msg.__route__.indexOf('c_login') == -1){
            let scene = omelo.app.game.getScene(session.get('sceneId'));
            if(!scene){
                next(CONSTS.SYS_CODE.PALYER_NOT_IN_SCENE, {});
                return;
            }
            msg.scene = scene;
            next();
        }
        else{
            next();
        }
    }

    after(err, msg, session, resp, next){
        next();
    }

}

module.exports = new PlayerFilter();