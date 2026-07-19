const express = require('express');
const router = express.Router();
const { generateHint, analyzeCode } = require('../services/hintEngine');
const { protect } = require('../middleware/auth');

// @route   POST /api/hints/generate
// @desc    Generate progressive hint for coding problem
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { problemTitle, problemDescription, userCode, hintLevel } = req.body;
    
    if (!problemTitle) {
      return res.status(400).json({ message: 'Problem title is required' });
    }

    const hint = await generateHint(
      problemTitle, 
      problemDescription, 
      userCode, 
      hintLevel || 1
    );

    res.status(200).json({ hint, level: hintLevel || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/hints/analyze
// @desc    Analyze code and provide feedback
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  try {
    const { code, language, problemTitle } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const feedback = await analyzeCode(code, language, problemTitle);

    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;