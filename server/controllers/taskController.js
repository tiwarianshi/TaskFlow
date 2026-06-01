const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const Task = require('../models/Task')
const Comment = require('../models/Comment')
const { getBoardWithMembers, isBoardMember, createActivity } = require('../utils/boardHelpers')

const taskTest = (req, res) => {
  res.status(200).json({ message: 'tasks route working' })
}

const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    board,
    boardId,
    description,
    priority,
    dueDate,
    assignee,
    status,
  } = req.body || {}

  const taskBoard = board || boardId

  if (!title || !taskBoard) {
    res.status(400)
    throw new Error('Please provide required fields: title and board')
  }

  const boardDoc = await getBoardWithMembers(taskBoard)

  if (!boardDoc) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(boardDoc, req.user) && boardDoc.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to create task on this board')
  }

  const normalizedAssignee = assignee === '' ? null : assignee

  if (normalizedAssignee !== undefined && normalizedAssignee !== null) {
    if (!mongoose.Types.ObjectId.isValid(normalizedAssignee)) {
      res.status(400)
      throw new Error('Invalid assignee id')
    }

    const isMember = isBoardMember(boardDoc, normalizedAssignee)

    if (!isMember) {
      res.status(400)
      throw new Error('Assignee must be a board member')
    }
  }

  const task = await Task.create({
    title,
    board: taskBoard,
    user: req.user,
    description: description || '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    status: status || 'todo',
    assignee: normalizedAssignee || null,
  })

  await task.populate('assignee', 'name email avatar')
  await createActivity({
    board: taskBoard,
    user: req.user,
    action: 'created',
    target: task.title,
    icon: 'create',
  })

  res.status(201).json(task)
})

const getTasksByBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params

  if (!boardId) {
    res.status(400)
    throw new Error('Board id is required')
  }

  const boardDoc = await getBoardWithMembers(boardId)

  if (!boardDoc) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(boardDoc, req.user) && boardDoc.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to view board tasks')
  }

  const tasks = await Task.find({ board: boardId })
    .populate('assignee', 'name email avatar')
    .sort({ createdAt: -1 })

  res.status(200).json(tasks)
})

const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400)
    throw new Error('Invalid task id')
  }

  const task = await Task.findById(id).populate('assignee', 'name email avatar')

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  const boardDoc = await getBoardWithMembers(task.board)

  if (!boardDoc) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(boardDoc, req.user) && boardDoc.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to view this task')
  }

  res.status(200).json(task)
})

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, description, priority, dueDate, assignee, status } = req.body || {}

  const task = await Task.findById(id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  const boardDoc = await getBoardWithMembers(task.board)

  if (!boardDoc) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(boardDoc, req.user) && boardDoc.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to update this task')
  }

  const previousStatus = task.status
  const previousPriority = task.priority
  const previousTitle = task.title
  const previousDescription = task.description
  const previousAssignee = task.assignee ? task.assignee.toString() : null

  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (priority !== undefined) task.priority = priority
  if (dueDate !== undefined) task.dueDate = dueDate
  if (status !== undefined) task.status = status

  if (assignee !== undefined) {
    const normalizedAssignee = assignee === '' ? null : assignee

    if (normalizedAssignee !== null && !mongoose.Types.ObjectId.isValid(normalizedAssignee)) {
      res.status(400)
      throw new Error('Invalid assignee id')
    }

    if (normalizedAssignee !== null) {
      const isMember = isBoardMember(boardDoc, normalizedAssignee)

      if (!isMember) {
        res.status(400)
        throw new Error('Assignee must be a board member')
      }
    }

    task.assignee = normalizedAssignee
  }

  const updatedTask = await task.save()
  await updatedTask.populate('assignee', 'name email avatar')

  if (status !== undefined && status !== previousStatus) {
    await createActivity({
      board: task.board,
      user: req.user,
      action: 'moved',
      target: updatedTask.title,
      detail: `${previousStatus} → ${updatedTask.status}`,
      icon: 'move',
    })
  }

  if (priority !== undefined && priority !== previousPriority) {
    await createActivity({
      board: task.board,
      user: req.user,
      action: 'changed priority',
      target: updatedTask.title,
      detail: `${previousPriority} → ${updatedTask.priority}`,
      icon: 'priority',
    })
  }

  if (
    (title !== undefined && title !== previousTitle) ||
    (description !== undefined && description !== previousDescription) ||
    (assignee !== undefined && (assignee || null) !== previousAssignee)
  ) {
    await createActivity({
      board: task.board,
      user: req.user,
      action: 'updated',
      target: updatedTask.title,
      icon: 'edit',
    })
  }

  res.status(200).json(updatedTask)
})

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const task = await Task.findById(id)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  const boardDoc = await getBoardWithMembers(task.board)

  if (!boardDoc) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(boardDoc, req.user) && boardDoc.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to delete this task')
  }

  await task.deleteOne()
  res.status(200).json({ message: 'Task deleted successfully' })
})

const getTaskComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400)
    throw new Error('Invalid task id')
  }

  const task = await Task.findById(taskId)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  const boardDoc = await getBoardWithMembers(task.board)

  if (!boardDoc) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(boardDoc, req.user) && boardDoc.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to view comments')
  }

  const comments = await Comment.find({ task: taskId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 })

  res.status(200).json(comments)
})

const createTaskComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params
  const { body } = req.body || {}

  if (!body || !body.trim()) {
    res.status(400)
    throw new Error('Comment body is required')
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    res.status(400)
    throw new Error('Invalid task id')
  }

  const task = await Task.findById(taskId)

  if (!task) {
    res.status(404)
    throw new Error('Task not found')
  }

  const boardDoc = await getBoardWithMembers(task.board)

  if (!boardDoc) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(boardDoc, req.user) && boardDoc.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to comment on this task')
  }

  const comment = await Comment.create({
    task: taskId,
    user: req.user,
    body: body.trim(),
  })

  await createActivity({
    board: task.board,
    user: req.user,
    action: 'commented on',
    target: task.title,
    icon: 'comment',
  })

  await comment.populate('user', 'name email avatar')

  res.status(201).json(comment)
})

const deleteTaskComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params

  if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    res.status(400)
    throw new Error('Invalid id')
  }

  const comment = await Comment.findById(commentId)

  if (!comment || comment.task.toString() !== taskId) {
    res.status(404)
    throw new Error('Comment not found')
  }

  if (comment.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to delete this comment')
  }

  await comment.deleteOne()
  res.status(200).json({ message: 'Comment deleted successfully' })
})

module.exports = {
  taskTest,
  createTask,
  getTaskById,
  getTasksByBoard,
  updateTask,
  deleteTask,
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
 }
