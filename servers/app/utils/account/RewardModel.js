/*
* date:2016/12/6
* author: huangxuequan
* function：奖励系统
*
*/

'use script';
const GAMECFG = require('../imports').GAME_CFGS;
const daily_quest_cfg = GAMECFG.daily_quest_cfg;
const daily_vitality_cfg = GAMECFG.daily_vitality_cfg;
let REWARD_CFG = null;
let DAILY_VITALITY_CFG = null;

const CompleteSign = -1;

const Specails = [
    {condition: 26, value1: 5000000, value2: 1, id: 1001},
    {condition: 27, value1: 27, value2: 1, id: 1002},
];

class RewardModel {
    constructor() {
        this.dailyTaskProcess = {}; //每日任务进度
        this.achieveTaskProcess = {}; //成就
        this.everyDay = [];              //日常任务数据
        this.achieve = [];               //成就数据
        this._achievePoint = null;       //成就点
        this._dailyTotalProcess = null;  //日常任务总的进度
        this._dailyBox = [];             //日常任务四个箱子
        this._receiveCallFunc = null;    //领取奖励的回调

        REWARD_CFG = daily_quest_cfg;
        DAILY_VITALITY_CFG = daily_vitality_cfg;
    }

    isMultCondition(taskType) {
        switch (taskType) {
            case RewardModel.TaskType.CATCH_FISH:
                return true;
            case RewardModel.TaskType.USE_SKILL:
                return true;
            case RewardModel.TaskType.USE_FISH_CATCH_FISH:
                return true;
            case RewardModel.TaskType.GET_RANK_LV:
                return true;
            case RewardModel.TaskType.GET_DRAGON_STAR:
                return true;
            case RewardModel.TaskType.PLAY_LITTLE_GAME:
                return true;
            default:
                return false;
        }
    }

    resetLoginData(mission_only_once, mission_daily_reset) {
        this.resetAchieveProgress(mission_only_once);
        this.resetDailyProgress(mission_daily_reset);
        this.everyDay = [];
        this.achieve = [];

        this.initTaskData();
        this.initDailyTotalData();
        this.initAchievePoint();

        // isFirstLoginToday && this.addProcess(RewardModel.TaskType.CONTINUE_LOGIN, 1);
    }

    initTaskData() {
        for (let i = 0; i < REWARD_CFG.length; i++) {
            if (REWARD_CFG[i].type == RewardModel.Type.EVERYDAY) {
                this.initEveryDayData(REWARD_CFG[i].condition, i);
            } else {
                this.initAchieveData(REWARD_CFG[i].condition, i);
            }
        }

        for (let i in Specails) {
            let info = Specails[i];
            let obj = {};
            obj[info.value1] = 0;
            this.achieve[info.condition] = {keyProcess: obj};
        }
    }

    initDailyTotalData() {
        this._dailyTotalProcess = this.getTaskProcess(RewardModel.Type.EVERYDAY, "dailyTotal");
        for (let i = 0; i < 4; i++) {
            let id = 'box' + i;
            this._dailyBox[i] = this.getTaskProcess(RewardModel.Type.EVERYDAY, id);
        }
    }

    initAchievePoint() {
        this._achievePoint = this.getTaskProcess(RewardModel.Type.ACHIEVE, "achievePoint");
    }

    resetAchievePoint(aPoint) {
        aPoint >= 0 && (this._achievePoint = aPoint);
    }

    resetDailyTotalPoint(dPoint) {
        dPoint >= 0 && (this._dailyTotalProcess = dPoint);
    }

    resetAchieveProgress(mission_only_once) {
        mission_only_once && (this.achieveTaskProcess = mission_only_once);
    }

    resetDailyProgress(mission_daily_reset) {
        mission_daily_reset && (this.dailyTaskProcess = mission_daily_reset);
    }

    getTaskProcess(type, ID) {
        let process = null;
        if (type) {
            process = this.achieveTaskProcess;
        } else {
            process = this.dailyTaskProcess;
        }

        if (process[ID] == null) {
            process[ID] = 0;
        }
        return process[ID];
    }

