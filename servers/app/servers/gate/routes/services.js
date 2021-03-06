const httpHandler = require('../../common/httpHandler');
const queryServices = require('../controllers/queryServices');

module.exports = (router) => {
	router.prefix('/client_api');

	router.post('/get_api_server', async (ctx) => {
		ctx.request.body.data.protocol = ctx.request.protocol;
		await httpHandler(ctx, queryServices, 'lists');
	});
};