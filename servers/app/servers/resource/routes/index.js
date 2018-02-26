const fs = require('fs');
const downloader = require('../controllers/downloader');
const logger = require('omelo-logger').getLogger('gate', __filename);
const path = require('path');


module.exports = (router) => {
	router.prefix = '/';

	//获取游戏首页
	router.get('/', async (ctx) => {
		ctx.status = 301;
		ctx.redirect(downloader.genRedirectUrl(ctx.protocol, ctx.host, 'fishjoy/index.html'));
		ctx.body = 'redirect';
	});

	//获取游戏声明
	router.get('/policy', async (ctx) => {
		ctx.status = 301;
		ctx.redirect(downloader.genRedirectUrl(ctx.protocol, ctx.host, 'policy.html'));
		ctx.body = 'redirect';
	});

	//图片下载
	router.get('/img', async (ctx) => {
		await downloader.download(ctx);
	});


};