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
const settingsRoutes = require('./routes/settingsRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const { setupSocket } = require('./socket')

dotenv.config()
if (process.env.MONGO_URI) {
  connectDB()
} else {
  console.warn('MONGO_URI is not set. Auth routes will fail without MongoDB.')
}

const app = express()

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://task-flow-anshi-dev.vercel.app"
].filter(Boolean);

const vercelRegex = /^https:\/\/task-flow-.*\.vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      vercelRegex.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, false); // important: no crash
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use(express.json())

app.get('/', (req, res) => {
  res.send('TaskFlow API is running')
})

app.use('/api/auth', authRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/settings', settingsRoutes)

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
