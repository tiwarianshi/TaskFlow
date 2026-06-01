const express = require('express')

const {
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
} = require('../controllers/boardController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route('/').post(protect, createBoard).get(protect, getBoards)
router.patch('/:boardId/favorite', protect, toggleFavoriteBoard)

router.get('/:boardId/stats', protect, getBoardStats)
router.get('/:boardId/members', protect, getBoardMembers)
router.post('/:boardId/members/invite', protect, inviteBoardMember)
router.delete('/:boardId/members/:userId', protect, removeBoardMember)
router.get('/:boardId/activity', protect, getBoardActivity)

router
  .route('/:id')
  .get(protect, getBoardById)
  .delete(protect, deleteBoard)

module.exports = router