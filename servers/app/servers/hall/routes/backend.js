////////////////////////////////////////////////////////////////////////////////
// 后台管理页面的前端路由
////////////////////////////////////////////////////////////////////////////////
const httpHandler = require('../../common/httpHandler');
const pages_signin = require('../controllers/admin/pages_signin');
const index = require('../controllers/admin/index');
const pages_real_time = require('../controllers/admin/pages_real_time');
const pages_online = require('../controllers/admin/pages_online');
const pages_register = require('../controllers/admin/pages_register');
const pages_active = require('../controllers/admin/pages_active');
const pages_payuser = require('../controllers/admin/pages_payuser');
const pages_retention = require('../controllers/admin/pages_retention');
const pages_log = require('../controllers/admin/pages_log');
const pages_gm_data = require('../controllers/admin/pages_gm_data');
const pages_gm_match = require('../controllers/admin/pages_gm_match');
const pages_gm_update = require('../controllers/admin/pages_gm_update');
const pages_gm_broadcast = require('../controllers/admin/pages_gm_broadcast');
const pages_gm_mail = require('../controllers/admin/pages_gm_mail');
const pages_gm_active = require('../controllers/admin/pages_gm_active');
const pages_om_query = require('../controllers/admin/pages_om_query');
const pages_om_change_in_kind = require('../controllers/admin/pages_om_change_in_kind');
const pages_om_compensate = require('../controllers/admin/pages_om_compensate');
const pages_om_control = require('../controllers/admin/pages_om_control');
const pages_tm_tool = require('../controllers/admin/pages_tm_tool');
const pages_am_auth = require('../controllers/admin/pages_am_auth');
const pages_am_role = require('../controllers/admin/pages_am_role');
const pages_am_user = require('../controllers/admin/pages_am_user');
const pages_am_log = require('../controllers/admin/pages_am_log');
const pages_am_server = require('../controllers/admin/pages_am_server');
const pages_am_devtest = require('../controllers/admin/pages_am_devtest');
const pages_am_backdoor = require('../controllers/admin/pages_am_backdoor');

