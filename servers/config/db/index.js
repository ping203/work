const VERSION_KEY = require('../versions').VERSION_KEY;
const PUB = require('../versions').PUB;

module.exports = {
    redis:require(`./${VERSION_KEY[PUB]}/redis.json`),
    mysql:require(`./${VERSION_KEY[PUB]}/mysql.json`)
};