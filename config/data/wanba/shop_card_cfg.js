var	shop_card_cfg = 
[
	{
		id : 100,    //--月卡类型
		funid : 9067,    //--玩吧id
		funidiOS : 9488,    //--玩吧idiOS
		price : 30,    //--价格¥
		diamond : 300,    //--一次性赠送钻石
		everyday : [["i001",50000],["i011",2],["i002",30],["i012",2]],    //--每日领取
		hitrate : 1,    //--捕鱼命中系数
		sharecount : 25,    //--邀请数量
		description : "str_month_card_share_free_month",    //--描述
	},
	{
		id : 101,    //--月卡类型
		funid : 9068,    //--玩吧id
		funidiOS : 9489,    //--玩吧idiOS
		price : 120,    //--价格¥
		diamond : 1200,    //--一次性赠送钻石
		everyday : [["i015",1],["i011",5],["i013",5],["i001",100000],["i002",60],["i012",5]],    //--每日领取
		hitrate : 1.025,    //--捕鱼命中系数
		sharecount : 75,    //--邀请数量
		description : "str_month_card_share_free_month",    //--描述
	},
	{
		id : 102,    //--月卡类型
		funid : 9055,    //--玩吧id
		funidiOS : 9476,    //--玩吧idiOS
		price : 6,    //--价格¥
		diamond : 60,    //--一次性赠送钻石
		everyday : [["i001",20000],["i012",2],["i013",2],["i011",2]],    //--每日领取
		hitrate : 1,    //--捕鱼命中系数
		sharecount : 5,    //--邀请数量
		description : "str_month_card_share_free_week",    //--描述
	},
];
module.exports = shop_card_cfg;