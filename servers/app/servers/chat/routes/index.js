const chat = require('../controllers/chat');
const data_feedback = require('../controllers/feedback');
const httpHandler = require('../../common/httpHandler');

module.exports = (router) => {
	// router.prefix('/chat_api');

	/**
	 * 聊天信息获取
	 */
	router.post('/chat_api/get_chat_info', async (ctx) => {
		await httpHandler(ctx, chat, 'getChat');
	});

	//----------------------------------------------------------
	// 玩家反馈接口
	//----------------------------------------------------------
	/**
	 * 接收玩家发来的一条留言
	 * token, text
	 */
	router.post('/data_api/player_propose', async (ctx) => {
		await httpHandler(ctx, data_feedback, 'playerPropose');
	});

	/**
	 * 客户端拉取留言板内容.
	 * token, timestamp, count, hot4
	 */
	router.post('/data_api/query_msgboard', async (ctx) => {
		await httpHandler(ctx, data_feedback, 'queryMsgboard');
	});

	/**
	 * 玩家点赞.
	 * token, mid
	 */
	router.post('/data_api/like_msgboard', async (ctx) => {
		await httpHandler(ctx, data_feedback, 'likeMsgboard');
	});

	/**
	 * 刪除留言.
	 * token, mid
	 */
	router.post('/data_api/del_msgboard', async (ctx) => {
		await httpHandler(ctx, data_feedback, 'delMsgboard');
	});


};