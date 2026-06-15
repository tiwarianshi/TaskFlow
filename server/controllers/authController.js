const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const sendResetPasswordEmail = require('../utils/sendResetPasswordEmail')
const crypto = require('crypto')

const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000
const RESET_PASSWORD_RESPONSE =
  'If an account with that email exists, a password reset link has been sent.'

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email)
}

const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Please provide new password'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter'
  }

  if (!/\d/.test(password)) {
    return 'Password must include at least one number'
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include at least one special character'
  }

  return null
}

const registerUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body missing. Send JSON with Content-Type: application/json',
      })
    }

    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({
      name,
      email,
      password,
    })

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error during registration',
    })
  }
}

const loginUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body missing. Send JSON with Content-Type: application/json',
      })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error during login',
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body missing. Send JSON with Content-Type: application/json',
      })
    }

    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' })
    }

    if (!isValidEmail(email)) {
      return res.status(200).json({ message: RESET_PASSWORD_RESPONSE })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(200).json({ message: RESET_PASSWORD_RESPONSE })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedResetToken = hashResetToken(resetToken)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${clientUrl.replace(/\/$/, '')}/reset-password/${resetToken}`

    user.resetPasswordToken = hashedResetToken
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS)
    await user.save()

    const emailResult = await sendResetPasswordEmail(user.email, resetUrl)

    if (!emailResult.success) {
      user.resetPasswordToken = null
      user.resetPasswordExpires = null
      await user.save()

      return res.status(200).json({ message: RESET_PASSWORD_RESPONSE })
    }

    return res.status(200).json({ message: RESET_PASSWORD_RESPONSE })
  } catch (error) {
    console.error('Forgot password request failed:', error.message)
    return res.status(200).json({ message: RESET_PASSWORD_RESPONSE })
  }
}

const resetPassword = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Request body missing. Send JSON with Content-Type: application/json',
      })
    }

    const { token } = req.params
    const { newPassword } = req.body

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' })
    }

    if (!newPassword) {
      return res.status(400).json({ message: 'Please provide new password' })
    }

    const passwordError = validatePasswordStrength(newPassword)
    if (passwordError) {
      return res.status(400).json({ message: passwordError })
    }

    const hashedResetToken = hashResetToken(token)

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error while resetting password',
    })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body || {}

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' })
    }

    if (name.trim().length > 60) {
      return res.status(400).json({ message: 'Name must be 60 characters or less' })
    }

    const normalizedAvatar = avatar?.trim() || null

    if (normalizedAvatar) {
      try {
        const parsedUrl = new URL(normalizedAvatar)
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          return res.status(400).json({ message: 'Avatar URL must use http or https' })
        }
      } catch {
        return res.status(400).json({ message: 'Please enter a valid avatar URL' })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      {
        name: name.trim(),
        avatar: normalizedAvatar,
      },
      { new: true, runValidators: true },
    ).select('_id name email avatar createdAt updatedAt')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error while updating profile',
    })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {}

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all password fields' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match' })
    }

    const user = await User.findById(req.user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const currentPasswordValid = await user.comparePassword(currentPassword)
    if (!currentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    return res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error while changing password',
    })
  }
}

const protectedTest = (req, res) => {
  res.status(200).json({
    message: 'Protected route working',
    userId: req.user,
  })
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  protectedTest,
}
