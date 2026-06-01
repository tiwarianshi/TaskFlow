/**
 * Board-specific socket event handlers
 * Manages room joins/leaves and board-level real-time operations
 */

function registerBoardHandlers(io, socket) {
  // ─── Join Board Event ─────────────────────────────────────────────────────
  // Client: socket.emit('join-board', { boardId })
  socket.on('join-board', ({ boardId }) => {
    if (!boardId) {
      socket.emit('error', { message: 'boardId is required' })
      return
    }

    try {
      // Join the board room using boardId
      socket.join(boardId)

      console.log(`[Board] User ${socket.userId} joined board ${boardId}`)

      // Notify other users in the room that a user joined
      io.to(boardId).emit('user-joined-board', {
        userId: socket.userId,
        boardId,
        timestamp: new Date().toISOString(),
      })

      // Send confirmation to the joining user
      socket.emit('joined-board', {
        boardId,
        message: `Successfully joined board ${boardId}`,
      })
    } catch (error) {
      console.error(`[Board] Error joining board ${boardId}:`, error.message)
      socket.emit('error', { message: 'Failed to join board' })
    }
  })

  // ─── Leave Board Event ────────────────────────────────────────────────────
  // Client: socket.emit('leave-board', { boardId })
  socket.on('leave-board', ({ boardId }) => {
    if (!boardId) {
      socket.emit('error', { message: 'boardId is required' })
      return
    }

    try {
      socket.leave(boardId)

      console.log(`[Board] User ${socket.userId} left board ${boardId}`)

      // Notify other users in the room that a user left
      io.to(boardId).emit('user-left-board', {
        userId: socket.userId,
        boardId,
        timestamp: new Date().toISOString(),
      })

      // Send confirmation to the leaving user
      socket.emit('left-board', {
        boardId,
        message: `Successfully left board ${boardId}`,
      })
    } catch (error) {
      console.error(`[Board] Error leaving board ${boardId}:`, error.message)
      socket.emit('error', { message: 'Failed to leave board' })
    }
  })

  // ─── Auto-cleanup on disconnect ───────────────────────────────────────────
  // Socket.IO automatically removes the user from all rooms on disconnect
  // No additional cleanup needed here
}

module.exports = { registerBoardHandlers }
