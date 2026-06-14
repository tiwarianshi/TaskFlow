const http = require('http')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const boardRoutes = require('./routes/boardRoutes')
const taskRoutes = require('./routes/taskRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const calendarRoutes = require('./routes/calendarRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const { setupSocket } = require('./socket')

dotenv.config()
if (process.env.MONGO_URI) {
  connectDB()
} else {
  console.warn('MONGO_URI is not set. Auth routes will fail without MongoDB.')
}

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('TaskFlow API is running')
})

app.use('/api/auth', authRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/calendar', calendarRoutes)

app.use(notFound)
app.use(errorHandler)

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const httpServer = http.createServer(app)
const io = setupSocket(httpServer)
console.log('[Socket.IO] Server initialized')

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`WebSocket server ready for connections`)
})
