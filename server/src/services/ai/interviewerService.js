const { callLLM } = require('./llmConfig');
const Question = require('../../models/Question');
const InterviewSession = require('../../models/InterviewSession');

/**
 * Generate AI response for an interview turn
 * @param {string} sessionId - The database session ID
 * @param {string} userMessage - The candidate's response
 * @returns {Promise<Object>} - Contains response text, sender, suggestions, and updated status
 */
const processInterviewTurn = async (sessionId, userMessage) => {
  const session = await InterviewSession.findById(sessionId).populate('questionId');
  if (!session) {
    throw new Error('Interview session not found');
  }

  // Append user's message to chat history
  if (userMessage) {
    session.chatHistory.push({
      role: 'user',
      content: userMessage,
      sender: 'candidate'
    });
  }

  const question = session.questionId;
  const chatHistory = session.chatHistory;
  const currentCode = session.currentCode;

  // Determine interviewer phase
  let currentInterviewer = 'dsa_interviewer';
  let phasePrompt = '';
  
  const userMessageCount = chatHistory.filter(m => m.role === 'user').length;
  
  if (userMessageCount <= 1) {
    currentInterviewer = 'dsa_interviewer';
    phasePrompt = `Phase: Introduction. Greet the candidate professionally, introduce yourself as the DSA Technical Panelist, and present this coding problem:
    
    TITLE: ${question.title}
    DESCRIPTION: ${question.description}
    
    Ask them to explain their initial approach and logic before writing any code in the editor.`;
  } else if (session.status === 'completed') {
    currentInterviewer = 'hr_interviewer';
    phasePrompt = `Phase: Wrap up. The interview is already completed. Thank the user, wish them luck in placement, and tell them their scorecard is generated.`;
  } else {
    // Simple state routing
    const hasCode = currentCode && currentCode.length > 50;
    
    if (userMessage.toLowerCase().includes('complete') || userMessage.toLowerCase().includes('finish') || userMessageCount > 8) {
      currentInterviewer = 'hr_interviewer';
      phasePrompt = `Phase: Behavioral/HR Round. Transition from technical coding to HR round. Ask a common HR behavioral placement question (e.g. "Tell me about a time you faced a bug you couldn't solve", "How do you handle deadline stress?").`;
    } else {
      currentInterviewer = 'dsa_interviewer';
      phasePrompt = `Phase: Active Coding. The candidate is writing code. Review their current code:
      
      \`\`\`
      ${currentCode}
      \`\`\`
      
      Review the chat history. Guide them, ask clarifying questions about their logic, point out edge-cases, or suggest optimizations. Keep them focused on coding.`;
    }
  }

  // System Prompt constructing the panelist persona
  const systemPrompt = `You are an AI Interviewer Panelist conducting a professional campus placement mock technical interview for a Software Engineer role.
  You speak concisely, professionally, and realistically. Avoid long paragraphs. Act like a real interviewer.
  
  Current Panelist Persona: ${currentInterviewer === 'dsa_interviewer' ? 'DSA Specialist (technical, focuses on algorithm correctness and speed)' : 'HR Panelist (behavioral, friendly but evaluative)'}
  
  ${phasePrompt}
  
  Constraints:
  * Do NOT give the complete solution code.
  * Point out mistakes gently, ask leading questions to help them fix bugs.
  * Talk in a conversational corporate tone.`;

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // Include last 8 messages of chat history for context
  const recentHistory = chatHistory.slice(-8);
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  const responseContent = await callLLM(messages);

  // Append assistant message to history
  session.chatHistory.push({
    role: 'assistant',
    content: responseContent,
    sender: currentInterviewer
  });

  // Calculate suggested replies for candidate
  const suggestions = getSuggestions(currentInterviewer, userMessageCount);

  // Save session state
  await session.save();

  return {
    response: responseContent,
    sender: currentInterviewer,
    suggestions,
    sessionId: session._id
  };
};

/**
 * Generate quick suggestions for the user UI
 */
function getSuggestions(interviewer, turnCount) {
  if (interviewer === 'dsa_interviewer') {
    if (turnCount <= 1) {
      return ['I will use a HashMap for O(1) lookups.', 'My approach is to use nested loops.', 'Can you explain the problem details?'];
    }
    return ['I have written the code, can we run it?', 'I am stuck, can you give me a hint?', 'How can I optimize this further?'];
  } else {
    return ['I handle stress by prioritizing tasks.', 'I once solved a critical production issue.', 'Thank you for the interview.'];
  }
}

module.exports = { processInterviewTurn };
