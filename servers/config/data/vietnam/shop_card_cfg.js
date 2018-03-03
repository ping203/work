var	shop_card_cfg = 
[
	{
		id : 100,    //--月卡类型
		funid : 9067,    //--玩吧id
		funidiOS : 9488,    //--玩吧idiOS
		price : 150000,    //--价格¥
		diamond : 600,    //--一次性赠送钻石
		everyday : [["i401",3],["i011",2],["i002",30],["i012",2]],    //--每日领取
		hitrate : 1,    //--捕鱼命中系数
	},
	{
		id : 101,    //--月卡类型
		funid : 9068,    //--玩吧id
		funidiOS : 9489,    //--玩吧idiOS
		price : 750000,    //--价格¥
		diamond : 2400,    //--一次性赠送钻石
		everyday : [["i400",2],["i011",5],["i013",5],["i015",1],["i002",60],["i012",5]],    //--每日领取
		hitrate : 1.025,    //--捕鱼命中系数
	},
];
module.exports = shop_card_cfg;