    initEveryDayData(TaskType, cfgIndex) {
        if (this.everyDay[TaskType] == null) {
            this.everyDay[TaskType] = new Object();
            this.initObject(this.everyDay[TaskType]);
        }
        this.setObjectData(this.everyDay[TaskType], cfgIndex);
    }

    initAchieveData(TaskType, cfgIndex) {
        if (this.achieve[TaskType] == null) {
            this.achieve[TaskType] = new Object();
            this.initObject(this.achieve[TaskType]);
        }

        let process = this.getProcessByServerData(cfgIndex);
        if (process) {
            //  if(process <= cfg.value2){//表示还未领取
            this.setObjectData(this.achieve[TaskType], cfgIndex);
            //  }else{

            //  }
        } else {//表示还未进行
            this.setObjectData(this.achieve[TaskType], cfgIndex);
        }
    }

    initObject(obj) {
        //说明 
        //当 obj.keyProcess[key] > obj.MaxProcess[key]代表已经领取
        //当 obj.keyProcess[key] == obj.MaxProcess[key]代表可以领取
        //当 obj.keyProcess[key] < obj.MaxProcess[key]代表还在进行中     
        obj.keyProcess = []; //当前进度
        obj.MaxProcess = []; //最大进度   
        obj.cfgIndex = [];   //通过下标取档中的值 0-n eg：REWARD_CFG[ obj.cfgIndex[key] ]
    }

    setObjectData(obj, cfgIndex) {
        let cfg = REWARD_CFG[cfgIndex];
        let process = this.getProcessByServerData(cfgIndex);
        if (obj.keyProcess[cfg.value1] == null || process) { //是0不需要缓存
            obj.keyProcess[cfg.value1] = process;
            obj.MaxProcess[cfg.value1] = cfg.value2; //最大进度
            obj.cfgIndex[cfg.value1] = cfgIndex;
        }
    }

    getProcessByServerData(cfgIndex) {
        let cfg = REWARD_CFG[cfgIndex];

        let process = this.getTaskProcess(cfg.type, cfg.id);
        if (process != null) {
            return process;
        }
        return null;
    }

    addProcess(taskType, num, key) {
        this._addEveryDayTask(taskType, num, key);
        this._addAchieveTask(taskType, num, key);
        // require("ActivityModel").getInstance().addActiveMission(taskType, num, key); //暂时做在客户端
        // this.emitEvent(RewardModel.EventType.CHECK_NEW_REWARD); 
    }

    _addEveryDayTask(taskType, num, key) {
        if (num == null) {
            num = 1;
        }
        if (!this.isMultCondition(taskType))
            key = 0;
        if (this.everyDay[taskType] == null || this.everyDay[taskType].keyProcess[key] == null || this.everyDay[taskType].keyProcess[key] < 0) {//目前任务不在统计范围内
            return;
        }
        let index = this.everyDay[taskType].cfgIndex[key];
        if (this.everyDay[taskType].keyProcess[key] < REWARD_CFG[index].value2) {
            if (this.isAssigement(taskType)) {
                if (this.everyDay[taskType].keyProcess[key] < num) {
                    this.everyDay[taskType].keyProcess[key] = num;
                }
            } else {
                this.everyDay[taskType].keyProcess[key] += num;
            }
            if (this.everyDay[taskType].keyProcess[key] > REWARD_CFG[index].value2) {
                this.everyDay[taskType].keyProcess[key] = REWARD_CFG[index].value2;
            }
            this.everyDay.isChange = true;
        }
    }

    //TODO捕鱼 和 技能需要特殊处理
    _addAchieveTask(taskType, num, key) {
        if (num == null) {
            num = 1;
        }
        if (!this.isMultCondition(taskType))
            key = key || 0;
        if (this.achieve[taskType] == null || this.achieve[taskType].keyProcess[key] == null || this.achieve[taskType].keyProcess[key] < 0) {//目前任务不在统计范围内
            return;
        }
        if (this.isAssigement(taskType)) {
            if (this.achieve[taskType].keyProcess[key] < num) {
                this.achieve[taskType].keyProcess[key] = num;
            }
        } else {
            this.achieve[taskType].keyProcess[key] += num;
        }
        this.achieve.isChange = true;
    }

