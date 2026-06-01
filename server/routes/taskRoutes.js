const express = require('express')
const {
  createTask,
  getTaskById,
  getTasksByBoard,
  updateTask,
  deleteTask,
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
} = require('../controllers/taskController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', protect, createTask)
router.get('/board/:boardId', protect, getTasksByBoard)
router.get('/:id', protect, getTaskById)
router.get('/:taskId/comments', protect, getTaskComments)
router.post('/:taskId/comments', protect, createTaskComment)
router.delete('/:taskId/comments/:commentId', protect, deleteTaskComment)
router.put('/:id', protect, updateTask)
router.delete('/:id', protect, deleteTask)

module.exports = router
