/**
 * Socket.IO module exports
 * Central hub for all socket-related functionality
 */

const { initializeSocket } = require('./socketServer')
const { registerBoardHandlers } = require('./boardHandlers')

/**
 * Initialize and configure Socket.IO with all handlers
 * @param {http.Server} httpServer - Express app wrapped in http.Server
 * @returns {Server} Socket.IO Server instance
 */
let ioInstance = null

function setupSocket(httpServer) {
  ioInstance = initializeSocket(httpServer)

  // Register board handlers for each connecting socket
  ioInstance.on('connection', (socket) => {
    registerBoardHandlers(ioInstance, socket)
  })

  return ioInstance
}

function getIo() {
  return ioInstance
}

module.exports = { setupSocket, initializeSocket, registerBoardHandlers, getIo }
