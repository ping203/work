const omelo = require('omelo');
const path = require('path');
const fs = require('fs');
const versions = require('./app/utils/imports').versions;
const omeloHttpPlugin = require('omelo-http-plugin');
const logger = require('omelo-logger').getLogger('default', __filename);
require('./app/utils/globals');
const routeUtil = require('./app/utils/routeUtil');
const httpAesFilter = require('./app/servers/common/httpAesFilter');
const httpTokenFilter = require('./app/servers/common/httpTokenFilter');
const sysConfig = require('./config/sysConfig');

let SSL = null;
if (sysConfig.SSL_CERT) {
  SSL = {
    type: 'wss',
    key: fs.readFileSync(sysConfig.SSL_CERT.KEY, 'utf8'),
    cert: fs.readFileSync(sysConfig.SSL_CERT.CERT, 'utf8'),
    strictSSL: false,
    rejectUnauthorized: false
  };
}


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
// app.loadConfig('http', sysConfig.HTTPCFG);

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

// 服务基础配置
app.configure('production|development', 'manager|event|matching|rankMatch|r2mSync|rank|admin|resource|game|gate|hall|chat', function () {
  global.logger = require('omelo-logger').getLogger(app.getServerId());
});

//服务http配置
app.configure('production|development', 'admin|resource|gate|hall|chat', function () {
  app.use(omeloHttpPlugin, {
    http: app.get('http')
  });
  omeloHttpPlugin.filter(httpAesFilter);
});

// 服务器token配置
app.configure('production|development', 'hall|chat', function () {  
  omeloHttpPlugin.filter(httpTokenFilter);
});

// 网关配置
app.configure('production|development', 'gate', function () {
  app.set('connectorConfig', {
    connector: omelo.connectors.hybridconnector,
    useDict: true,
    useProtobuf: true
  });

  httpTokenFilter.addIgnoreRoute('/auth');
  httpTokenFilter.addIgnoreRoute('/login');
  httpTokenFilter.addIgnoreRoute('/register');
  omeloHttpPlugin.filter(httpTokenFilter);

});

// 游戏服务配置
app.configure('production|development', 'game', function () {
  let connectorConfig = {
    connector: omelo.connectors.hybridconnector,
    heartbeat: 10,
    useDict: true,
    useProtobuf: true
  };
  SSL && (connectorConfig.ssl = SSL);
  app.set('connectorConfig', connectorConfig);
  // app.use(sync, {sync: {path: __dirname + '/app/logic/mapping', dbclient: redisClient, interval: 500}});
  app.filter(require('./app/servers/game/filter/playerFilter'));
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});

process.on('unhandledRejection', (reason, p) => {
  logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});