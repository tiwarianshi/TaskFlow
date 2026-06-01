const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')
const Board = require('../models/Board')
const Activity = require('../models/Activity')
const User = require('../models/User')
const { emptyStats, getStatsForBoard, getStatsForBoards } = require('../utils/boardStats')
const {
  getBoardWithMembers,
  isBoardMember,
  isOwnerOrAdmin,
  createActivity,
} = require('../utils/boardHelpers')

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
    members: [
      {
        user: req.user,
        role: 'owner',
        joinedAt: Date.now(),
      },
    ],
  })

  res.status(201).json(board)
})

const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    $or: [{ user: req.user }, { 'members.user': req.user }],
  }).sort({ createdAt: -1 })

  if (req.query.includeStats === 'true') {
    const statsMap = await getStatsForBoards(
      boards.map((board) => board._id),
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

  const board = await getBoardWithMembers(boardId)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(board, req.user)) {
    res.status(403)
    throw new Error('Not authorized to view board stats')
  }

  const stats = await getStatsForBoard(boardId)
  res.status(200).json(stats)
})

const getBoardById = asyncHandler(async (req, res) => {
  const board = await getBoardWithMembers(req.params.id)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(board, req.user)) {
    res.status(403)
    throw new Error('Not authorized')
  }

  res.status(200).json(board)
})

const getBoardMembers = asyncHandler(async (req, res) => {
  const { boardId } = req.params
  const board = await getBoardWithMembers(boardId)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(board, req.user)) {
    res.status(403)
    throw new Error('Not authorized to view members')
  }

  const owner = board.user
    ? {
        _id: board.user._id,
        name: board.user.name,
        email: board.user.email,
        avatar: board.user.avatar || null,
        role: 'owner',
        joinedAt: board.createdAt || new Date(),
      }
    : null

  const members = [
    ...(owner ? [owner] : []),
    ...(board.members || [])
      .filter((member) => member.user?.toString() !== board.user?.toString())
      .map((member) => {
        if (member.user) {
          return {
            _id: member.user._id,
            name: member.user.name,
            email: member.user.email,
            avatar: member.user.avatar || null,
            role: member.role,
            joinedAt: member.joinedAt,
          }
        }

        return {
          _id: member._id,
          name: member.inviteEmail,
          email: member.inviteEmail,
          avatar: null,
          role: member.role,
          joinedAt: member.joinedAt,
          invited: true,
        }
      }),
  ].sort((a, b) => {
    const order = { owner: 0, admin: 1, member: 2 }
    return order[a.role] - order[b.role]
  })

  res.status(200).json(members)
})

const inviteBoardMember = asyncHandler(async (req, res) => {
  const { boardId } = req.params
  const { email, role } = req.body || {}

  if (!email || !role) {
    res.status(400)
    throw new Error('Email and role are required')
  }

  if (!['owner', 'admin', 'member'].includes(role)) {
    res.status(400)
    throw new Error('Invalid member role')
  }

  const board = await getBoardWithMembers(boardId)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isOwnerOrAdmin(board, req.user)) {
    res.status(403)
    throw new Error('Not authorized to invite members')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })

  const boardOwnerId =
    board.user?._id?.toString() || board.user?.toString()

  const existing =
    (user && boardOwnerId === user._id?.toString()) ||
    board.members.some((member) => {
      const memberUserId =
        member.user?._id?.toString() || member.user?.toString()

      return (
        (user && memberUserId === user._id?.toString()) ||
        member.inviteEmail === normalizedEmail
      )
    })

  if (existing) {
    res.status(400)
    throw new Error('User is already a board member or already invited')
  }

  let memberData

  if (user) {
    board.members.push({
      user: user._id,
      role,
      joinedAt: Date.now(),
    })

    memberData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      role,
      joinedAt: Date.now(),
    }
  } else {
    board.members.push({
      inviteEmail: normalizedEmail,
      role,
      joinedAt: Date.now(),
    })

    const invite = board.members[board.members.length - 1]
    memberData = {
      _id: invite._id,
      name: normalizedEmail,
      email: normalizedEmail,
      avatar: null,
      role,
      joinedAt: invite.joinedAt,
      invited: true,
    }
  }

  await board.save()

  await createActivity({
    board: board._id,
    user: req.user,
    action: 'invited',
    target: user ? user.name : normalizedEmail,
    detail: user ? user.email : normalizedEmail,
    icon: 'user-plus',
  })

  res.status(201).json(memberData)
})

const removeBoardMember = asyncHandler(async (req, res) => {
  const { boardId, userId } = req.params

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400)
    throw new Error('Invalid user id')
  }

  const board = await getBoardWithMembers(boardId)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isOwnerOrAdmin(board, req.user)) {
    res.status(403)
    throw new Error('Not authorized to remove members')
  }

  const boardOwnerId =
    board.user?._id?.toString() || board.user?.toString()

  if (boardOwnerId === userId) {
    res.status(400)
    throw new Error('Owner cannot be removed')
  }

  const index = board.members.findIndex((member) => {
    const memberUserId =
      member.user?._id?.toString() || member.user?.toString()

    return (
      memberUserId === userId ||
      member._id?.toString() === userId
    )
  })

  if (index === -1) {
    res.status(404)
    throw new Error('Member not found')
  }

  const removedMember = board.members[index]
  board.members.splice(index, 1)

  await board.save()

  await createActivity({
    board: board._id,
    user: req.user,
    action: 'removed',
    target: removedMember.user?.name || 'member',
    detail: removedMember.user?.email || '',
    icon: 'user-minus',
  })

  res.status(200).json({ message: 'Member removed successfully' })
})

const getBoardActivity = asyncHandler(async (req, res) => {
  const { boardId } = req.params

  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    res.status(400)
    throw new Error('Invalid board id')
  }

  const board = await getBoardWithMembers(boardId)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(board, req.user) && board.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to view activity')
  }

  const activity = await Activity.find({ board: boardId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })

  res.status(200).json(activity)
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

const toggleFavoriteBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params
  const { isFavorite } = req.body

  const board = await getBoardWithMembers(boardId)

  if (!board) {
    res.status(404)
    throw new Error('Board not found')
  }

  if (!isBoardMember(board, req.user) && board.user.toString() !== req.user) {
    res.status(403)
    throw new Error('Not authorized to update favorite status')
  }

  board.isFavorite = Boolean(isFavorite)
  await board.save()

  res.status(200).json(board)
})

module.exports = {
  boardTest,
  createBoard,
  getBoards,
  getBoardStats,
  getBoardMembers,
  inviteBoardMember,
  removeBoardMember,
  getBoardActivity,
  toggleFavoriteBoard,
  getBoardById,
  deleteBoard,
}
