const express = require('express');
const router = express.Router();
const { getSQLProblems, getSQLProblem } = require('../controllers/sqlProblemController');

// @route   GET /api/sql-problems
// @desc    Get all SQL problems
// @access  Public
router.get('/', getSQLProblems);

// @route   GET /api/sql-problems/:id
// @desc    Get single SQL problem
// @access  Public
router.get('/:id', getSQLProblem);

module.exports = router;