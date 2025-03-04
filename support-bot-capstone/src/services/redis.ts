import { createClient } from 'redis';

let redisClient: any;

export async function connectToRedis(): Promise<void> {
  try {
    const uri = process.env.REDIS_URI || 'redis://localhost:6379';
    redisClient = createClient({ url: uri });
    
    redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));
    
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}

export function getRedisClient() {
  return redisClient;
}