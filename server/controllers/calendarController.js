const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')
const Board = require('../models/Board')
const Task = require('../models/Task')

const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low']
const VALID_STATUSES = ['todo', 'inprogress', 'done']

function parseMonthRange(month, year) {
  if (month === undefined && year === undefined) {
    return null
  }

  const parsedMonth = Number(month)
  const parsedYear = Number(year)

  if (
    !Number.isInteger(parsedMonth) ||
    !Number.isInteger(parsedYear) ||
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    parsedYear < 1970 ||
    parsedYear > 3000
  ) {
    return null
  }

  return {
    start: new Date(Date.UTC(parsedYear, parsedMonth - 1, 1)),
    end: new Date(Date.UTC(parsedYear, parsedMonth, 1)),
  }
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

async function getAccessibleBoardIds(userId, boardId) {
  const query = {
    $or: [{ user: userId }, { 'members.user': userId }],
  }

  if (boardId) {
    query._id = boardId
  }

  const boards = await Board.find(query).select('_id').lean()
  return boards.map((boardDoc) => boardDoc._id)
}

const getCalendarTasks = asyncHandler(async (req, res) => {
  const { month, year, board, assignee, priority, status } = req.query
  const monthRange = parseMonthRange(month, year)

  if ((month !== undefined || year !== undefined) && !monthRange) {
    res.status(400)
    throw new Error('Valid month and year are required')
  }

  if (board && !isValidObjectId(board)) {
    res.status(400)
    throw new Error('Invalid board filter')
  }

  if (assignee && !isValidObjectId(assignee)) {
    res.status(400)
    throw new Error('Invalid assignee filter')
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    res.status(400)
    throw new Error('Invalid priority filter')
  }

  if (status && !VALID_STATUSES.includes(status)) {
    res.status(400)
    throw new Error('Invalid status filter')
  }

  const boardIds = await getAccessibleBoardIds(req.user, board)

  if (boardIds.length === 0) {
    return res.status(200).json([])
  }

  const query = {
    board: { $in: boardIds },
    dueDate: monthRange
      ? { $gte: monthRange.start, $lt: monthRange.end }
      : { $exists: true, $ne: null },
    ...(assignee ? { assignee } : {}),
    ...(priority ? { priority } : {}),
    ...(status ? { status } : {}),
  }

  const tasks = await Task.find(query)
    .select('title dueDate priority status board assignee')
    .populate('board', 'title color')
    .populate('assignee', 'name email avatar')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean()

  res.status(200).json(tasks)
})

module.exports = {
  getCalendarTasks,
  getAccessibleBoardIds,
}
