const redis = require('redis');
require('dotenv').config();

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function showRedisStructure() {
  try {
    await client.connect();
    console.log('Connected to Redis');
    
    console.log('\n===== REDIS DATABASE STRUCTURE =====\n');
    
    // Get server info
    const info = await client.info();
    console.log('Redis Server Info:');
    console.log(info.split('\n').filter(line => 
      line.includes('redis_version') || 
      line.includes('connected_clients') ||
      line.includes('used_memory_human') ||
      line.includes('db')
    ).join('\n'));
    
    console.log('\n===== REDIS KEYS =====\n');
    
    // Get all keys
    const keys = await client.keys('*');
    
    if (keys.length === 0) {
      console.log('No keys found in Redis.');
    } else {
      console.log(`Total keys: ${keys.length}`);
      
      // Group keys by pattern
      const patterns = {};
      for (const key of keys) {
        const pattern = key.split(':')[0] || 'other';
        if (!patterns[pattern]) {
          patterns[pattern] = [];
        }
        patterns[pattern].push(key);
      }
      
      // Show key patterns and sample data
      for (const [pattern, patternKeys] of Object.entries(patterns)) {
        console.log(`\nPattern: ${pattern}* (${patternKeys.length} keys)`);
        
        // Show sample keys
        const sampleKey = patternKeys[0];
        console.log(`Sample key: ${sampleKey}`);
        
        // Get type and value
        const type = await client.type(sampleKey);
        console.log(`Type: ${type}`);
        
        // Show sample value based on type
        if (type === 'string') {
          const value = await client.get(sampleKey);
          console.log('Sample value:');
          try {
            console.log(JSON.stringify(JSON.parse(value), null, 2));
          } catch {
            console.log(value);
          }
        } else if (type === 'hash') {
          const value = await client.hGetAll(sampleKey);
          console.log('Sample value:', value);
        } else if (type === 'list') {
          const value = await client.lRange(sampleKey, 0, 5);
          console.log('Sample values (first 5):', value);
        } else if (type === 'set') {
          const value = await client.sMembers(sampleKey);
          console.log('Sample members:', value);
        }
      }
    }
    
    await client.quit();
  } catch (error) {
    console.error('Error accessing Redis:', error);
    client.quit();
  }
}

showRedisStructure();