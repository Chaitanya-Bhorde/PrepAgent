const UserPerformance = require('../models/UserPerformance');
const Submission = require('../models/Submission');

// Topic-to-category mapping for analytics
const TOPIC_MAP = {
  'array': 'Arrays & Hashing',
  'hash': 'Arrays & Hashing',
  'string': 'Strings',
  'two pointer': 'Two Pointers',
  'sliding window': 'Sliding Window',
  'binary search': 'Binary Search',
  'tree': 'Trees',
  'graph': 'Graphs',
  'dp': 'Dynamic Programming',
  'dynamic programming': 'Dynamic Programming',
  'linked list': 'Linked Lists',
  'stack': 'Stacks & Queues',
  'queue': 'Stacks & Queues',
  'heap': 'Heaps',
  'greedy': 'Greedy',
  'backtracking': 'Backtracking',
  'sort': 'Sorting',
  'recursion': 'Recursion',
  'sql': 'SQL',
  'database': 'Database Design',
  'system design': 'System Design',
  'design': 'System Design',
};

const analyzeWeakTopics = async (userId) => {
  try {
    const performance = await UserPerformance.findOne({ userId });
    if (!performance) return [];

    const submissions = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(50);
    
    // Track per-topic performance
    const topicStats = {};
    
    for (const sub of submissions) {
      const topic = mapToTopic(sub.title || sub.questionId || '');
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, success: 0, failed: 0 };
      }
      topicStats[topic].total++;
      if (sub.status === 'ACCEPTED' || sub.status === 'SUCCESS') {
        topicStats[topic].success++;
      } else {
        topicStats[topic].failed++;
      }
    }

    // Identify weak topics (success rate < 50% or high failure count)
    const weakTopics = [];
    for (const [topic, stats] of Object.entries(topicStats)) {
      const successRate = stats.success / stats.total;
      if (successRate < 0.5 && stats.total >= 3) {
        weakTopics.push(topic);
      }
    }

    // Update UserPerformance
    if (weakTopics.length > 0) {
      performance.weakTopics = weakTopics;
      
      // Identify strong topics (success rate > 80%)
      const strongTopics = [];
      for (const [topic, stats] of Object.entries(topicStats)) {
        const successRate = stats.success / stats.total;
        if (successRate > 0.8 && stats.total >= 3) {
          strongTopics.push(topic);
        }
      }
      performance.strongTopics = strongTopics;
      
      await performance.save();
    }

    return weakTopics;
  } catch (error) {
    console.error('Error analyzing weak topics:', error);
    return [];
  }
};

const mapToTopic = (text) => {
  const lower = text.toLowerCase();
  for (const [keyword, topic] of Object.entries(TOPIC_MAP)) {
    if (lower.includes(keyword)) return topic;
  }
  return 'General';
};

const getPersonalizedRecommendations = async (userId) => {
  const weakTopics = await analyzeWeakTopics(userId);
  const performance = await UserPerformance.findOne({ userId });
  
  const recommendations = [];

  if (weakTopics.includes('Dynamic Programming')) {
    recommendations.push('Practice DP problems starting with Fibonacci, then move to knapSack and LCS patterns');
  }
  if (weakTopics.includes('Graphs')) {
    recommendations.push('Focus on BFS/DFS traversal, then practice shortest path and topological sort');
  }
  if (weakTopics.includes('Trees')) {
    recommendations.push('Master tree traversals (inorder, preorder, postorder) and recursion patterns');
  }
  if (weakTopics.includes('SQL')) {
    recommendations.push('Practice JOIN operations, subqueries, and window functions');
  }
  if (weakTopics.includes('System Design')) {
    recommendations.push('Study distributed systems concepts: caching, load balancing, database sharding');
  }

  if (recommendations.length === 0 && performance?.codingStats?.totalProblemsSolved > 0) {
    recommendations.push('Great progress! Try solving medium and hard problems to challenge yourself');
  }

  return { weakTopics, recommendations };
};

module.exports = { analyzeWeakTopics, getPersonalizedRecommendations };