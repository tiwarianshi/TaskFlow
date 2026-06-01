const mongoose = require('mongoose')
const Notification = require('../models/Notification')

const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  COMMENT_ADDED: 'comment_added',
  DUE_SOON: 'due_soon',
  BOARD_INVITE: 'board_invite',
  TASK_COMPLETED: 'task_completed',
}

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const validateNotificationParams = (params) => {
  const { user, type, title, message } = params

  if (!isValidObjectId(user)) {
    throw new Error('Invalid user ID')
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('Title is required and must be a non-empty string')
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required and must be a non-empty string')
  }

  if (!type || !Object.values(NOTIFICATION_TYPES).includes(type)) {
    throw new Error(`Invalid notification type: ${type}`)
  }
}

const createNotification = async ({
  user,
  sender = null,
  type,
  title,
  message,
  task = null,
  board = null,
}) => {
  try {
    validateNotificationParams({ user, type, title, message })

    if (sender && !isValidObjectId(sender)) {
      throw new Error('Invalid sender ID')
    }

    if (task && !isValidObjectId(task)) {
      throw new Error('Invalid task ID')
    }

    if (board && !isValidObjectId(board)) {
      throw new Error('Invalid board ID')
    }

    const notification = await Notification.create({
      user,
      sender: sender || null,
      type,
      title,
      message,
      task: task || null,
      board: board || null,
    })

    const populatedNotification = await Notification.findById(
      notification._id,
    ).populate('sender', 'name avatar')

    return populatedNotification
  } catch (error) {
    console.error('Error creating notification:', error.message)
    throw error
  }
}

const createTaskAssignedNotification = async ({
  assigneeId,
  taskTitle,
  senderName,
  taskId,
  boardId,
  senderId = null,
}) => {
  try {
    if (!isValidObjectId(assigneeId)) {
      throw new Error('Invalid assignee ID')
    }

    if (!taskTitle || typeof taskTitle !== 'string') {
      throw new Error('Task title is required')
    }

    if (!taskId || !isValidObjectId(taskId)) {
      throw new Error('Invalid task ID')
    }

    if (!boardId || !isValidObjectId(boardId)) {
      throw new Error('Invalid board ID')
    }

    return await createNotification({
      user: assigneeId,
      sender: senderId,
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      title: 'Task Assigned',
      message: `${senderName} assigned you to "${taskTitle}"`,
      task: taskId,
      board: boardId,
    })
  } catch (error) {
    console.error('Error creating task assigned notification:', error.message)
    throw error
  }
}

const createCommentNotification = async ({
  userId,
  commentAuthor,
  taskTitle,
  taskId,
  boardId,
  senderId = null,
}) => {
  try {
    if (!isValidObjectId(userId)) {
      throw new Error('Invalid user ID')
    }

    if (!commentAuthor || typeof commentAuthor !== 'string') {
      throw new Error('Comment author name is required')
    }

    if (!taskTitle || typeof taskTitle !== 'string') {
      throw new Error('Task title is required')
    }

    if (!taskId || !isValidObjectId(taskId)) {
      throw new Error('Invalid task ID')
    }

    if (!boardId || !isValidObjectId(boardId)) {
      throw new Error('Invalid board ID')
    }

    return await createNotification({
      user: userId,
      sender: senderId,
      type: NOTIFICATION_TYPES.COMMENT_ADDED,
      title: 'New Comment',
      message: `${commentAuthor} commented on "${taskTitle}"`,
      task: taskId,
      board: boardId,
    })
  } catch (error) {
    console.error('Error creating comment notification:', error.message)
    throw error
  }
}

const createDueSoonNotification = async ({
  userId,
  taskTitle,
  dueDate,
  taskId,
  boardId,
}) => {
  try {
    if (!isValidObjectId(userId)) {
      throw new Error('Invalid user ID')
    }

    if (!taskTitle || typeof taskTitle !== 'string') {
      throw new Error('Task title is required')
    }

    if (!dueDate || !(dueDate instanceof Date)) {
      throw new Error('Valid due date is required')
    }

    if (!taskId || !isValidObjectId(taskId)) {
      throw new Error('Invalid task ID')
    }

    if (!boardId || !isValidObjectId(boardId)) {
      throw new Error('Invalid board ID')
    }

    const dueDateStr = new Date(dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    return await createNotification({
      user: userId,
      sender: null,
      type: NOTIFICATION_TYPES.DUE_SOON,
      title: 'Task Due Soon',
      message: `"${taskTitle}" is due on ${dueDateStr}`,
      task: taskId,
      board: boardId,
    })
  } catch (error) {
    console.error('Error creating due soon notification:', error.message)
    throw error
  }
}

const createBoardInviteNotification = async ({
  userId,
  boardTitle,
  inviterName,
  boardId,
  senderId = null,
}) => {
  try {
    if (!isValidObjectId(userId)) {
      throw new Error('Invalid user ID')
    }

    if (!boardTitle || typeof boardTitle !== 'string') {
      throw new Error('Board title is required')
    }

    if (!inviterName || typeof inviterName !== 'string') {
      throw new Error('Inviter name is required')
    }

    if (!boardId || !isValidObjectId(boardId)) {
      throw new Error('Invalid board ID')
    }

    return await createNotification({
      user: userId,
      sender: senderId,
      type: NOTIFICATION_TYPES.BOARD_INVITE,
      title: 'Board Invitation',
      message: `${inviterName} invited you to "${boardTitle}"`,
      task: null,
      board: boardId,
    })
  } catch (error) {
    console.error('Error creating board invite notification:', error.message)
    throw error
  }
}

const createTaskCompletedNotification = async ({
  userId,
  taskTitle,
  completedByName,
  taskId,
  boardId,
  senderId = null,
}) => {
  try {
    if (!isValidObjectId(userId)) {
      throw new Error('Invalid user ID')
    }

    if (!taskTitle || typeof taskTitle !== 'string') {
      throw new Error('Task title is required')
    }

    if (!completedByName || typeof completedByName !== 'string') {
      throw new Error('Completed by name is required')
    }

    if (!taskId || !isValidObjectId(taskId)) {
      throw new Error('Invalid task ID')
    }

    if (!boardId || !isValidObjectId(boardId)) {
      throw new Error('Invalid board ID')
    }

    return await createNotification({
      user: userId,
      sender: senderId,
      type: NOTIFICATION_TYPES.TASK_COMPLETED,
      title: 'Task Completed',
      message: `${completedByName} completed "${taskTitle}"`,
      task: taskId,
      board: boardId,
    })
  } catch (error) {
    console.error('Error creating task completed notification:', error.message)
    throw error
  }
}

const bulkCreateNotifications = async (notificationParams) => {
  try {
    if (!Array.isArray(notificationParams)) {
      throw new Error('Parameter must be an array')
    }

    const results = await Promise.allSettled(
      notificationParams.map((params) => createNotification(params)),
    )

    const created = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)

    const failed = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.message)

    return { created, failed }
  } catch (error) {
    console.error('Error bulk creating notifications:', error.message)
    throw error
  }
}

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  createTaskAssignedNotification,
  createCommentNotification,
  createDueSoonNotification,
  createBoardInviteNotification,
  createTaskCompletedNotification,
  bulkCreateNotifications,
}
