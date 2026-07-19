const Redis = require('ioredis');

let redis = null;
let connectionErrorLogged = false;
try {
  redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000
  });

  redis.on('error', (err) => {
    if (!connectionErrorLogged) {
      console.warn('⚠️ Redis Rate Limiter Connection Error (limits will be bypassed):', err.message);
      connectionErrorLogged = true;
    }
  });
  
  redis.on('connect', () => {
    console.log('🔌 Connected to Redis for API Rate Limiting');
    connectionErrorLogged = false;
  });
} catch (error) {
  console.warn('⚠️ Failed to initialize Redis client:', error.message);
}

/**
 * Redis-based API Rate Limiter Middleware
 * Limits requests per IP per minute
 * @param {number} limit - Maximum requests allowed per window
 * @param {number} windowSeconds - Duration of the limit window in seconds
 */
const rateLimiter = (limit = 5, windowSeconds = 60) => {
  return async (req, res, next) => {
    // Fail-safe: bypass rate limiter if Redis server is down
    if (!redis || redis.status !== 'ready') {
      return next();
    }

    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const key = `ratelimit:${ip}:${req.originalUrl}`;
      
      const current = await redis.get(key);
      const requestCount = current ? parseInt(current, 10) : 0;

      if (requestCount >= limit) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          success: false,
          message: 'Too Many Requests',
          error: `API rate limit exceeded. Please try again in ${ttl > 0 ? ttl : windowSeconds} seconds.`,
          limit,
          remaining: 0
        });
      }

      // Increment counter and update TTL using transaction pipeline
      await redis.multi()
        .incr(key)
        .expire(key, windowSeconds)
        .exec();

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - requestCount - 1));

      next();
    } catch (err) {
      console.error('Rate Limiter Error:', err.message);
      next(); // Fail-safe: bypass on internal error
    }
  };
};

module.exports = { rateLimiter, redisClient: redis };
