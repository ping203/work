const http = require('http');
const https = require('https');

class DownloadRes {
    constructor() {

    }

    genRedirectUrl(protocol, hostname, path) {
        return `${protocol}://${hostname}/${path}`;
    }

    getRemoteResource(isHttps, url) {
        return new Promise(function (resolve, reject) {
            let net = isHttps ? https : http;
            let req = net.request(url, function (res) {
                let bufCache = null;
                res.on('data', function (chunk) {
                    if (!bufCache) {
                        bufCache = Buffer.from(chunk);
                    } else {
                        bufCache = Buffer.concat([bufCache, chunk], bufCache.byteLength + chunk.byteLength);
                    }
                });
                res.on('end', function () {
                    resolve(null, [bufCache, res.headers]);
                });
            });

            req.on('error', function (error) {
                console.log('error:', error);
                reject(error);
            });
            req.end();

        });
    }

    async download(ctx) {
        let params = ctx.query;
        if (!params || !params.figure_url) {
            ctx.status = 400;
            return;
        }

        let figure_url = params.figure_url;
        if (figure_url == 'default.png' || figure_url == 'jiaodie.png' || figure_url.indexOf('upload/boys/') > -1 ||
            figure_url.indexOf('upload/girls/') > -1) {
            ctx.status = 301;
            ctx.redirect(this.genRedirectUrl(ctx.protocol, ctx.host, figure_url));
            ctx.body = 'redirect';
        } else {
            try {
                let [data, headers] = await getRemoteResource(ctx.protocol == 'https', figure_url);
                headers["Access-Control-Allow-Origin"] = "*";
                ctx.response.headers = headers;
                ctx.body = data;
            } catch (error) {
                ctx.status = 400;
                ctx.body = error;
            }

        }
    }


}

module.exports = new DownloadRes;