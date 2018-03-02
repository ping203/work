// const adminHandler = require('../../common/adminHandler');
const adminHandler = require('../../common/httpHandler');
const ObjUtil = require('../utils/ObjUtil');

module.exports = (router) => {
	router.prefix('/admin');

	function setRoute(route, menu, method) {
		router.post(route, async (ctx) => {
			await adminHandler(ctx, menu, method);
		})
	}

	ObjUtil.routes(setRoute);
};