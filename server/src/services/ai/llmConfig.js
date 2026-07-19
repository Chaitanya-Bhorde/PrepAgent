const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');
} catch {
  // Will use fallback responses
}

const callLLM = async (messages) => {
  // Try Gemini first
  if (genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo-key') {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error('Gemini API error:', err.message);
    }
  }

  // Fallback: return intelligent response based on last message
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';

  if (systemMsg.includes('System Design')) {
    return generateSystemDesignResponse(lastUserMsg);
  }
  if (systemMsg.includes('HR')) {
    return generateHRResponse(lastUserMsg);
  }
  return generateDSAResponse(lastUserMsg);
};

function generateDSAResponse(userMsg) {
  if (userMsg.toLowerCase().includes('hint') || userMsg.toLowerCase().includes('stuck')) {
    return "Let me point you in the right direction. Think about what data structure gives you O(1) lookup time. A hash map could help you track values you've already seen. Can you tell me what you've tried so far?";
  }
  if (userMsg.toLowerCase().includes('complexity') || userMsg.toLowerCase().includes('optimize')) {
    return "Great question about optimization! First, let's analyze your current approach. What's the time complexity of your solution? We can then discuss trade-offs between different approaches like using extra space vs. reducing time complexity.";
  }
  return "I understand your approach. Let me ask you this: have you considered edge cases like an empty array or duplicate values? Make sure your solution handles those. Also, try to think about the problem from the perspective of the optimal algorithm.";
}

function generateHRResponse(userMsg) {
  if (userMsg.toLowerCase().includes('stress') || userMsg.toLowerCase().includes('deadline')) {
    return "That's a great example! I can see you handle pressure well. Let me dig deeper — how do you prioritize tasks when everything is urgent? Walk me through your decision-making process.";
  }
  if (userMsg.toLowerCase().includes('team') || userMsg.toLowerCase().includes('conflict')) {
    return "Excellent! Handling team conflicts is crucial in software engineering. Can you tell me about a specific situation where you had to disagree with a teammate's technical approach? How did you resolve it?";
  }
  return "Thank you for sharing that. In a placement context, hiring managers look for candidates who can communicate clearly and show self-awareness. Could you tell me about a time you received constructive criticism and how you acted on it?";
}

function generateSystemDesignResponse(userMsg) {
  if (userMsg.toLowerCase().includes('design') || userMsg.toLowerCase().includes('architecture')) {
    return "Let's think about this systematically. Start with the requirements — what are the functional and non-functional requirements? Then consider the data model, API design, and how you'd handle scale. Would you like me to guide you through each step?";
  }
  if (userMsg.toLowerCase().includes('database') || userMsg.toLowerCase().includes('storage')) {
    return "Good question about storage! Consider your access patterns first. Would you need a relational database for ACID compliance, or would a NoSQL solution work better for your use case? What about caching with Redis for hot data?";
  }
  return "Let's start high-level. What's the scale we're designing for? 1000 users or 10 million? That changes everything — from database sharding to load balancing to CDN strategy. Walk me through your initial thoughts.";
}

module.exports = { callLLM };