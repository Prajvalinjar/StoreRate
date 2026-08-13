const express = require('express');
const { register, login, getMe, handleChangePassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, handleChangePassword);

module.exports = router;
