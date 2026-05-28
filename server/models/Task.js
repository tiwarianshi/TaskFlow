const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['todo', 'inprogress', 'done'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Task', taskSchema)
