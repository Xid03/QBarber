function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('join:shop', (shopId) => {
      if (shopId) {
        socket.join(`shop:${shopId}`);
      }
    });

    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('leave:shop', (shopId) => {
      if (shopId) {
        socket.leave(`shop:${shopId}`);
      }
    });

    socket.on('leave:user', (userId) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });
  });
}

function emitToShop(io, shopId, event, payload) {
  io.to(`shop:${shopId}`).emit(event, payload);
}

function emitToUser(io, userId, event, payload) {
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = {
  emitToShop,
  emitToUser,
  registerSocketHandlers
};
