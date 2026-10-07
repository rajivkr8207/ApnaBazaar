import { Redis } from 'ioredis';
import Config from './Config.js';

const redis = new Redis({
  host: Config.redis_host || '127.0.0.1',
  port: parseInt(Config.redis_port, 10) || 6379,
  password: Config.redis_password || undefined,
  maxRetriesPerRequest: null,
});
//
redis.on('connect', () => {
  console.log(`server is connected to redis`);
});

redis.on('error', (err) => {
  console.log(err);
});

export default redis;
