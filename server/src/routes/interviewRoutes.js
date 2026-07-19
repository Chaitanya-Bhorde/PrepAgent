const express = require('express');
const router = express.Router();
const { 
  startSession, 
  sendMessage, 
  getQuestions, 
  saveSnapshot, 
  getSessions, 
  getSessionDetails, 
  SYSTEM_DESIGN_TOPICS 
} = require('../controllers/interviewController');

router.get('/questions', getQuestions);
router.post('/start', startSession);
router.post('/message', sendMessage);
router.post('/snapshot', saveSnapshot);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionDetails);

router.get('/system-design/topics', (req, res) => {
  res.status(200).json(SYSTEM_DESIGN_TOPICS);
});

module.exports = router;