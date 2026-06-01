const mongoose = require('mongoose')
const Board = require('../models/Board')
const Activity = require('../models/Activity')

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const getBoardWithMembers = async (boardId) => {
  if (!isValidObjectId(boardId)) return null
  return Board.findById(boardId).populate('members.user user', 'name email avatar')
}

const getBoardOwnerId = (board) => {
  if (!board || !board.user) return null
  if (typeof board.user === 'string') return board.user
  if (board.user._id) return board.user._id.toString()
  return board.user.toString()
}

const getBoardMember = (board, userId) => {
  if (!board || !Array.isArray(board.members)) return null
  return board.members.find(
    (member) => member.user && member.user._id.toString() === userId,
  )
}

const isBoardMember = (board, userId) => {
  if (!board) return false
  if (getBoardOwnerId(board) === userId) return true
  return Boolean(getBoardMember(board, userId))
}

const isOwnerOrAdmin = (board, userId) => {
  if (!board) return false
  if (getBoardOwnerId(board) === userId) return true
  const member = getBoardMember(board, userId)
  return member?.role === 'owner' || member?.role === 'admin'
}

const createActivity = async ({ board, user, action, target = '', detail = '', icon = '' }) => {
  if (!isValidObjectId(board) || !isValidObjectId(user)) return null
  return Activity.create({ board, user, action, target, detail, icon })
}

module.exports = {
  isValidObjectId,
  getBoardWithMembers,
  getBoardMember,
  isBoardMember,
  isOwnerOrAdmin,
  createActivity,
}
