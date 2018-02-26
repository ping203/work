const thirdPartyAuth = require('../controllers/thirdPartyAuth');
const innerUserAuth = require('../controllers/innerUserAuth');
const httpHandler = require('../../common/httpHandler');

module.exports = (router) => {
	router.prefix('/account_api');

	router.post('/auth', async (ctx) => {
		let data = await httpHandler(ctx, thirdPartyAuth, 'login');
		if(data){
			ctx.session.uid = data.id;
		}
	});

	router.post('/register', async (ctx) => {
		let data = await httpHandler(ctx, innerUserAuth, 'register');
		if(data){
			ctx.session.uid = data.id;
		}
	});

	router.post('/login', async (ctx) => {
		let data = await httpHandler(ctx, innerUserAuth, 'login');
		if(data){
			ctx.session.uid = data.id;
		}
	});

	router.post('/modifyPassword', async (ctx) => {
		await httpHandler(ctx, innerUserAuth, 'modifyPassword');
	});
};