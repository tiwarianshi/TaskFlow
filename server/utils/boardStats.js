const mongoose = require('mongoose')
const Task = require('../models/Task')

const COMPLETED_STATUS = 'done'

const emptyStats = () => ({
  total: 0,
  completed: 0,
  pending: 0,
  completionRate: 0,
})

const buildStats = (total, completed) => {
  const pending = Math.max(total - completed, 0)
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  return {
    total,
    completed,
    pending,
    completionRate,
  }
}

const getStatsForBoard = async (boardId, userId) => {
  const [total, completed] = await Promise.all([
    Task.countDocuments({ board: boardId, user: userId }),
    Task.countDocuments({ board: boardId, user: userId, status: COMPLETED_STATUS }),
  ])

  return buildStats(total, completed)
}

const getStatsForBoards = async (boardIds, userId) => {
  if (!boardIds.length) {
    return {}
  }

  const objectIds = boardIds.map((id) => new mongoose.Types.ObjectId(id))
  const userObjectId = new mongoose.Types.ObjectId(userId)

  const rows = await Task.aggregate([
    {
      $match: {
        board: { $in: objectIds },
        user: userObjectId,
      },
    },
    {
      $group: {
        _id: '$board',
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', COMPLETED_STATUS] }, 1, 0],
          },
        },
      },
    },
  ])

  return rows.reduce((acc, row) => {
    acc[row._id.toString()] = buildStats(row.total, row.completed)
    return acc
  }, {})
}

module.exports = {
  emptyStats,
  buildStats,
  getStatsForBoard,
  getStatsForBoards,
}
