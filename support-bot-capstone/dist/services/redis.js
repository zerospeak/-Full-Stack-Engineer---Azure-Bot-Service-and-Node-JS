"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = exports.connectToRedis = void 0;
const redis_1 = require("redis");
let redisClient;
async function connectToRedis() {
    try {
        const uri = process.env.REDIS_URI || 'redis://localhost:6379';
        redisClient = (0, redis_1.createClient)({ url: uri });
        redisClient.on('error', (err) => console.error('Redis Client Error', err));
        await redisClient.connect();
        console.log('Connected to Redis successfully');
    }
    catch (error) {
        console.error('Redis connection error:', error);
        throw error;
    }
}
exports.connectToRedis = connectToRedis;
function getRedisClient() {
    return redisClient;
}
exports.getRedisClient = getRedisClient;
//# sourceMappingURL=redis.js.map