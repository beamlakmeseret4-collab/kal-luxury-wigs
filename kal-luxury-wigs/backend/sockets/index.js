const { verifySocketAdminToken } = require('../middleware/auth');

/**
 * Sets up the realtime layer. Admin dashboard clients connect and send
 * their JWT; once verified as an admin, the socket is joined to the
 * "admin" room. Order events are then broadcast to that room only, so
 * customers' browsers never receive other customers' order data.
 */
const initSockets = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_admin', async (token) => {
      const user = await verifySocketAdminToken(token);
      if (user) {
        socket.join('admin');
        socket.emit('joined_admin', { ok: true });
      } else {
        socket.emit('joined_admin', { ok: false, message: 'Not authorized' });
      }
    });

    socket.on('disconnect', () => {
      // no-op, kept for clarity / future cleanup hooks
    });
  });
};

module.exports = initSockets;
