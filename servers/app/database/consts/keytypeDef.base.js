/**
 * 玩家信息字段及默认值，以下数据从数据库导出所得
 * TODO: 表过于臃肿，待拆分:女神数据，凡是单个字段
 */

const player_users_cfg = require('../../../config/data').GAME_CFGS.player_users_cfg;

module.exports.AccountDef = {
    "id": {
        "def": 0,
        "type": "number"
    },
    "jointype": {
        "def": 0,
        "type": "number"
    },
    "who_invite_me": {
        "def": 0,
        "type": "number"
    },
    "who_share_me": {
        "def": 0,
        "type": "number"
    },
    "nickname": {
        "def": null,
        "type": "string"
    },
    "password": {
        "def": null,
        "type": "string"
    },
    "pwd_history": {
        "def": null,
        "type": "string"
    },
    "vip": {
        "def": 0,
        "type": "number"
    },
    "login_count": {
        "def": 0,
        "type": "number"
    },
    "logout_count": {
        "def": 0,
        "type": "number"
    },
    "created_at": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp"
    },
    "updated_at": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp"
    },
    "last_online_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp"
    },
    "salt": {
        "def": null,
        "type": "string"
    },
    "token": {
        "def": null,
        "type": "string"
    },
    "gold": {
        "def": player_users_cfg[0].gold,
        "type": "number",
        "inc": true
    },
    "pearl": {
        "def": 0,
        "type": "number",
        "inc": true
    },
    "weapon": {
        "def": 1,
        "type": "number"
    },
    "skill": {
        "def": {
            "1": 3,
            "2": 5,
            "3": 3,
            "4": -1,
            "8": 0,
            "9": 0,
            "10": 0
        },
        "type": "object"
    },
    "broke_times": {
        "def": 0,
        "type": "number"
    },
    "first_login": {
        "def": 1,
        "type": "number"
    },
    "day_reward": {
        "def": 1,
        "type": "number"
    },
    "day_reward_adv": {
        "def": 0,
        "type": "number"
    },
    "new_reward_adv": {
        "def": 0,
        "type": "number"
    },
    "day_reward_weekly": {
        "def": 0,
        "type": "number"
    },
    "vip_daily_fill": {
        "def": 1,
        "type": "number"
    },
    "rmb": {
        "def": 0,
        "type": "number"
    },
    "channel": {
        "def": "fj",
        "type": "string"
    },
    "channel_account_id": {
        "def": null,
        "type": "string"
    },
    "platform": {
        "def": 1,
        "type": "number"
    },
    "vip_weapon_id": {
        "def": null,
        "type": "string"
    },
    "pfft_at": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp"
    },
    "channel_account_info": {
        "def": {},
        "type": "object"
    },
    "exp": {
        "def": 0,
        "type": "number",
        "inc": true
    },
    "level": {
        "def": 1,
        "type": "number"
    },
    "level_mission": {
        "def": {},
        "type": "object"
    },
    "mission_daily_reset": {
        "def": {},
        "type": "object"
    },
    "mission_only_once": {
        "def": {},
        "type": "object"
    },
    "first_buy": {
        "def": {},
        "type": "object"
    },
    "activity_gift": {
        "def": {},
        "type": "object"
    },
    "heartbeat": {
        "def": 1,
        "type": "number"
    },
    "heartbeat_min_cost": {
        "def": 0,
        "type": "number"
    },
    "achieve_point": {
        "def": 0,
        "type": "number"
    },
    "gold_shopping": {
        "def": 0,
        "type": "number"
    },
    "weapon_skin": {
        "def": {
            "own": [1],
            "equip": 1
        },
        "type": "object"
    },
    "bonus": {
        "def": {},
        "type": "object"
    },
    "drop_reset": {
        "def": {},
        "type": "object"
    },
    "drop_once": {
        "def": {},
        "type": "object"
    },
    "comeback": {
        "def": {},
        "type": "object"
    },
    "vip_gift": {
        "def": [],
        "type": "object"
    },
    "weapon_energy": {
        "def": {},
        "type": "object"
    },
    "pirate": {
        "def": {},
        "type": "object"
    },
    "card": {
        "def": {},
        "type": "object"
    },
    "get_card": {
        "def": {
            "normal": false,
            "senior": false
        },
        "type": "object"
    },
    "first_buy_gift": {
        "def": 0,
        "type": "number"
    },
    "package": {
        "def": {},
        "type": "object"
    },
    "guide": {
        "def": 0,
        "type": "number"
    },
    "guide_weak": {
        "def": {
            "laser": false,
            "laserTimes": 3,
            "achieve": false,
            "reward": false,
            "petfish": false,
            "goddess": false,
            "specials": {}
        },
        "type": "object"
    },
    "active": {
        "def": {},
        "type": "object"
    },
    "active_daily_reset": {
        "def": {},
        "type": "object"
    },
    "active_stat_once": {
        "def": {},
        "type": "object"
    },
    "active_stat_reset": {
        "def": {},
        "type": "object"
    },
    "mail_box": {
        "def": [],
        "type": "object"
    },
    "free_draw": {
        "def": {
            "gold": 1,
            "diamond": 0
        },
        "type": "object"
    },
    "total_draw": {
        "def": {
            "gold": 0,
            "diamond": 0
        },
        "type": "object"
    },
    "roipct_time": {
        "def": 0,
        "type": "number"
    },
    "aquarium": {
        "def": {},
        "type": "object"
    },
    "goddess": {
        "def": [{
            "id": 1,
            "level": 1,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [2, 2, 2, 2, 2, 2, 2, 2, 2],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 2,
            "level": 0,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 3,
            "level": 0,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 4,
            "level": 0,
            "hp": 200,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }, {
            "id": 5,
            "level": 0,
            "hp": 100,
            "startWaveIdx": 0,
            "free": 1,
            "ctimes": 0,
            "unlock": [0, 0, 0, 0, 0, 0, 0, 0, 0],
            "interactReward": [0, 0, 0, 0],
            "isPauseAway": false
        }],
        "type": "object"
    },
    "free_goddess": {
        "def": [1, 1, 1, 1, 1],
        "type": "object"
    },
    "goddess_free": {
        "def": 1,
        "type": "number"
    },
    "goddess_ctimes": {
        "def": 0,
        "type": "number"
    },
    "goddess_crossover": {
        "def": 0,
        "type": "number"
    },
    "goddess_ongoing": {
        "def": 0,
        "type": "number"
    },
    "redress_no": {
        "def": 0,
        "type": "number"
    },
    "test": {
        "def": 1,
        "type": "number"
    },
    "rank_in_friends": {
        "def": 0,
        "type": "number"
    },
    "over_me_friends": {
        "def": [],
        "type": "object"
    },
    "charm_rank": {
        "def": 0,
        "type": "number"
    },
    "charm_point": {
        "def": 100,
        "type": "number"
    },
    //10.23 update
    "sex": {
        "def": 0,
        "type": "number"
    },
    "city": {
        "def": "",
        "type": "string"
    },
    "game_friend": {
        "def": [],
        "type": "object"
    },
    "bp": {
        "def": 0,
        "type": "number"
    },
    "phone": {
        "def": '',
        "type": "string"
    }
};

