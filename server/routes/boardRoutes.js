const express = require('express')

const {
  createBoard,
  getBoards,
  getBoardStats,
  toggleFavoriteBoard,  
  getBoardById,
  deleteBoard,
} = require('../controllers/boardController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route('/').post(protect, createBoard).get(protect, getBoards)
router.patch("/:boardId/favorite", protect, toggleFavoriteBoard);

router.get('/:boardId/stats', protect, getBoardStats)

router
  .route('/:id')
  .get(protect, getBoardById)
  .delete(protect, deleteBoard)

module.exports = router