const express = require('express')
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  protectedTest,
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)
router.get('/protected', protect, protectedTest)

module.exports = router