//注意，其他字段来自其他表，参考common的_resultList方法实现
exports.OtherDef = {
    "month_sign": {
        "def": [],
        "type": "object"
    },
    "sid": {
        "def": 1,
        "type": "number"
    },
    "match_on": {
        "def": 1,
        "type": "number"
    },
    "cik_on": {
        "def": 1,
        "type": "number"
    },
    "cdkey_on": {
        "def": 0,
        "type": "number"
    },
    "msgboard_mgmt": {
        "def": 0,
        "type": "number"
    },
    "max_wave": {
        "def": 0,
        "type": "number"
    },
    "goddess_balance_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp"
    },
    "week_reward": {
        "def": 0,
        "type": "number"
    },
    "week_rank": {
        "def": 0,
        "type": "number"
    },
    "petfish_recent_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp"
    },
    "petfish_total_level": {
        "def": 0,
        "type": "number"
    },
    "match_recent_time": {
        "def": '0000-00-00 00:00:00',
        "type": "timestamp"
    },
    "match_win": {
        "def": 0,
        "type": "number"
    },
    "match_fail": {
        "def": 0,
        "type": "number"
    },
    "match_points": {
        "def": 800,
        "type": "number"
    },
    "match_rank": {
        "def": 5,
        "type": "number"
    },
    "match_unfinish": {
        "def": 0,
        "type": "number"
    },
    "match_box_list": {
        "def": [0, 0, 0],
        "type": "object"
    },
    "match_box_timestamp": {
        "def": [0, 0, 0],
        "type": "object"
    },
    "match_1st_box": {
        "def": {
            "stat": 1,
            "timestamp": 0,
            "id": 0
        },
        "type": "object"
    },
    "match_season_count": {
        "def": 0,
        "type": "number"
    },
    "match_season_win": {
        "def": 0,
        "type": "number"
    },
    "match_season_box": {
        "def": 0,
        "type": "number"
    },
    "match_season_1st_win": {
        "def": 0,
        "type": "number"
    },
    "match_got_season_reward": {
        "def": 1,
        "type": "number"
    },
    "match_winning_streak": {
        "def": 0,
        "type": "number"
    },
    "gold_total_gain": {
        "def": 0,
        "type": "number"
    },
    "gold_total_cost": {
        "def": 0,
        "type": "number"
    },
    "gold_shop_count": {
        "def": 0,
        "type": "number"
    },
    "gold_shop_amount": {
        "def": 0,
        "type": "number"
    },
    "diamond_total_gain": {
        "def": 0,
        "type": "number"
    },
    "diamond_total_cost": {
        "def": 0,
        "type": "number"
    },
    "diamond_shop_count": {
        "def": 0,
        "type": "number"
    },
    "diamond_shop_amount": {
        "def": 0,
        "type": "number"
    },
    "has_social": {
        "def": 0,
        "type": "number"
    },
    "social_invite_friends": {
        "def": [],
        "type": "object"
    },
    "social_share_friends": {
        "def": [],
        "type": "object"
    },
    "social_invite_progress": {
        "def": 0,
        "type": "number"
    },
    "social_invite_daily_state": {
        "def": 0,
        "type": "number"
    },
    "social_invite_reward": {
        "def": 0,
        "type": "number"
    },
    "social_share_status_0": {
        "def": {},
        "type": "object"
    },
    "social_share_status_1": {
        "def": {},
        "type": "object"
    },
    "social_share_status_2": {
        "def": {},
        "type": "object"
    },
    "social_enshrine_status": {
        "def": 0,
        "type": "number"
    },
    "social_share_top_gold": {
        "def": 0,
        "type": "number"
    },
    "social_share_top_rank": {
        "def": 0,
        "type": "number"
    },
    "figure_url": {
        "def": "default.png",
        "type": "string"
    },
    "new_player": {
        "def": 1,
        "type": "number"
    },
    "need_insert": {
        "def": 1,
        "type": "number"
    },
    "need_update": {
        "def": 1,
        "type": "number"
    },
    "online_time": {
        "def": 0,
        "type": "number"
    },
    "vip_fill_this_time": {
        "def": 0,
        "type": "number"
    },
    "flower_receive_weekly":{
        "def": 0,
        "type": "number",
        "name": "flower_receive_weekly"
    },
    //2018.2.25 add dfc
    "month_sign_extra_reward": {
        "def": {},
        "type": "object",
        "name": "month_sign_extra_reward"
    },
    //2018.2.28 add dfc
    "social_daily_invite_reward": {
        "def": 0,
        "type": "number",
        "name": "social_daily_invite_reward"
    },
    "social_invite_week": {
        "def": 0,
        "type": "number",
        "name": "social_invite_week"
    },
    "social_invite_month": {
        "def": 0,
        "type": "number",
        "name": "social_invite_month"
    },
};

/**
 * 返回指定字段类型和默认值[type, def]
 */
exports.getField = function (field) {
    var af = exports.AccountDef[field];
    af = af || exports.OtherDef[field];
    return af;
};