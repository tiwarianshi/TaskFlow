const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    backgroundColor: {
      type: String,
      default: "#1e293b",
      trim: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Board', boardSchema)
