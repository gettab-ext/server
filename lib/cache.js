const Promise = require("bluebird");
const redis = require('redis');
const config = require('../etc/config');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient(config.redisServer);

module.exports = redisClient;
