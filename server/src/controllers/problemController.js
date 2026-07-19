const Problem = require('../models/Problem');

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = async (req, res) => {
  try {
    const { difficulty, category, search } = req.query;
    
    let query = {};
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty.toLowerCase();
    }
    
    if (category && category !== 'all') {
      query.category = new RegExp(category, 'i');
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }
    
    const problems = await Problem.find(query).sort({ difficulty: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { getRecommendedDifficulty } = require('../services/dynamicDifficultyService');

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommended difficulty and problems
// @route   GET /api/problems/recommend
// @access  Private
const getRecommend = async (req, res) => {
  try {
    const userId = req.user._id;
    const difficulty = await getRecommendedDifficulty(userId);
    
    // Fetch 5 problems of recommended difficulty
    const problems = await Problem.find({ difficulty }).limit(5);
    
    return res.status(200).json({
      success: true,
      recommendedDifficulty: difficulty,
      data: problems
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProblems,
  getProblem,
  getRecommend,
  createProblem
};