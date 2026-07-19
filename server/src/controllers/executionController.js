const { executeCode } = require('../services/sandboxService');
const { updateCodingStats } = require('../services/placementScoreService');

const runCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code, language, stdin = '' } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }
    if (!language) {
      return res.status(400).json({ message: 'Language is required' });
    }
    
    const result = await executeCode(code, language, stdin);
    
    // Update coding stats asynchronously
    if (userId) {
      updateCodingStats(userId, {
        success: result.success,
        language: language,
        difficulty: 'medium', // Default difficulty, can be enhanced
        timeSpent: result.executionTime / 1000, // Convert to seconds
        problemId: req.body.problemId || null
      }).catch(err => console.error('Failed to update coding stats:', err));
    }
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      output: '', 
      error: error.message, 
      exitCode: -1, 
      executionTime: 0 
    });
  }
};

module.exports = { runCode };
