const admin_auth = require('../controllers/api/admin_auth');
const admin_role = require('../controllers/api/admin_role');
const admin_user = require('../controllers/api/admin_user');
const admin_server = require('../controllers/api/admin_server');
const admin_dbsave = require('../controllers/api/admin_dbsave');
const admin_backdoor = require('../controllers/api/admin_backdoor');
const admin_operation = require('../controllers/api/admin_operation');
const admin_sdata = require('../controllers/api/admin_sdata');
const statistics_retention = require('../controllers/api/statistics_retention');
const statistics_payuser = require('../controllers/api/statistics_payuser');
const admin_ex = require('../controllers/api/admin_ex');
const httpHandler = require('../../common/adminHandler');

/// 导出excel 接口删除了，后续新版admin 添加

module.exports = (router) => {
    router.prefix('/admin_api');

    // 测试周期性生成排行榜奖励
    router.post('/generate_cycle_reward', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'generateCycleReward');
    });

    //------------------------------------------------------------------------------
    // 用户数据持久化
    //------------------------------------------------------------------------------
    // 计数缓存中的用户量
    router.post('/count_account', async (ctx) => {
        await httpHandler(ctx, admin_dbsave, 'countAccount');
    });

    // 列表缓存中的用户
    router.post('/list_account', async (ctx) => {
        await httpHandler(ctx, admin_dbsave, 'listAccount');
    });

    // 保存缓存中的用户到数据库
    router.post('/save_account', async (ctx) => {
        await httpHandler(ctx, admin_dbsave, 'saveAccount');
    });

    //------------------------------------------------------------------------------
    // 运营管理
    //------------------------------------------------------------------------------
    // 获取配置接口
    router.post('/buy_card', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'buyCard');
    });

    // 获取配置接口
    router.post('/get_operation_cfgs', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'getOperationCfgs');
    });

    // 改变实物领取相关配置的接口
    router.post('/modify_cfgs', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'modifyCfgs');
    });

    // 修改订单状态和信息
    router.post('/modify_orders', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'modifyOrders');
    });

    // 改变实物领取相关配置的接口
    router.post('/get_change_order', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'getChangeOrder');
    });

    // 负载均衡服调用, 用于运营取消订单后给用户加话费券
    router.post('/add_huafeiquan', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'addHuafeiquan');
    });

    // 查询奖池总览数据
    router.post('/query_jackpot', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'queryJackpot');
    });

    // 查询玩家数据
    router.post('/query_player', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'queryPlayer');
    });

    // 查询盈亏排行榜.
    router.post('/query_profit', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'queryProfit');
    });

    // 修改捕获率
    router.post('/change_rate', async (ctx) => {
        await httpHandler(ctx, admin_operation, 'changeRate');
    });

    //------------------------------------------------------------------------------
    // 后门接口
    //------------------------------------------------------------------------------
    // 查看管理日志
    router.post('/query_admin_log', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'queryAdminLog');
    });

    // 获取金币日志
    router.post('/query_gold', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'queryGold');
    });

    // 获取内存数据: 玩家
    router.post('/get_ca', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'getCacheAccount');
    });

    // 删除缓存中的玩家数据
    router.post('/del_ca', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'delCacheAccount');
    });

    // 获取内存中玩家的统计数据
    router.post('/get_ca_statistics', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'getCacheAccountStatistics');
    });

    // 获取内存数据: 邮件
    router.post('/get_cm', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'getCacheMail');
    });

    // 查看服务器配置表
    // 输入任意一张表名, 能够在网页上以table的格式显示这张表的所有内容
    router.post('/query_cfgs', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'queryCfgs');
    });

    // 获取内存数据: 金币记录
    router.post('/get_gl', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'getGoldLog');
    });

    // 重置每日数据
    router.post('/reset_daily', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'resetDaily');
    });

    // 重置每周数据
    router.post('/reset_weekly', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'resetWeekly');
    });

    // 手动生成留存数据
    router.post('/generate_retention', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'generateRetention');
    });

    // 修改玩家数据
    router.post('/modify_udata', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'modifyUserData');
    });

    // 游戏更新版本时踢出玩家
    router.post('/kick_user', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'kickUser');
    });

    // 账号清空(同样QQ号会另外创建账号并从新手引导开始)
    router.post('/account_forbidden', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'accountForbidden');
    });

    // 设置账号的权限(0,1,2)
    router.post('/account_auth', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'accountAuth');
    });

    // 排位赛开关
    router.post('/match_switch', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'switchMatch');
    });

    // 实物兑换开关
    router.post('/cik_switch', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'switchCik');
    });

    //------------------------------------------------------------------------------
    // 服务器管理
    //------------------------------------------------------------------------------
    // 关闭API服务器
    router.get('/shutdown', async (ctx) => {
        await httpHandler(ctx, admin_server, 'shutdown');
    });

    //------------------------------------------------------------------------------
    // GM游戏数据查询
    //------------------------------------------------------------------------------
    //服务器周期数据
    router.post('/get_data_water', async (ctx) => {
        await httpHandler(ctx, admin_sdata, 'water');
    });


    /**
     * 验证服务器是否正常
     * admin_api/check_server
     */
    router.get('/check_server', async (ctx) => {
        ctx.body = {
            type: 1,
            msg: '服务器运行正常',
            data: 1
        };
    });

    //==============================================================================
    // 数据查询语句

    /**
     * 获取在线状态，传入参数包括
     * @date string 基准日期，以字符串形式由客户端传入
     * admin_api/get_online_status
     */
    router.post('/get_online_status', async (ctx) => {
        await httpHandler(ctx, admin_ex, 'getOnlineStatus');
    });

    /**
     * 获取实时数据，传入参数包括
     * @date string 基准日期，以字符串形式由客户端传入
     * admin_api/get_realtime_data
     */
    router.post('/get_realtime_data', async (ctx) => {
        await httpHandler(ctx, admin_ex, 'getRealtimeData');
    });

    /**
     * 获取注册数据，包括指定日期范围内每日登录数据及新增绑定数据
     * 客户端默认传入最近一周的时间范围，如今日是2016年10月14日，则
     * start_date为"2016-10-08"
     * end_date为"2016-10-14"
     * 
     * @start_date string 开始日期
     * @end_date string 结束日期
     * admin_api/get_register_data
     */
    router.post('/get_register_data', async (ctx) => {
        await httpHandler(ctx, admin_ex, 'getRegisterData');
    });

    /**
     * 获取登录数据，包括指定日期范围内每日登录次数以及登录的账户数
     * 客户端默认传入最近一周的时间范围，如今日是2016年10月14日，则
     * start_date为"2016-10-08"
     * end_date为"2016-10-14"
     * 
     * @start_date string 开始日期
     * @end_date string 结束日期
     * admin_api/get_active_data
     */
    router.post('/get_active_data', async (ctx) => {
        await httpHandler(ctx, admin_ex, 'getActiveData');
    });

    /**
     * 获取留存数据(Retention)
     */
    router.post('/get_retention_data', async (ctx) => {
        await httpHandler(ctx, statistics_retention, 'get_retention_data');
    });

    //==============================================================================
    // 后台管理API
    //==============================================================================

    //------------------------------------------------------------------------------
    // 用户登录(User Login)
    //------------------------------------------------------------------------------
    /**
     * 添加权限页面
     */
    router.post('/mgmt/signin', async (ctx) => {
        await httpHandler(ctx, admin_user, 'signin');
    });

    //------------------------------------------------------------------------------
    // 付费用户数据获取(Pay User)
    //------------------------------------------------------------------------------
    /**
     * 获取付费用户的统计数据(指定日期段)
     */
    router.post('/get_payuser_data', async (ctx) => {
        await httpHandler(ctx, statistics_payuser, 'get_data');
    });

    /**
     * 获取月卡用户列表
     */
    router.post('/get_carduser_list', async (ctx) => {
        await httpHandler(ctx, statistics_payuser, 'get_carduser_list');
    });

    /**
     * 获取付费用户的统计数据(按用户分组)
     */
    router.post('/get_payuser_rank', async (ctx) => {
        await httpHandler(ctx, statistics_payuser, 'get_user_pay_data');
    });

    /**
     * 获取付费日志记录(指定日期段)
     */
    router.post('/get_paylog_data', async (ctx) => {
        await httpHandler(ctx, statistics_payuser, 'get_paylog');
    });

    /**
     * 查询付费记录(使用game_order_id查询单一订单, 使用game_account_id查询一个账户下的所有订单)
     */
    router.post('/query_pay', async (ctx) => {
        await httpHandler(ctx, statistics_payuser, 'query_pay');
    });

    /**
     * 查询玩家日志.
     */
    router.post('/query_log', async (ctx) => {
        await httpHandler(ctx, admin_backdoor, 'queryLog');
    });

    //------------------------------------------------------------------------------
    // 权限管理(Auth Mgmt)
    //------------------------------------------------------------------------------
    /**
     * 添加权限页面
     */
    router.post('/mgmt/add_auth', async (ctx) => {
        await httpHandler(ctx, admin_auth, 'add');
    });

    /**
     * 禁止权限页面
     */
    router.post('/mgmt/delete_auth', async (ctx) => {
        await httpHandler(ctx, admin_auth, 'delete');
    });

    /**
     * 激活权限页面
     */
    router.post('/mgmt/valid_auth', async (ctx) => {
        await httpHandler(ctx, admin_auth, 'valid');
    });

    /**
     * 编辑权限页面
     */
    router.post('/mgmt/edit_auth', async (ctx) => {
        await httpHandler(ctx, admin_auth, 'edit');
    });

    //------------------------------------------------------------------------------
    // 角色管理(Role Mgmt)
    //------------------------------------------------------------------------------

    /**
     * 添加角色页面
     */
    router.post('/mgmt/add_role', async (ctx) => {
        await httpHandler(ctx, admin_role, 'add');
    });

    /**
     * 禁止角色页面
     */
    router.post('/mgmt/delete_role', async (ctx) => {
        await httpHandler(ctx, admin_role, 'delete');
    });

    /**
     * 激活角色页面
     */
    router.post('/mgmt/valid_role', async (ctx) => {
        await httpHandler(ctx, admin_role, 'valid');
    });

    /**
     * 编辑角色页面
     */
    router.post('/mgmt/edit_role', async (ctx) => {
        await httpHandler(ctx, admin_role, 'edit');
    });

    //------------------------------------------------------------------------------
    // 用户管理(User Mgmt)
    //------------------------------------------------------------------------------

    /**
     * 添加用户页面
     */
    router.post('/mgmt/add_user', async (ctx) => {
        await httpHandler(ctx, admin_user, 'add');
    });

    /**
     * 禁止用户页面
     */
    router.post('/mgmt/delete_user', async (ctx) => {
        await httpHandler(ctx, admin_user, 'delete');
    });

    /**
     * 激活用户页面
     */
    router.post('/mgmt/valid_user', async (ctx) => {
        await httpHandler(ctx, admin_user, 'valid');
    });

    /**
     * 编辑用户页面
     */
    router.post('/mgmt/edit_user', async (ctx) => {
        await httpHandler(ctx, admin_user, 'edit');
    });

}