const asyncHandler = require('express-async-handler')
const Task = require('../models/Task')

const taskTest = (req, res) => {
  res.status(200).json({ message: 'tasks route working' })
}

const createTask = asyncHandler(async (req, res) => {
  const { title, board, description, priority, dueDate,assignee, status } = req.body || {}

  if (!title || !board) {
    res.status(400)
    throw new Error('Please provide required fields: title and board')
  }

  const task = await Task.create({
    title,
    board,
    user: req.user,
    description: description || '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    status: status || 'todo',
    assignee,
  })

  res.status(201).json(task)
})

const getTasksByBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params

  if (!boardId) {
    res.status(400)
    throw new Error('Board id is required')
  }

  const tasks = await Task.find({
    board: boardId,
    user: req.user,
  }).sort({ createdAt: -1 })

  res.status(200).json(tasks)
})

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, description, priority, dueDate,assignee,status } = req.body || {}

  const task = await Task.findById(id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  if (task.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to update this task')
  }

  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (priority !== undefined) task.priority = priority
  if (dueDate !== undefined) task.dueDate = dueDate
  if (assignee !== undefined) task.assignee = assignee
  if (status !== undefined) task.status = status

  const updatedTask = await task.save()
  res.status(200).json(updatedTask)
})

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const task = await Task.findById(id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  if (task.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to delete this task')
  }

  await task.deleteOne()
  res.status(200).json({ message: 'Task deleted successfully' })
})

module.exports = { taskTest, createTask, getTasksByBoard, updateTask, deleteTask }