    isAssigement(taskType) {
        switch (taskType) {
            case RewardModel.TaskType.UPDATE_USER_LV:
                return true;
            case RewardModel.TaskType.UPDATE_WEAPON_LV:
                return true;
            case RewardModel.TaskType.ONE_CATCH_FISH:
                return true;
            case RewardModel.TaskType.ONE_GET_GOLD:
                return true;
            case RewardModel.TaskType.GET_VIP_LV:
                return true;
            case RewardModel.TaskType.GODDESS_LEVEL:
                return true;
            case RewardModel.TaskType.PLAY_LITTLE_GAME:
                return true;
            case RewardModel.TaskType.GOLD_FIRST:
                return true;
            case RewardModel.TaskType.CHALLENGE_POS:
                return true;
            case RewardModel.TaskType.CHALLENGE_DUANWEI:
                return true;
            default:
                return false;
        }
    }

    receive(type, taskType, key, func) {
        this._receiveCallFunc = func;
        if (type == RewardModel.Type.EVERYDAY) {
            this.receiveEveryDayReward(taskType, key);
        } else {
            this.receiveAchieveReward(taskType, key);
        }
        //this.emitEvent(RewardModel.EventType.CHECK_NEW_REWARD); 
    }

    receiveEveryDayReward(taskType, key) {
        this.everyDay[taskType].keyProcess[key] = CompleteSign;
        if (this._receiveCallFunc) {
            this._receiveCallFunc(this.everyDay[taskType].cfgIndex[key], this._dailyTotalProcess);
        }
    }

    receiveAchieveReward(taskType, key) {
        this.addAchievePoint(this.achieve[taskType].cfgIndex[key]);

        //同种任务是否有下一步进度,有则改变，没有则删除此任务
        let index = this.achieve[taskType].cfgIndex[key];
        if (REWARD_CFG[index].precondition != 0) {
            this.achieve[taskType].MaxProcess[key] = REWARD_CFG[index + 1].value2;
            this.achieve[taskType].cfgIndex[key] = index + 1;
            if (this._receiveCallFunc) {
                this._receiveCallFunc(index + 1);
            }
        } else { //后置任务没有不删除，不然又会重新来过
            this.achieve[taskType].keyProcess[key] = CompleteSign;
            if (this._receiveCallFunc) {
                this._receiveCallFunc(-1);
            }
        }
    }

    addDailyTotalProcess(cfgIndex) {
        let cfg = REWARD_CFG[cfgIndex];
        let data = cfg.reward[1];
        if (data[0] == "i102") {
            this._dailyTotalProcess += data[1];
        }
    }

    addAchievePoint(cfgIndex) {
        let cfg = REWARD_CFG[cfgIndex];
        let data = cfg.reward[1];
        if (data[0] == "i103") {
            // this._achievePoint += data[1]; //服务器已直接返回并重置本地，无需再本地累加
            this.addProcess(RewardModel.TaskType.GET_ACHIEVE_POINT, data[1]);//获得成就点
        }
    }

    getCfgIndexs(type) {
        switch (type) {
            case RewardModel.Type.EVERYDAY:
                return this.getEveryDayCfgIndex();
            case RewardModel.Type.ACHIEVE:
                return this.getAchieveCfgIndex();
            default:
                return null;
        }
    }

    haveInfoReward(type) {
        switch (type) {
            case RewardModel.Type.EVERYDAY:
                return this._haveInfoReward(this.everyDay);
            case RewardModel.Type.ACHIEVE:
                return this._haveInfoReward(this.achieve);
            default:
                return false;
        }
    }

    _haveInfoReward(data) {
        for (let taskType in data) {
            for (let key in  data[taskType].cfgIndex) {
                const keyProcess = data[taskType].keyProcess[key];
                const maxProcess = data[taskType].MaxProcess[key];
                if (keyProcess == CompleteSign) {
                    continue;
                }
                if (keyProcess >= maxProcess) {
                    return true;
                }
            }
        }
        return false;
    }

