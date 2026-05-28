const express = require('express')
const { taskTest } = require('../controllers/taskController')

const router = express.Router()

router.get('/test', taskTest)

module.exports = router
