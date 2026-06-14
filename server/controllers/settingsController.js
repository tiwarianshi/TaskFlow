const asyncHandler = require('express-async-handler')
const User = require('../models/User')

const DEFAULT_PREFERENCES = {
  notificationsEnabled: true,
  soundEnabled: false,
  defaultView: 'kanban',
  enableNotifications: true,
  enableSoundAlerts: false,
  theme: 'dark',
  defaultBoardView: 'kanban',
}

const VALID_THEMES = ['dark', 'system', 'light']
const VALID_BOARD_VIEWS = ['kanban', 'calendar']

function normalizeProfile(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function normalizePreferences(preferences = {}) {
  const source = typeof preferences.toObject === 'function'
    ? preferences.toObject()
    : preferences

  const notificationsEnabled =
    source.notificationsEnabled ?? source.enableNotifications ?? DEFAULT_PREFERENCES.notificationsEnabled
  const soundEnabled =
    source.soundEnabled ?? source.enableSoundAlerts ?? DEFAULT_PREFERENCES.soundEnabled
  const defaultView =
    source.defaultView ?? source.defaultBoardView ?? DEFAULT_PREFERENCES.defaultView

  return {
    notificationsEnabled,
    soundEnabled,
    theme: source.theme ?? DEFAULT_PREFERENCES.theme,
    defaultView,
    enableNotifications: notificationsEnabled,
    enableSoundAlerts: soundEnabled,
    defaultBoardView: defaultView,
  }
}

function validateAvatarUrl(avatar) {
  if (!avatar) return true

  try {
    const parsedUrl = new URL(avatar)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user).select('_id name email avatar createdAt updatedAt')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.status(200).json(normalizeProfile(user))
})

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body || {}
  const trimmedName = name?.trim()
  const normalizedAvatar = avatar?.trim() || null

  if (!trimmedName) {
    res.status(400)
    throw new Error('Name is required')
  }

  if (trimmedName.length < 2) {
    res.status(400)
    throw new Error('Name must be at least 2 characters')
  }

  if (trimmedName.length > 60) {
    res.status(400)
    throw new Error('Name must be 60 characters or less')
  }

  if (!validateAvatarUrl(normalizedAvatar)) {
    res.status(400)
    throw new Error('Avatar URL must use http or https')
  }

  const user = await User.findByIdAndUpdate(
    req.user,
    {
      name: trimmedName,
      avatar: normalizedAvatar,
    },
    { new: true, runValidators: true },
  ).select('_id name email avatar createdAt updatedAt')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.status(200).json(normalizeProfile(user))
})

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {}

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400)
    throw new Error('Please provide all password fields')
  }

  if (newPassword.length < 6) {
    res.status(400)
    throw new Error('New password must be at least 6 characters')
  }

  if (newPassword !== confirmPassword) {
    res.status(400)
    throw new Error('New password and confirmation do not match')
  }

  const user = await User.findById(req.user)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const currentPasswordValid = await user.comparePassword(currentPassword)

  if (!currentPasswordValid) {
    res.status(400)
    throw new Error('Current password is incorrect')
  }

  user.password = newPassword
  await user.save()

  res.status(200).json({ message: 'Password updated successfully' })
})

const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user).select('preferences')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.status(200).json(normalizePreferences(user.preferences))
})

const updatePreferences = asyncHandler(async (req, res) => {
  const {
    notificationsEnabled,
    soundEnabled,
    defaultView,
    enableNotifications,
    enableSoundAlerts,
    theme,
    defaultBoardView,
  } = req.body || {}

  const updates = {}
  const nextNotificationsEnabled = notificationsEnabled ?? enableNotifications
  const nextSoundEnabled = soundEnabled ?? enableSoundAlerts
  const nextDefaultView = defaultView ?? defaultBoardView

  if (nextNotificationsEnabled !== undefined) {
    if (typeof nextNotificationsEnabled !== 'boolean') {
      res.status(400)
      throw new Error('Enable notifications must be true or false')
    }

    updates['preferences.notificationsEnabled'] = nextNotificationsEnabled
    updates['preferences.enableNotifications'] = nextNotificationsEnabled
  }

  if (nextSoundEnabled !== undefined) {
    if (typeof nextSoundEnabled !== 'boolean') {
      res.status(400)
      throw new Error('Enable sound alerts must be true or false')
    }

    updates['preferences.soundEnabled'] = nextSoundEnabled
    updates['preferences.enableSoundAlerts'] = nextSoundEnabled
  }

  if (theme !== undefined) {
    if (!VALID_THEMES.includes(theme)) {
      res.status(400)
      throw new Error('Invalid theme preference')
    }

    updates['preferences.theme'] = theme
  }

  if (nextDefaultView !== undefined) {
    if (!VALID_BOARD_VIEWS.includes(nextDefaultView)) {
      res.status(400)
      throw new Error('Invalid default board view preference')
    }

    updates['preferences.defaultView'] = nextDefaultView
    updates['preferences.defaultBoardView'] = nextDefaultView
  }

  const user = await User.findByIdAndUpdate(
    req.user,
    updates,
    { new: true, runValidators: true },
  ).select('preferences')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.status(200).json(normalizePreferences(user.preferences))
})

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
}
