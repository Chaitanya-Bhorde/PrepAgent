const express = require('express');
const router = express.Router();
const { executeSQLQuery } = require('../controllers/sqlController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

router.post('/execute', executeSQLQuery);

module.exports = router;