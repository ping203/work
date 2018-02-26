const Koa = require('koa');
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const Application = require('./application');
const http = require('http');
const https = require('https');
const logger = loggerEx(__filename);

module.exports = class KoaApplication extends Application {
    constructor(opts) {
        super(opts);
        this._koa = new Koa();
        this._http_server = null;
        this._https_server = null;
        this._initialize();
    }

    _initialize() {
        // error handler
        onerror(this._koa);

        // middlewares
        this._koa.use(bodyparser({
            enableTypes: ['json', 'form', 'text']
        }));
        this._koa.use(json());
        this._koa.use(require('koa-logger')());
        this._koa.use(require('koa-static')(__dirname + '/public'));

        this._koa.use(views(__dirname + '/views', {
            extension: 'ejs'
        }));

        // logger
        this._koa.use(async (ctx, next) => {
            const start = new Date();
            await next();
            const ms = new Date() - start;
            console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
        });

        // error-handling
        this._koa.on('error', (err, ctx) => {
            console.error('server error', err, ctx)
        });
    }


    async start() {
        await super.start();
        if (this._opts.config.service.https_enable) {
            this._startHttps();
        }
        this._startHttp();
    }

    stop() {

    }

    _startHttp() {
        let serviceCfg = this._opts.config.service;
        let port = this._normalizePort(serviceCfg.port);
        this._http_server = http.createServer(this._koa.callback());
        this._http_server.listen(port);
        this._http_server.on('error', this._onHttpError.bind(this));
        this._http_server.on('listening', this._onHttpListening.bind(this));
    }

    _startHttps() {
        let serviceCfg = this._opts.config.service;
        let port = this._normalizePort(serviceCfg.https_port);
        this._https_server = https.createServer(this._koa.callback());
        this._https_server.listen(port);
        this._https_server.on('error', this._onHttpsError.bind(this));
        this._https_server.on('listening', this._onHttpsListening.bind(this));
    }

    registe(routes, methods) {
        // routes
        this._koa.use(routes, methods);
    }

    _normalizePort(val) {
        let port = parseInt(val, 10);
        if (isNaN(port)) {
            // named pipe
            return val;
        }
        if (port >= 0) {
            // port number
            return port;
        }
        return false;
    }

    _onHttpError(error) {
        this._printError(this._opts.config.service.port, error);
    }

    _onHttpsError(error) {
        this._printError(this._opts.config.service.https_port, error);
    }

    _onHttpListening() {
        this._printListening(this._http_server);
    }

    _onHttpsListening() {
        this._printListening(this._https_server);
    }

    _printError(port, error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string' ?
            'Pipe ' + port :
            'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                logger.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                logger.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    _printListening(server) {
        var addr = server.address();
        logger.info('Listening on ' + server);
        logger.info('Listening on ' + addr);
        var bind = typeof addr === 'string' ?
            'pipe ' + addr :
            'port ' + addr.port;
        logger.info('Listening on ' + bind);
    }

}