const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')
const Board = require('../models/Board')
const { emptyStats, getStatsForBoard, getStatsForBoards } = require('../utils/boardStats')

const boardTest = (req, res) => {
  res.status(200).json({ message: 'boards route working' })
}

const createBoard = asyncHandler(async (req, res) => {
  const { title, description, color } = req.body

  if (!title) {
    res.status(400)
    throw new Error('Board title is required')
  }

  const board = await Board.create({
    title,
    description: description || "",
    color: color ?? 0,
    user: req.user,
  })

  res.status(201).json(board)
})

const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ user: req.user }).sort({ createdAt: -1 })

  if (req.query.includeStats === 'true') {
    const statsMap = await getStatsForBoards(
      boards.map((board) => board._id),
      req.user,
    )

    const boardsWithStats = boards.map((board) => {
      const stats = statsMap[board._id.toString()] || emptyStats()

      return {
        ...board.toObject(),
        stats: {
          total: stats.total,
          completed: stats.completed,
        },
      }
    })

    return res.status(200).json(boardsWithStats)
  }

  res.status(200).json(boards)
})

const getBoardStats = asyncHandler(async (req, res) => {
  const { boardId } = req.params

  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    res.status(400)
    throw new Error('Invalid board id')
  }

  const board = await Board.findById(boardId)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (board.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to view board stats')
  }

  const stats = await getStatsForBoard(boardId, req.user)
  res.status(200).json(stats)
})

const getBoardById = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (board.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized')
  }

  res.status(200).json(board)
})

const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (board.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to delete this board')
  }

  await board.deleteOne()
  res.status(200).json({ message: 'Board deleted successfully' })
})

 const toggleFavoriteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { isFavorite } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({
        message: "Board not found",
      });
    }

    board.isFavorite = isFavorite;

    await board.save();

    res.status(200).json(board);
  } catch (error) {
    console.error("Toggle favorite error:", error);

    res.status(500).json({
      message: "Failed to update favorite",
    });
  }
};

module.exports = {
  boardTest,
  createBoard,
  getBoards,
  getBoardStats,
  toggleFavoriteBoard,
  getBoardById,
  deleteBoard,
}
