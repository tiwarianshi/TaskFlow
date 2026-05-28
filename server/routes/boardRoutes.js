const express = require('express')
const { boardTest } = require('../controllers/boardController')

const router = express.Router()

router.get('/test', boardTest)

module.exports = router
