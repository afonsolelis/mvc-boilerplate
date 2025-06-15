const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/refresh', authController.refreshSession);

module.exports = router;