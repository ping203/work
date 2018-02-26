const dbCfg = require('../../../app/utils/imports').dbCfg;
const versions = require('../../../app/utils/imports').versions;

module.exports = {
  development: {
    gate: [{
      id: 'gate',
      useCluster: false,
      useSSL: false,
      static: true,
      views: true,
      http: {
        host: '127.0.0.1',
        port: 3002
      },
      https: {
        host: '127.0.0.1',
        port: 3004,
        keyFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.key`,
        certFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.crt`
      },
      session: {
        store: dbCfg.redis,
        maxAge: 10000
      }
    }],
    hall: [{
        id: 'hall-1',
        useCluster: false,
        useSSL: false,
        static: true,
        views: true,
        http: {
          host: '127.0.0.1',
          port: 3602
        },
        https: {
          host: '127.0.0.1',
          port: 3604,
          keyFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.key`,
          certFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.crt`
        }
      },
      {
        id: 'hall-2',
        useCluster: false,
        useSSL: false,
        static: true,
        views: true,
        http: {
          host: '127.0.0.1',
          port: 3606
        },
        https: {
          
          host: '127.0.0.1',
          port: 3608,
          keyFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.key`,
          certFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.crt`
        }
      }
    ],
    chat: [{
      id: 'chat',
      useCluster: false,
      useSSL: false,
      static: true,
      views: true,
      http: {
        host: '127.0.0.1',
        port: 3702
      },
      https: {
        host: '127.0.0.1',
        port: 3704,
        keyFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.key`,
        certFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.crt`
      }
    }],
    admin: [{
      id: 'admin',
      useCluster: false,
      useSSL: false,
      static: true,
      views: true,
      http: {
        host: '127.0.0.1',
        port: 3802
      },
      https: {
        host: '127.0.0.1',
        port: 3804,
        keyFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.key`,
        certFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.crt`
      }

    }],
    resource: [{
      id: 'resource',
      useCluster: false,
      useSSL: false,
      static: true,
      views: true,
      http: {
        host: '127.0.0.1',
        port: 3502
      },
      https: {
        host: '127.0.0.1',
        port: 3504,
        keyFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.key`,
        certFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.crt`
      }
    }],
    game: [{
      id: 'game-1',
      useCluster: false,
      useSSL: false,
      static: true,
      views: true,
      http: {
        host: '127.0.0.1',
        port: 4002
      },
      https: {
        host: '127.0.0.1',
        port: 4004,
        keyFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.key`,
        certFile: `shared/${versions.VERSION_KEY[versions.PUB]}/server.crt`
      }
    }],
  },
  production: {}
}