const Redis = require('ioredis');
const UserPerformance = require('../models/UserPerformance');
const User = require('../models/User');

let redis = null;
let isRedisConnected = false;

// Attempt Redis connection
try {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || 6379;
  
  console.log(`🔌 Attempting connection to Redis Leaderboard on ${host}:${port}...`);
  
  redis = new Redis({
    host,
    port,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000
  });

  redis.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Redis connected successfully for Leaderboard cache.');
  });

  redis.on('error', (err) => {
    isRedisConnected = false;
  });
} catch (err) {
  console.warn('⚠️ Redis connection failed. Leaderboard queries will use MongoDB fallback.');
}

const LEADERBOARD_KEY = 'prepagent:leaderboard';

// Update user score in leaderboard
const updateLeaderboardScore = async (userId, score) => {
  if (isRedisConnected && redis) {
    try {
      await redis.zadd(LEADERBOARD_KEY, score, userId.toString());
      console.log(`📡 [Redis Leaderboard] Updated score for user ${userId}: ${score}`);
      return;
    } catch (err) {
      console.error('❌ Redis ZADD failed, using DB storage only:', err.message);
    }
  }
};

// Retrieve Leaderboard entries
const getLeaderboard = async (limit = 10, category = 'overall', college = null) => {
  // If Redis is active and query is overall
  if (isRedisConnected && redis && category === 'overall' && !college) {
    try {
      console.log('📡 Fetching Leaderboard ranks from Redis sorted set...');
      const userIds = await redis.zrevrange(LEADERBOARD_KEY, 0, limit - 1, 'WITHSCORES');
      
      const leaderboard = [];
      for (let i = 0; i < userIds.length; i += 2) {
        const userId = userIds[i];
        const score = parseFloat(userIds[i + 1]);
        
        const user = await User.findById(userId).select('name email college');
        if (user) {
          leaderboard.push({
            userId,
            name: user.name,
            college: user.college,
            score,
            rank: Math.floor(i / 2) + 1
          });
        }
      }
      return leaderboard;
    } catch (err) {
      console.error('❌ Redis Leaderboard retrieval failed. Falling back to DB...', err.message);
    }
  }

  // Fallback: Query MongoDB
  console.log('📡 Fetching Leaderboard ranks from MongoDB fallback...');
  let query = {};
  
  // If querying by college
  if (college) {
    const collegeUsers = await User.find({ college: new RegExp(college, 'i') }).select('_id');
    const userIds = collegeUsers.map(u => u._id);
    query = { userId: { $in: userIds } };
  }

  let sortKey = 'overallPlacementReadinessScore';
  if (category === 'coding') sortKey = 'codingStats.totalProblemsSolved';
  if (category === 'sql') sortKey = 'sqlStats.successfulQueries';
  if (category === 'interview') sortKey = 'interviewStats.averageScore';

  const performances = await UserPerformance.find(query)
    .populate('userId', 'name email college')
    .sort({ [sortKey]: -1 })
    .limit(limit);

  return performances.map((p, idx) => ({
    userId: p.userId?._id,
    name: p.userId?.name || 'Anonymous Student',
    college: p.userId?.college || 'N/A',
    score: category === 'coding' 
      ? p.codingStats.totalProblemsSolved 
      : category === 'sql' 
      ? p.sqlStats.successfulQueries 
      : category === 'interview' 
      ? p.interviewStats.averageScore 
      : p.overallPlacementReadinessScore,
    rank: idx + 1
  }));
};

module.exports = {
  updateLeaderboardScore,
  getLeaderboard
};
