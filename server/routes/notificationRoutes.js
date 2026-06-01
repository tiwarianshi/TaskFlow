const express = require('express')
const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notificationController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getNotifications)
router.get('/unread-count', protect, getUnreadCount)
router.patch('/read-all', protect, markAllRead)
router.patch('/:id/read', protect, markNotificationRead)

module.exports = router
