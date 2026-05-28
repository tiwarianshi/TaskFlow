const express = require('express')
const { registerUser, loginUser, protectedTest } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/protected', protect, protectedTest)

module.exports = router
