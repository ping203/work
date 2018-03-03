module.exports = {
    gitTag: 'v1.0.0',
    input: {
        js: ['../../servers*/**/*.js',
            '!../../servers/node_modules/**/*',
            '!../../servers/config/**/*',
            '!../../servers/shared/**/*',
        ],
        plugins: [
            ['../../servers/config*/**/*', './build/servers'],
            ['../../servers/shared*/**/*', './build/servers'],
            ['../../servers/*.json', './build/servers']

        ],
        zip: './build/**/*.*',
    },
    output: {
        dist: './build',
        origin: 'origin',
        sourcemap: 'map',
        zip: './packages',
    },
    scp: {
        host: '119.28.176.122',
        username: 'root',
        password: 'Chufeng123456',
        remotePath: '/home/publish/'
    },
    upload: [{
            host: '171.244.35.40',
            username: 'root',
            password: 'JYvdwVUZrEvwFkyTDYPx',
            paths: [{
                localPath: 'C:/Users/Administrator/Desktop/BUG/room/servers.json',
                remotePath: '/home/fishjoy_test/server/fishjoyPublish/room/config'
            }]
        },
        {
            host: '171.244.35.41',
            username: 'root',
            password: 'JYvdwVUZrEvwFkyTDYPx',
            paths: [{
                localPath: 'C:/Users/Administrator/Desktop/BUG/room/servers.json',
                remotePath: '/home/fishjoy_test/server/fishjoyPublish/room/config'
            }]
        },
        {
            host: '171.244.35.42',
            username: 'root',
            password: 'JYvdwVUZrEvwFkyTDYPx',
            paths: [{
                localPath: 'C:/Users/Administrator/Desktop/BUG/room/servers.json',
                remotePath: '/home/fishjoy_test/server/fishjoyPublish/room/config'
            }]
        },
        {
            host: '171.244.35.43',
            username: 'root',
            password: 'JYvdwVUZrEvwFkyTDYPx',
            paths: [{
                localPath: 'C:/Users/Administrator/Desktop/BUG/room/servers.json',
                remotePath: '/home/fishjoy_test/server/fishjoyPublish/room/config'
            }]
        },
    ],
    download: [{
        host: '171.244.35.38',
        username: 'root',
        password: 'JYvdwVUZrEvwFkyTDYPx',
        localPath: '../../../fishjoy_server/data_server/src/buzz/sdk/payConfig.js',
        remotePath: '/home/fishjoy_test/server/data_server/src/buzz/sdk/'
    }, ]
};