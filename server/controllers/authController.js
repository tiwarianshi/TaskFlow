const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email)
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
      token: generateToken(user._id),
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Server error during login',
    })
  }
}

const protectedTest = (req, res) => {
  res.status(200).json({
    message: 'Protected route working',
    userId: req.user,
  })
}

module.exports = { registerUser, loginUser, protectedTest }
