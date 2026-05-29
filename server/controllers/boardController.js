const asyncHandler = require('express-async-handler')
const Board = require('../models/Board')

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
  res.status(200).json(boards)
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

module.exports = { boardTest, createBoard, getBoards, deleteBoard }
