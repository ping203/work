const thirdPartyAuth = require('../controllers/thirdPartyAuth');
const innerUserAuth = require('../controllers/innerUserAuth');
const httpHandler = require('../../common/httpHandler');

module.exports = (router) => {
	router.prefix('/account_api');

	router.post('/auth', async (ctx) => {
		await httpHandler(ctx, thirdPartyAuth, 'login');
	});

	router.post('/register', async (ctx) => {
		await httpHandler(ctx, innerUserAuth, 'register');
	});

	router.post('/login', async (ctx) => {
		await httpHandler(ctx, innerUserAuth, 'login');
	});

	router.post('/modifyPassword', async (ctx) => {
		await httpHandler(ctx, innerUserAuth, 'modifyPassword');
	});

    router.post('/logout_account', async (ctx) => {
        await httpHandler(ctx, innerUserAuth, 'logout');
    });
};