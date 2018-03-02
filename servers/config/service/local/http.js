const omelo = require('omelo');
const dbCfg = require('../../../app/utils/imports').dbCfg;
const versions = require('../../../app/utils/imports').versions;
const serversCfg = require('./servers.json')[omelo.app.env];

const sysConfig = require('../../sysConfig');
const SSL_CERT = sysConfig.SSL_CERT || {};

function getServerCfg(type, id) {
  let servers = serversCfg[type];
  let cfg = {};
  if (servers) {
    for (let i = 0; i < servers.length; i++) {
      if (servers[i].id == id) {
        cfg = servers[i];
        break;
      }
    }
  }
  return cfg;
}

module.exports = {
  development: {
    gate: [{
      id: 'gate',
      useCluster: false,
      useSSL: versions.SSL,
      static: true,
      views: true,
      http: {
        host: getServerCfg('gate', 'gate').host,
        port: 3002
      },
      https: {
        host: getServerCfg('gate', 'gate').host,
        port: 3004,
        keyFile: SSL_CERT.KEY,
        certFile: SSL_CERT.CERT
      },
    }],
    hall: [{
        id: 'hall-1',
        useCluster: false,
        useSSL: versions.SSL,
        static: true,
        views: true,
        http: {
          host: getServerCfg('hall', 'hall-1').host,
          port: 3602
        },
        https: {
          host: getServerCfg('hall', 'hall-1').host,
          port: 3604,
          keyFile: SSL_CERT.KEY,
          certFile: SSL_CERT.CERT
        }
      },
      {
        id: 'hall-2',
        useCluster: false,
        useSSL: versions.SSL,
        static: true,
        views: true,
        http: {
          host: getServerCfg('hall', 'hall-2').host,
          port: 3606
        },
        https: {
          host: getServerCfg('hall', 'hall-2').host,
          port: 3608,
          keyFile: SSL_CERT.KEY,
          certFile: SSL_CERT.CERT
        }
      }
    ],
    chat: [{
      id: 'chat',
      useCluster: false,
      useSSL: versions.SSL,
      static: true,
      views: true,
      http: {
        host: getServerCfg('chat', 'chat').host,
        port: 3702
      },
      https: {
        host: getServerCfg('chat', 'chat').host,
        port: 3704,
        keyFile: SSL_CERT.KEY,
        certFile: SSL_CERT.CERT
      }
    }],
    admin: [{
      id: 'admin',
      useCluster: false,
      useSSL: versions.SSL,
      static: true,
      views: true,
      http: {
        host: getServerCfg('admin', 'admin').host,
        port: 3802
      },
      https: {
        host: getServerCfg('admin', 'admin').host,
        port: 3804,
        keyFile: SSL_CERT.KEY,
        certFile: SSL_CERT.CERT
      },
      session: {
        store: dbCfg.redis,
        maxAge: 36000000
      }

    }],
    resource: [{
      id: 'resource',
      useCluster: false,
      useSSL: versions.SSL,
      static: true,
      views: true,
      http: {
        host: getServerCfg('resource', 'resource').host,
        port: 3502
      },
      https: {
        host: getServerCfg('resource', 'resource').host,
        port: 3504,
        keyFile: SSL_CERT.KEY,
        certFile: SSL_CERT.CERT
      }
    }],
    pay: [{
      id: 'pay',
      useCluster: false,
      useSSL: versions.SSL,
      static: true,
      views: true,
      http: {
        host: getServerCfg('pay', 'pay').host,
        port: 4102
      },
      https: {
        host: getServerCfg('pay', 'pay').host,
        port: 4104,
        keyFile: SSL_CERT.KEY,
        certFile: SSL_CERT.CERT
      }
    }]
  },
  production: {}
}