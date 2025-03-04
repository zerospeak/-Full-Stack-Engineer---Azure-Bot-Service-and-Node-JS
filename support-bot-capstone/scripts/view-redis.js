const redis = require('redis');
require('dotenv').config();

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function displayRedisData() {
  try {
    await client.connect();
    console.log('Connected to Redis');
    
    console.log('\n===== REDIS SESSION DATA =====\n');
    
    // Get all keys (you might want to filter by pattern)
    const keys = await client.keys('session:*');
    
    if (keys.length === 0) {
      console.log('No session data found in Redis.');
    } else {
      for (const key of keys) {
        const value = await client.get(key);
        console.log(`Key: ${key}`);
        try {
          // Try to parse as JSON if possible
          const parsed = JSON.parse(value);
          console.log('Value:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          // Otherwise display as string
          console.log('Value:', value);
        }
        console.log('-----------------------------------');
      }
    }
    
    await client.quit();
  } catch (error) {
    console.error('Error accessing Redis:', error);
    client.quit();
  }
}

displayRedisData();