    getTaskProgress(taskType, key) {
        key = key || 0;
        return this.achieve[taskType] && this.achieve[taskType].keyProcess[key] || 0;
    }

    getEveryDayCfgIndex() {
        let data = [];
        for (let taskType in this.everyDay) {
            for (let key in  this.everyDay[taskType].cfgIndex) {
                let keyProcess = this.everyDay[taskType].keyProcess[key];
                if (keyProcess == CompleteSign) {
                    continue;
                }
                let maxProcess = this.everyDay[taskType].MaxProcess[key];
                let index = this.everyDay[taskType].cfgIndex[key];
                let level = 0;
                if (keyProcess == maxProcess) {
                    level = 2;
                } else if (keyProcess < maxProcess) {
                    level = 1;
                } else {
                    level = 0;
                }
                if (level !== 0) {
                    data.push({index, level});
                }
            }
        }

        data.sort(function (a, b) {
            return a.level < b.level ? 1 : -1;
        });

        let indexs = [];
        for (let i = 0; i < data.length; i++) {
            indexs.push(data[i].index);
        }
        return indexs;
    }

    getAchieveCfgIndex() {
        let data1 = [], data2 = [];
        for (let taskType in this.achieve) {
            for (let key in  this.achieve[taskType].cfgIndex) {
                const keyProcess = this.achieve[taskType].keyProcess[key];
                const maxProcess = this.achieve[taskType].MaxProcess[key];
                if (keyProcess == CompleteSign) {
                    continue;
                }
                let index = this.achieve[taskType].cfgIndex[key];
                if (keyProcess >= maxProcess) {
                    data1.push(index);
                } else {
                    data2.push(index);
                }
            }
        }

        data1.sort(function (a, b) {
            return a - b;
        });
        data2.sort(function (a, b) {
            return a - b;
        });

        let indexs = [];
        for (let i = 0; i < data1.length; i++) {
            indexs.push(data1[i]);
        }
        for (let i = 0; i < data2.length; i++) {
            indexs.push(data2[i]);
        }
        return indexs;
    }

    getProcessData(type, cfgIndex, compelateFunc) {
        let cfg = REWARD_CFG[cfgIndex];
        let progress = 0;
        switch (type) {
            case RewardModel.Type.EVERYDAY:
                progress = this.everyDay[cfg.condition].keyProcess[cfg.value1];
                break;
            case RewardModel.Type.ACHIEVE:
                progress = this.achieve[cfg.condition].keyProcess[cfg.value1];
                break;
            default:
                return 0;
        }
        compelateFunc && compelateFunc(progress >= cfg.value2);
        return progress;
    }

    getProcessAndPoint() {
        let data = [];
        data['dailyTotal'] = this._dailyTotalProcess;
        for (let i = 0; i < 4; i++) {
            data[i] = this._dailyBox[i];
        }
        data['achievePoint'] = this._achievePoint;
        return data;
    }

    receiveBox(index, func) {//-1 不能领取 0 可以领取 1 已领取
        let flag = this.getBoxState(index);
        if (flag == 0) {
            if (this._dailyBox[index] != 1) {
                this._dailyBox[index] = 1;
            }
        }
        if (func) {
            let cfgDetail = DAILY_VITALITY_CFG[index];
            func(flag, index, cfgDetail);
        }
    }

    /**
     * 获取活跃度宝箱状态//-1 不能领取 0 可以领取 1 已领取
     */
    getBoxState(index) {
        let flag = 0;
        let cfgDetail = DAILY_VITALITY_CFG[index];
        if (cfgDetail.value > this._dailyTotalProcess) {
            flag = -1;
        } else {
            if (this._dailyBox[index] != 1) {
                flag = 0;
            } else {
                flag = 1;
            }
        }
        return flag;
    }

