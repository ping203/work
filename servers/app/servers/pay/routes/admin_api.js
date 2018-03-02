// admin_api
// 管理相关的API, 包括
const admin_operation = require('../controllers/data/admin_operation');
const httpHandler = require('../../common/httpHandler');


module.exports = (router) => {
    router.prefix('/data_api');

    // 后台批准提现
    router.post('/buy_card', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'buyCard');
    });
};