const express = require('express')
const { createBoard, getBoards, deleteBoard } = require('../controllers/boardController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route('/').post(protect, createBoard).get(protect, getBoards)
router.delete('/:id', protect, deleteBoard)

module.exports = router
