const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const Task = require('../models/Task')
const Comment = require('../models/Comment')
const User = require('../models/User')
const { getBoardWithMembers, isBoardMember, createActivity } = require('../utils/boardHelpers')
const { createTaskAssignedNotification, createCommentNotification } = require('../utils/notificationService')

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

  // Create task assigned notification if task is created with an assignee
  if (normalizedAssignee) {
    const currentUser = await User.findById(req.user)
    const assigneeUser = await User.findById(normalizedAssignee)

    if (currentUser && assigneeUser) {
      try {
        await createTaskAssignedNotification({
          assigneeId: normalizedAssignee,
          taskTitle: task.title,
          senderName: currentUser.name,
          taskId: task._id,
          boardId: taskBoard,
          senderId: req.user,
        })
      } catch (notificationError) {
        console.error('Failed to create task assigned notification:', notificationError.message)
      }
    }
  }

  res.status(201).json(task)

  // Best-effort: emit socket event to notify board members (include senderId)
  try {
    const { getIo } = require('../socket')
    const io = getIo()
    if (io) io.to(task.board.toString()).emit('task.created', { task, senderId: req.user })
  } catch (err) {
    // ignore socket emit failures
  }
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

  // Create task assigned notification if assignee changed and new assignee exists
  if (assignee !== undefined && updatedTask.assignee && updatedTask.assignee.toString() !== previousAssignee) {
    const currentUser = await User.findById(req.user)
    const assigneeUser = await User.findById(updatedTask.assignee)

    if (currentUser && assigneeUser) {
      try {
        await createTaskAssignedNotification({
          assigneeId: updatedTask.assignee,
          taskTitle: updatedTask.title,
          senderName: currentUser.name,
          taskId: updatedTask._id,
          boardId: updatedTask.board,
          senderId: req.user,
        })
      } catch (notificationError) {
        console.error('Failed to create task assigned notification:', notificationError.message)
      }
    }
  }

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

  // Best-effort: emit socket event to notify board members about the update
  try {
    const { getIo } = require('../socket')
    const io = getIo()
    if (io) io.to(updatedTask.board.toString()).emit('task.updated', { task: updatedTask, senderId: req.user })

    // Additionally emit a dedicated moved event when status or position changed
    const moved = (status !== undefined && status !== previousStatus) || (req.body && Object.prototype.hasOwnProperty.call(req.body, 'position'))
    if (moved) {
      const movePayload = {
        task: updatedTask,
        taskId: updatedTask._id,
        fromStatus: previousStatus,
        toStatus: updatedTask.status,
        position: req.body ? req.body.position ?? null : null,
        senderId: req.user,
      }
      io.to(updatedTask.board.toString()).emit('task.moved', movePayload)
    }
  } catch (err) {
    // ignore socket emit failures
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
  // Best-effort: notify board members that a task was deleted (include senderId)
  try {
    const { getIo } = require('../socket')
    const io = getIo()
    if (io) io.to(task.board.toString()).emit('task.deleted', { taskId: id, boardId: task.board.toString(), senderId: req.user })
  } catch (err) {
    // ignore
  }

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

  // Create comment notification for task assignee
  if (task.assignee && task.assignee.toString() !== req.user) {
    const commentAuthor = await User.findById(req.user)

    if (commentAuthor) {
      try {
        await createCommentNotification({
          userId: task.assignee,
          commentAuthor: commentAuthor.name,
          taskTitle: task.title,
          taskId: task._id,
          boardId: task.board,
          senderId: req.user,
        })
      } catch (notificationError) {
        console.error('Failed to create comment notification:', notificationError.message)
      }
    }
  }
  // Also create comment notification for task creator (if different from commenter and no assignee)
  else if (!task.assignee && task.user.toString() !== req.user) {
    const commentAuthor = await User.findById(req.user)

    if (commentAuthor) {
      try {
        await createCommentNotification({
          userId: task.user,
          commentAuthor: commentAuthor.name,
          taskTitle: task.title,
          taskId: task._id,
          boardId: task.board,
          senderId: req.user,
        })
      } catch (notificationError) {
        console.error('Failed to create comment notification:', notificationError.message)
      }
    }
  }

  res.status(201).json(comment)

  // Best-effort: emit comment created to board room
  try {
    const { getIo } = require('../socket')
    const io = getIo()
    if (io) io.to(task.board.toString()).emit('comment.created', { comment, taskId, boardId: task.board.toString(), senderId: req.user })
  } catch (err) {
    // ignore emit errors
  }
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

  // Best-effort: emit comment deleted to board room
  try {
    const { getIo } = require('../socket')
    const io = getIo()
    if (io) io.to(task.board.toString()).emit('comment.deleted', { commentId, taskId, boardId: task.board.toString(), senderId: req.user })
  } catch (err) {
    // ignore emit errors
  }
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