module.exports = (router) => {
    router.prefix('/');

    //登录页面
    router.get('/pages-signin.html', async (ctx) => {
        await httpHandler(ctx, pages_signin, 'pages_signin');
    });

    // 管理页面
    router.get('/index.html', async (ctx) => {
        await httpHandler(ctx, index, 'get');
    }).post('/index.html', async (ctx) => {
        await httpHandler(ctx, index, 'post');
    });

    router.get('/pages-realtime.html', async (ctx) => {
        await httpHandler(ctx, pages_real_time, 'get');
    }).post('/pages-realtime.html', async (ctx) => {
        await httpHandler(ctx, pages_real_time, 'post');
    });

    router.get('/pages-online.html', async (ctx) => {
        await httpHandler(ctx, pages_online, 'get');
    }).post('/pages-online.html', async (ctx) => {
        await httpHandler(ctx, pages_online, 'post');
    });

    router.get('/pages-register.html', async (ctx) => {
        await httpHandler(ctx, pages_register, 'get');
    }).post('/pages-register.html', async (ctx) => {
        await httpHandler(ctx, pages_register, 'post');
    });

    router.get('/pages-active.html', async (ctx) => {
        await httpHandler(ctx, pages_active, 'get');
    }).post('/pages-active.html', async (ctx) => {
        await httpHandler(ctx, pages_active, 'post');
    });

    router.get('/pages-payuser.html', async (ctx) => {
        await httpHandler(ctx, pages_payuser, 'get');
    }).post('/pages-payuser.html', async (ctx) => {
        await httpHandler(ctx, pages_payuser, 'post');
    });

    router.get('/pages-retention.html', async (ctx) => {
        await httpHandler(ctx, pages_retention, 'get');
    }).post('/pages-retention.html', async (ctx) => {
        await httpHandler(ctx, pages_retention, 'post');
    });

    router.get('/pages-log.html', async (ctx) => {
        await httpHandler(ctx, pages_log, 'get');
    }).post('/pages-log.html', async (ctx) => {
        await httpHandler(ctx, pages_log, 'post');
    });

    router.get('/pages-gm-data.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_data, 'get');
    }).post('/pages-gm-data.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_data, 'post');
    });

    router.get('/pages-gm-match.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_match, 'get');
    }).post('/pages-gm-match.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_match, 'post');
    });

    router.get('/pages-gm-update.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_update, 'get');
    }).post('/pages-gm-update.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_update, 'post');
    });

    router.get('/pages-gm-broadcast.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_broadcast, 'get');
    }).post('/pages-gm-broadcast.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_broadcast, 'post');
    });

    router.get('/pages-gm-mail.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_mail, 'get');
    }).post('/pages-gm-mail.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_mail, 'post');
    });

    router.get('/pages-gm-active.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_active, 'get');
    }).post('/pages-gm-active.html', async (ctx) => {
        await httpHandler(ctx, pages_gm_active, 'post');
    });

    router.get('/pages-om-query.html', async (ctx) => {
        await httpHandler(ctx, pages_om_query, 'get');
    }).post('/pages-om-query.html', async (ctx) => {
        await httpHandler(ctx, pages_om_query, 'post');
    });

    router.get('/pages-om-change-in-kind.html', async (ctx) => {
        await httpHandler(ctx, pages_om_change_in_kind, 'get');
    }).post('/pages-om-change-in-kind.html', async (ctx) => {
        await httpHandler(ctx, pages_om_change_in_kind, 'post');
    });

    router.get('/pages-om-compensate.html', async (ctx) => {
        await httpHandler(ctx, pages_om_compensate, 'get');
    }).post('/pages-om-compensate.html', async (ctx) => {
        await httpHandler(ctx, pages_om_compensate, 'post');
    });

    router.get('/pages-om-control.html', async (ctx) => {
        await httpHandler(ctx, pages_om_control, 'get');
    }).post('/pages-om-control.html', async (ctx) => {
        await httpHandler(ctx, pages_om_control, 'post');
    });

    router.get('/pages-tm-tool.html', async (ctx) => {
        await httpHandler(ctx, pages_tm_tool, 'get');
    }).post('/pages-tm-tool.html', async (ctx) => {
        await httpHandler(ctx, pages_tm_tool, 'post');
    });

    router.get('/pages-am-auth.html', async (ctx) => {
        await httpHandler(ctx, pages_am_auth, 'get');
    }).post('/pages-am-auth.html', async (ctx) => {
        await httpHandler(ctx, pages_am_auth, 'post');
    });

    router.get('/pages-am-role.html', async (ctx) => {
        await httpHandler(ctx, pages_am_role, 'get');
    }).post('/pages-am-role.html', async (ctx) => {
        await httpHandler(ctx, pages_am_role, 'post');
    });

    router.get('/pages-am-user.html', async (ctx) => {
        await httpHandler(ctx, pages_am_user, 'get');
    }).post('/pages-am-user.html', async (ctx) => {
        await httpHandler(ctx, pages_am_user, 'post');
    });

    router.get('/pages-am-log.html', async (ctx) => {
        await httpHandler(ctx, pages_am_log, 'get');
    }).post('/pages-am-log.html', async (ctx) => {
        await httpHandler(ctx, pages_am_log, 'post');
    });

    router.get('/pages-am-server.html', async (ctx) => {
        await httpHandler(ctx, pages_am_server, 'get');
    }).post('/pages-am-server.html', async (ctx) => {
        await httpHandler(ctx, pages_am_server, 'post');
    });

    router.get('/pages-am-devtest.html', async (ctx) => {
        await httpHandler(ctx, pages_am_devtest, 'get');
    }).post('/pages-am-devtest.html', async (ctx) => {
        await httpHandler(ctx, pages_am_devtest, 'post');
    });

    router.get('/pages-am-backdoor.html', async (ctx) => {
        await httpHandler(ctx, pages_am_backdoor, 'get');
    }).post('/pages-am-backdoor.html', async (ctx) => {
        await httpHandler(ctx, pages_am_backdoor, 'post');
    });
}
