const dao_feedback = require('../dao/dao_feedback');
const redisAccountSync = require('../../../../utils/redisAccountSync');
const REDISKEY = require('../../../../database/consts').REDISKEY;
const logger = loggerEx(__filename);
const LEN = 100;

class Feedback {
    constructor() {
        this._data = [];
    }

    async init() {
        try {
            let datas = await dao_feedback.loadAll();
            //id,uid,text,time,like_uids,like_count
            for (let i = 0; i < datas.length; i++) {
                let data = datas[i];
                let like_uids = JSON.parse(data.like_uids);
                let uid = data.uid;
                let time = new Date(data.time).getTime();
                let account = await redisAccountSync.getAccountAsync(uid, ['nickname', 'figure_url']);
                if (!account) continue;
                this._data.push({
                    mid: data.id,
                    uid: uid,
                    text: data.text,
                    time: time,
                    like_uids: like_uids,
                    like_count: data.like_count,
                    username: account.nickname,
                    figure: account.figure_url
                });
            }
        } catch (err) {
            logger.error(err);
        }
    }

    async insertMsg(uid, text, cb) {
        try {
            let time = new Date().getTime();
            let mid = await dao_feedback.insertMsg(uid, text);
            let account = await redisAccountSync.getAccountAsync(uid, ['nickname', 'figure_url']);
            if (!account) {
                cb({code: 123123, msg: "no data"});
                return;
            }
            let msg = {
                mid: mid,
                uid: uid,
                text: text,
                time: time,
                like_uids: [],
                like_count: 0,
                username: account.nickname,
                figure: account.figure_url
            };
            redisConnector.pubCmd.publish(REDISKEY.CH.FEEDBACK, JSON.stringify(msg));
            msg.is_me_like = false;
            cb(null, msg);
        } catch (err) {
            logger.error(err);
            cb(err);
        }
    }

    delMsg(mid) {
        redisConnector.pubCmd.publish(REDISKEY.CH.DEL_FEEDBACK, mid);
        dao_feedback.del(mid);
    }

    likeMsg(mid, uid) {
        let ret = {
            like_count: 0,
            success: false,
        };
        for (let i = 0; i < this._data.length; i++) {
            let data = this._data[i];
            let like_uids = data.like_uids;
            if (data.mid === mid && !like_uids.includes(uid)) {
                redisConnector.pubCmd.publish(REDISKEY.CH.LIKE_FEEDBACK, JSON.stringify({mid: mid, uid: uid}));
                dao_feedback.update(mid, data.like_uids, uid, data.like_count + 1);
                ret.like_count = data.like_count + 1;
                ret.success = true;
            }
        }
        return ret;
    }

    update(msg) {
        this._data.push(JSON.parse(msg));
        if (this._data.length > LEN) {
            this._data.shift();
        }
    }

    del(mid) {
        for (let i = 0; i < this._data.length; i++) {
            if (this._data[i].mid === mid) {
                this._data.splice(i, 1);
            }
        }
    }

    like(msg) {
        let m = JSON.parse(msg);
        let mid = m.mid;
        let uid = m.uid;
        for (let i = 0; i < this._data.length; i++) {
            let data = this._data[i];
            let like_uids = data.like_uids;
            if (data.mid === mid && !like_uids.includes(uid)) {
                data.like_uids = [...data.like_uids, uid];
                data.like_count++;
            }
        }
    }

    async getMsg(request_uid, timestamp, count, need_hot4, cb) {
        try {
            let msg = [];
            for (let i = this._data.length - 1; i >= 0; i--) {
                let data = this._data[i];
                if (data.time < timestamp) {
                    data.is_me_like = data.like_uids.includes(request_uid);
                    msg.push(data);
                }
                if (msg.length >= count) {
                    break;
                }
            }
            let hot4 = [];
            if (need_hot4) {
                let datas = await dao_feedback.loadAll();
                for (let i = 0; i < datas.length; i++) {
                    let data = datas[i];
                    let like_uids = JSON.parse(data.like_uids);
                    let uid = data.uid;
                    let time = new Date(data.time).getTime();
                    let account = await redisAccountSync.getAccountAsync(uid, ['nickname', 'figure_url']);
                    if (!account) continue;
                    hot4.push({
                        mid: data.id,
                        uid: uid,
                        text: data.text,
                        time: time,
                        like_uids: like_uids,
                        like_count: data.like_count,
                        username: account.nickname,
                        figure: account.figure_url
                    });
                }
            }

            cb(null, {
                server_time: new Date().getTime(),
                msg_list: msg,
                hot4: hot4,
            });
        } catch (err) {
            logger.error(err);
            cb(err);
        }
    }
}

module.exports = new Feedback();