const COMPANY_SQL_PROBLEMS = require('../seeds/companySqlSeeds');

// @desc    Get all SQL problems
// @route   GET /api/sql-problems
// @access  Public
const getSQLProblems = async (req, res) => {
  try {
    const { company, difficulty, search } = req.query;
    
    let problems = [...COMPANY_SQL_PROBLEMS];
    
    // Filter by company if provided
    if (company && company !== 'all') {
      problems = problems.filter(p => p.company.toLowerCase() === company.toLowerCase());
    }
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      problems = problems.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.company.toLowerCase().includes(searchLower)
      );
    }
    
    // Add difficulty based on problem ID pattern
    const problemsWithDifficulty = problems.map(problem => {
      let difficulty = 'EASY';
      const idNum = parseInt(problem.id.split('-')[1] || '1');
      if (idNum > 20) difficulty = 'HARD';
      else if (idNum > 10) difficulty = 'MEDIUM';
      
      return {
        ...problem,
        difficulty,
        solution: problem.starterQuery,
        tableSchema: problem.schema
      };
    });
    
    res.status(200).json({
      success: true,
      count: problemsWithDifficulty.length,
      data: problemsWithDifficulty
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single SQL problem
// @route   GET /api/sql-problems/:id
// @access  Public
const getSQLProblem = async (req, res) => {
  try {
    const problem = COMPANY_SQL_PROBLEMS.find(p => p.id === req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'SQL problem not found' });
    }
    
    // Add difficulty based on problem ID
    const idNum = parseInt(problem.id.split('-')[1] || '1');
    let difficulty = 'EASY';
    if (idNum > 20) difficulty = 'HARD';
    else if (idNum > 10) difficulty = 'MEDIUM';
    
    const problemWithMeta = {
      ...problem,
      difficulty,
      solution: problem.starterQuery,
      tableSchema: problem.schema
    };
    
    res.status(200).json({
      success: true,
      data: problemWithMeta
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSQLProblems,
  getSQLProblem
};