module.exports = {
    gitTag: 'v1.0.0',
    input: {
        js: ['../../servers*/**/*.js',
            '!../../servers/config/**/*',
            '!../../servers/shared/**/*',
        ],
        plugins:[
            '../../config*/**/*',
            
        ]
        cfg1:'../../config*/**/*',
        cfg2:'../../servers/config*/**/*',
        cfg3:'../../servers/config*/**/*',
        zip: './dist/**/*.*',
        cfgs: '../../../cfgs/data_table_js-越南版/服务器导出/**/*',
    },
    output: {
        dist: './dist',
        origin: 'origin',
        sourcemap: 'map',
        cfg
        zip: './',
        cfgs: ['./dist/cfgs/',
            // './dist/chat_server/cfgs/',
            './dist/data_server/cfgs/',
            // './dist/resource_server/public/cfgs'
        ]
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