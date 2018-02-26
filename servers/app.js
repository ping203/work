const omelo = require('omelo');
const path = require('path');
const versions = require('./app/utils/imports').versions;
const omeloHttpPlugin = require('omelo-http-plugin');
const logger = require('omelo-logger').getLogger('default', __filename);
require('./app/utils/globals');
const routeUtil = require('./app/utils/routeUtil');
const httpAesFilter = require('./app/servers/common/httpAesFilter');
const httpSessionFilter = require('./app/servers/common/httpSessionFilter');

/**
 * Init app for client.
 */
let app = omelo.createApp({
  version_key: versions.VERSION_KEY[versions.PUB]
});

app.set('name', 'fishjoy');
app.set('errorHandler', function (err, msg, resp, session, next) {
  logger.error('-------errorHandler happend ---->', err);
  // session.__session__.__socket__.socket.close();
  next();
});


app.loadConfig('redis', require('./app/utils/imports').dbCfg.redis);
app.loadConfig('mysql', require('./app/utils/imports').dbCfg.mysql);
app.loadConfig('http', path.join(app.getBase(), `config/service/${versions.VERSION_KEY[versions.PUB]}/http`));

// configure for global
app.configure('production|development', function () {
  // load configure

  // app.enable('systemMonitor');
  // filter configures
  // app.before(omelo.filters.toobusy()); // 服务器繁忙
  // app.filter(omelo.filters.serial()); //主要负责保证所有从客户端到服务端的请求能够按顺序地处理
  // app.filter(omelo.filters.time()); //主要负责记录请求的相应时间
  //app.filter(omelo.filters.timeout()); //主要负责监控请求响应时间，如果超时就给出警告
  //app.before(decryptFilter);
  //app.filter(queueFilter);
  app.before(require('./app/servers/common/unLoginFilter'));

  // let onlineUser = require('./app/modules/onlineUser');
  let gameInfo = require('./app/modules/gameInfo');
  let matchInfo = require('./app/modules/matchInfo');
  if (typeof app.registerAdmin === 'function') {
    // app.registerAdmin(onlineUser, {
    //   app: app
    // });
    app.registerAdmin(gameInfo, {
      app: app
    });
    app.registerAdmin(matchInfo, {
      app: app
    });
  }

  // let redis_config = app.get('redis');
  // app.use(globalChannel, {
  //     globalChannel: {
  //         prefix: 'globalChannel',
  //         host: redis_config.server.host,
  //         port: redis_config.server.port,
  //         cleanOnStartUp: true
  //     }
  // });

  // proxy configures
  app.set('proxyConfig', {
    cacheMsg: true,
    interval: 30,
    lazyConnection: true
    // enableRpcLog: true
  });

  // remote configures
  app.set('remoteConfig', {
    cacheMsg: true,
    interval: 30
  });

  /*
  // master high availability
  app.use(masterhaPlugin, {
      zookeeper: {
          server: '127.0.0.1:2181',
          path: '/omelo/master'
      }
  });
  */

  // route configures
  app.route('game', routeUtil.gameRoute);
  app.route('rankMatch', routeUtil.rankMatchRoute);
});

// gate configuration
app.configure('production|development', 'gate', function () {
  global.logger = require('omelo-logger').getLogger('gate');
  app.set('connectorConfig', {
    connector: omelo.connectors.hybridconnector,
    useDict: true,
    useProtobuf: true
  });

  app.gate = require('./app/logic/gate/gate');
  app.gate.start();

  app.use(omeloHttpPlugin, {
    http: app.get('http')
  });

  omeloHttpPlugin.filter(httpAesFilter);

  httpSessionFilter.addIgnoreRoute('/auth');
  httpSessionFilter.addIgnoreRoute('/login');
  httpSessionFilter.addIgnoreRoute('/register');
  
  omeloHttpPlugin.filter(httpSessionFilter);
  // todo deprecated
  app.beforeStopHook(function () {
    app.gate.stop();
  });
})

// configuration for app
app.configure('production|development', 'resource', function () {
  app.use(omeloHttpPlugin, {
    http: app.get('http')
  });

  app.beforeStopHook(function () {
    //todo add user code
  });

});

// configuration for admin
app.configure('production|development', 'admin', function () {
  app.use(omeloHttpPlugin, {
    http: app.get('http')
  });

  app.beforeStopHook(function () {
    //todo add user code
  });

});

// auth configuration
app.configure('production|development', 'auth', function () {
  global.logger = require('omelo-logger').getLogger('auth');
  app.auth = require('./app/logic/auth/auth');
  app.auth.start();
  // todo deprecated
  app.beforeStopHook(function () {
    app.auth.stop();
  });
});

// game configuration
app.configure('production|development', 'game', function () {
  global.logger = require('omelo-logger').getLogger('game');
  app.set('connectorConfig', {
    connector: omelo.connectors.hybridconnector,
    heartbeat: 10,
    useDict: true,
    useProtobuf: true
  });
  // app.set('redisClient', redisClient);
  // app.use(sync, {sync: {path: __dirname + '/app/logic/mapping', dbclient: redisClient, interval: 500}});
  app.filter(require('./app/servers/game/filter/playerFilter'));
  app.game = require('./app/logic/game/game');
  app.game.start();
  app.beforeStopHook(function () {
    app.game.stop();
  });
});

// 负载均衡服务器配置
app.configure('production|development', 'balance', function () {
  global.logger = require('omelo-logger').getLogger('balance');

  app.balance = require('./app/logic/balance/balance');
  app.balance.start();

  // todo deprecated
  app.beforeStopHook(function () {
    app.balance.stop();
  });
});

// 负载均衡服务器配置
app.configure('production|development', 'dataSync', function () {
  global.logger = require('omelo-logger').getLogger('dataSync');

  app.dataSync = require('./app/logic/dataSync/dataSync');
  app.dataSync.start();

  omeloHttpPlugin.filter(require('./app/servers/common/httpAesFilter'));

  // todo deprecated
  app.beforeStopHook(function () {
    app.dataCenter.stop();
  });
});

// 排位赛匹配服
app.configure('production|development', 'matching', function () {
  global.logger = require('omelo-logger').getLogger('matching');

  app.matching = require('./app/logic/matching/matching');
  app.matching.start();

  // todo deprecated
  app.beforeStopHook(function () {
    app.matching.stop();
  });
});

// 排位赛服
app.configure('production|development', 'rankMatch', function () {
  global.logger = require('omelo-logger').getLogger('rankMatch');

  app.rankMatch = require('./app/logic/rankMatch/rankMatch');
  app.rankMatch.start();

  // todo deprecated
  app.beforeStopHook(function () {
    app.rankMatch.stop();
  });
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});