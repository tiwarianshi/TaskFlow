const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

/**
 * Initialize Socket.IO server with JWT authentication
 * Handles connection, disconnection, and middleware for real-time features
 */
function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // ─── Authentication Middleware ─────────────────────────────────────────────
  // Verify JWT token from socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication error: Missing token'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      socket.userEmail = decoded.email || null
      next()
    } catch (error) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  // ─── Connection Handler ───────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected (${socket.id})`)

    // Store connected user info for debugging
    socket.data.userId = socket.userId
    // Join a room for this user so server can emit user-specific events
    try {
      if (socket.userId) socket.join(socket.userId)
    } catch (err) {
      console.error('[Socket] Failed to join user room', err.message)
    }

    // ─── Disconnect Handler ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      const rooms = Array.from(socket.rooms)
        .filter((room) => room !== socket.id)
        .join(', ')

      console.log(
        `[Socket] User ${socket.userId} disconnected from rooms: [${rooms || 'none'}]`,
      )
    })
  })

  return io
}

module.exports = { initializeSocket }
