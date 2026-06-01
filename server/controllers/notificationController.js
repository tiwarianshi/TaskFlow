const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')
const Notification = require('../models/Notification')

const getNotifications = asyncHandler(async (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10)
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(rawLimit, 100))
      : 20

    const notifications = await Notification.find({ user: req.user })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name avatar')

    res.status(200).json(notifications)
  } catch (error) {
    res.status(500)
    throw new Error('Failed to fetch notifications')
  }
})

const getUnreadCount = asyncHandler(async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user,
      isRead: false,
    })

    res.status(200).json({ count })
  } catch (error) {
    res.status(500)
    throw new Error('Failed to fetch unread notification count')
  }
})

const markNotificationRead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400)
      throw new Error('Invalid notification id')
    }

    const notification = await Notification.findById(id)

    if (!notification) {
      res.status(404)
      throw new Error('Notification not found')
    }

    if (notification.user.toString() !== req.user) {
      res.status(403)
      throw new Error('Not authorized to modify this notification')
    }

    if (!notification.isRead) {
      notification.isRead = true
      await notification.save()
    }

    const populatedNotification = await Notification.findById(id).populate(
      'sender',
      'name avatar',
    )

    res.status(200).json(populatedNotification)
  } catch (error) {
    if (!res.headersSent) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode)
    }
    throw error
  }
})

const markAllRead = asyncHandler(async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user, isRead: false },
      { $set: { isRead: true } },
    )

    res.status(200).json({
      modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
    })
  } catch (error) {
    res.status(500)
    throw new Error('Failed to mark notifications as read')
  }
})

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
}
