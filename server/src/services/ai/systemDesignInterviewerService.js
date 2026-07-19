const { callLLM } = require('./llmConfig');

const SYSTEM_DESIGN_TOPICS = [
  {
    id: 'url-shortener',
    title: 'Design URL Shortener (like TinyURL)',
    description: 'Design a URL shortening service that takes long URLs and generates short, unique aliases. The system should handle millions of URLs and redirects.',
    requirements: ['Generate unique short URLs', 'Handle 100M+ URLs', 'Redirect in <10ms', 'Track analytics', 'Handle high traffic spikes'],
  },
  {
    id: 'chat-system',
    title: 'Design Real-time Chat System (like WhatsApp)',
    description: 'Design a real-time messaging system supporting one-on-one and group chats with message delivery status, online presence, and media sharing.',
    requirements: ['Real-time message delivery', 'Group chats (up to 256 users)', 'Message history', 'Online/offline presence', 'Media file sharing'],
  },
  {
    id: 'rate-limiter',
    title: 'Design API Rate Limiter',
    description: 'Design a rate limiting system that can handle millions of API requests and enforce rate limits per user/IP with different tiers.',
    requirements: ['Sliding window algorithm', 'Distributed rate limiting', 'Different tiers (free/pro/enterprise)', 'Low latency (<1ms overhead)', 'Graceful degradation'],
  },
  {
    id: 'netflix',
    title: 'Design Video Streaming Platform (like Netflix)',
    description: 'Design a video streaming service supporting millions of concurrent viewers with adaptive bitrate streaming, recommendations, and global CDN distribution.',
    requirements: ['Adaptive bitrate streaming', 'CDN content distribution', 'Personalized recommendations', 'User profiles & watch history', 'Global availability with <200ms latency'],
  },
  {
    id: 'ecommerce',
    title: 'Design E-commerce Platform (like Amazon)',
    description: 'Design a large-scale e-commerce platform handling product catalog, shopping cart, orders, payments, and inventory management at global scale.',
    requirements: ['Product catalog with search', 'Shopping cart & checkout', 'Order processing pipeline', 'Inventory management', 'Payment integration'],
  },
];

const getSystemDesignSession = async (userId, topicId) => {
  const topic = SYSTEM_DESIGN_TOPICS.find(t => t.id === topicId) || SYSTEM_DESIGN_TOPICS[0];
  
  const systemPrompt = `You are a Senior System Design Interviewer at a top tech company. You conduct system design interviews for SDE candidates. Your role is to:
1. Present the design problem
2. Guide the candidate through the design process (requirements, estimations, data model, API design, high-level design, deep dives)
3. Ask probing questions about trade-offs, scalability, and bottlenecks
4. Evaluate their understanding of distributed systems concepts

Current topic: ${topic.title}
Description: ${topic.description}

Requirements to cover:
${topic.requirements.map(r => `- ${r}`).join('\n')}

Be professional, thorough, and realistic. Start by presenting the problem and asking the candidate how they would approach it.`;

  return {
    greeting: `Welcome to the System Design round. Today, I'd like you to design a ${topic.title.toLowerCase()}. ${topic.description}\n\nLet's start with the requirements. What functional and non-functional requirements would you consider for this system?`,
    topic,
    sender: 'system_design_interviewer',
    suggestions: [
      'What are the key functional requirements?',
      'What scale should we design for?',
      'I\'ll start with the data model first.',
      'Let me think about the API design.',
    ],
  };
};

const processSystemDesignTurn = async (session, userMessage) => {
  const systemPrompt = `You are a Senior System Design Interviewer. The candidate is designing: ${session.topic.title}

Guide them through: requirements → estimations → data model → API → high-level design → deep dives.

Ask probing questions about trade-offs. Don't give them the solution, help them discover it.

Be concise but thorough. Challenge their assumptions.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...session.chatHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await callLLM(messages);

  const promptCount = session.chatHistory.filter(m => m.role === 'user').length;
  let suggestions;
  if (promptCount < 3) {
    suggestions = [
      'What database would you choose and why?',
      'How would you handle scaling?',
      'What are the trade-offs of your approach?',
    ];
  } else {
    suggestions = [
      'Let me reconsider the data model.',
      'I think we need caching here.',
      'How does this handle failure scenarios?',
    ];
  }

  return { response, sender: 'system_design_interviewer', suggestions };
};

module.exports = { getSystemDesignSession, processSystemDesignTurn, SYSTEM_DESIGN_TOPICS };