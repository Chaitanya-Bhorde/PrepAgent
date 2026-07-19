const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/bookmark', protect, userController.toggleBookmark);
router.get('/bookmarks', protect, userController.getBookmarks);
router.post('/note', protect, userController.saveNote);
router.get('/notes', protect, userController.getNotes);
router.get('/stats', protect, userController.getStats);

module.exports = router;
