const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const preferenceSchema = new mongoose.Schema(
  {
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    soundEnabled: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ['dark', 'system', 'light'],
      default: 'dark',
    },
    defaultView: {
      type: String,
      enum: ['kanban', 'calendar'],
      default: 'kanban',
    },
    // Legacy preference keys kept so existing users and clients remain compatible.
    enableNotifications: {
      type: Boolean,
      default: undefined,
    },
    enableSoundAlerts: {
      type: Boolean,
      default: undefined,
    },
    defaultBoardView: {
      type: String,
      enum: ['kanban', 'calendar'],
      default: undefined,
    },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    preferences: {
      type: preferenceSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password.toString(), salt)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
