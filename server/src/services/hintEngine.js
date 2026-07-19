const { callLLM } = require('./ai/llmConfig');

/**
 * Generate progressive hints for coding problems
 * @param {string} problemTitle - The problem title
 * @param {string} problemDescription - The problem description
 * @param {string} userCode - Current user code
 * @param {number} hintLevel - Level of hint (1-3, where 3 is most detailed)
 * @returns {Promise<string>} - Progressive hint
 */
const generateHint = async (problemTitle, problemDescription, userCode, hintLevel = 1) => {
  try {
    const systemPrompt = `You are a helpful coding interview assistant. Provide progressive hints to help candidates solve problems WITHOUT giving away the complete solution.

    Hint Levels:
    - Level 1: Conceptual guidance (what data structure/algorithm to consider)
    - Level 2: Approach guidance (step-by-step approach without code)
    - Level 3: Implementation guidance (pseudocode or specific implementation details)
    
    Keep hints concise (2-3 sentences max). Be encouraging but professional.`;

    const userPrompt = `Problem: ${problemTitle}
    Description: ${problemDescription}
    
    Current Code:
    ${userCode || 'No code written yet'}
    
    Provide a Level ${hintLevel} hint to help the candidate progress.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const hint = await callLLM(messages);
    return hint.trim();
  } catch (error) {
    console.error('Error generating hint:', error);
    return getDefaultHint(hintLevel);
  }
};

/**
 * Get default hint if AI fails
 */
function getDefaultHint(level) {
  const hints = {
    1: "Think about what data structure would give you O(1) or O(log n) lookup time for this problem.",
    2: "Consider using a hash map or two-pointer technique. What are you trying to optimize?",
    3: "Try iterating through the array once while storing seen values. Check if the complement exists in your storage."
  };
  return hints[level] || hints[1];
}

/**
 * Analyze code and provide feedback
 */
const analyzeCode = async (code, language, problemTitle) => {
  try {
    const systemPrompt = `You are a code reviewer. Analyze the provided code and give brief, constructive feedback.
    Focus on:
    1. Time complexity
    2. Space complexity
    3. Potential bugs or edge cases
    4. Code style and readability
    
    Keep feedback concise (3-4 bullet points max).`;

    const userPrompt = `Problem: ${problemTitle}
    Language: ${language}
    
    Code:
    ${code}
    
    Provide brief analysis focusing on complexity and potential issues.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const feedback = await callLLM(messages);
    return feedback.trim();
  } catch (error) {
    console.error('Error analyzing code:', error);
    return "Unable to analyze code at this time. Please try again.";
  }
};

module.exports = {
  generateHint,
  analyzeCode
};