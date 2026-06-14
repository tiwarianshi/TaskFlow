const express = require('express')
const {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
  protectedTest,
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)
router.get('/protected', protect, protectedTest)

module.exports = router
