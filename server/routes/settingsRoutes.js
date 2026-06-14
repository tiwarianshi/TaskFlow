const express = require('express')
const {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
} = require('../controllers/settingsController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile)

router.put('/password', protect, changePassword)

router
  .route('/preferences')
  .get(protect, getPreferences)
  .put(protect, updatePreferences)

module.exports = router