    /**
     * 有没有已完成未领取的成就或日常
     * 注意 type 可以为0
     */
    checkDoneNotGet(type) {
        if (type == undefined) {
            type = RewardModel.Type.ACHIEVE;
        }
        const CFG_INDEX = this.getCfgIndexs(type);
        let i = CFG_INDEX.length;
        while (i && i--) {
            let cfgIndex = CFG_INDEX[i];
            let isDone = false;
            let progress = this.getProcessData(type, cfgIndex, function (isCompelated) {
                isDone = isCompelated;
            });
            if (isDone) {
                return true;
            }
        }
        if (type == RewardModel.Type.EVERYDAY) {
            for (let j = 0; j < DAILY_VITALITY_CFG.length; j++) {
                if (this.getBoxState(j) == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    getReadyData2Send(type, isStrong = true) {
        let data = {};
        let obj = null;

        if (type == RewardModel.Type.EVERYDAY) {
            obj = this.everyDay;
        } else if (type == RewardModel.Type.ACHIEVE) {
            obj = this.achieve;

            for (let i in Specails) {
                const info = Specails[i];
                data[info.id] = obj[info.condition].keyProcess[info.value1];
            }
        }
        if (!isStrong && !obj.isChange) {
            return;
        }
        obj.isChange = false;

        for (let i in obj) {
            for (let key in obj[i].keyProcess) {
                if (obj[i].keyProcess[key] != null && obj[i].keyProcess[key] != 0 && obj[i].cfgIndex) {
                    let index = obj[i].cfgIndex[key];
                    let id = REWARD_CFG[index].id;
                    data[id] = obj[i].keyProcess[key];
                }
            }
        }

        if (type == RewardModel.Type.EVERYDAY) {
            data['dailyTotal'] = this._dailyTotalProcess;
            for (let i = 0; i < 4; i++) {
                let id = 'box' + i;
                data[id] = this._dailyBox[i];
            }
        } else if (type == RewardModel.Type.ACHIEVE) {
            data['achievePoint'] = this._achievePoint;
        }
        return data;
    }

    getAchievePoint() {
        return this._achievePoint;
    }

}


RewardModel.EventType = {
    CHECK_NEW_REWARD: "CHECK_NEW_REWARD", //新的奖励可以领取
};

RewardModel.Type = {
    EVERYDAY: 0,
    ACHIEVE: 1,
    REGISTER: 2,
};

RewardModel.TaskType = {
    NONE: 0,
    CATCH_FISH: 1,          //捕获x鱼y条，如果x为0则为任意鱼
    USE_SKILL: 2,           //使用x技能y次，如果x为0则为任意技能
    UPDATE_USER_LV: 3,      //角色等级x级
    UPDATE_WEAPON_LV: 4,    //解锁炮台x倍
    USE_FISH_CATCH_FISH: 5, //利用x鱼炸死y条其他鱼
    GET_WEAPON_SKIN: 6,     //获得炮台皮肤x个
    ONE_CATCH_FISH: 7,      //单次开炮捕获鱼x条
    ONE_GET_GOLD: 8,        //单次开炮获得金币x
    GET_GOLD: 9,            //累计获得金币x           
    USE_DIAMOND: 10,        //累计消耗钻石x
    USE_GOLD: 11,           //累计消耗金币x
    SHARE_TIMES: 12,        //分享x次
    CONTINUE_LOGIN: 13,     //累计登录x天
    GET_RANK_LV: 14,        //获得排位x阶段位y次
    GET_VIP_LV: 15,         //成为VIPx
    GET_DRAGON_STAR: 16,    //达成龙宫x星y次
    GET_ACHIEVE_POINT: 17,  //获得x点成就点
    GOLD_TIMES: 18, //金币次数
    CHARG_PEARL: 19, //充值珍珠
    DEFEND_GODDESS: 20, //保卫女神
    STOCKING_FISH: 21, //放养鱼
    GODDESS_LEVEL: 22, //女神最高闯关
    PETFISH_TOTAL_LEVEL: 23, //宠物鱼等级和
    UNLOCK_GODDESS: 24, //解锁女神
    PLAY_LITTLE_GAME: 25, //x小游戏中获得y分
    GOLD_FIRST: 26, //成为首富y次
    CHALLENGE_POS: 27, //排位赛段位y
    CHALLENGE_WIN: 28, //排位赛获得x次胜利
    CHALLENGE_DUANWEI: 29, //排位赛段位大于等于x
    MAX: 30,//最后一个，暂时取消掉了
};

module.exports = RewardModel;
