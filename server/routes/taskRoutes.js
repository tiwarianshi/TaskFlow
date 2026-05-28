const express = require('express')
const { createTask, getTasksByBoard, updateTask, deleteTask } = require('../controllers/taskController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', protect, createTask)
router.get('/board/:boardId', protect, getTasksByBoard)
router.put('/:id', protect, updateTask)
router.delete('/:id', protect, deleteTask)

module.exports = router
