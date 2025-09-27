// chat.js
let waitingUser = null;

export default function registerChatHandlers(io, socket) {
  // Save username
  socket.on("setName", (name) => {
    socket.data.username = name || "Guest";

    if (waitingUser) {
      const room = socket.id + "#" + waitingUser.id;
      socket.join(room);
      waitingUser.join(room);

      socket.data.partner = waitingUser.id;
      waitingUser.data.partner = socket.id;

      io.to(room).emit(
        "system",
        `You are connected: ${waitingUser.data.username} ↔ ${socket.data.username}`
      );

      waitingUser = null;
    } else {
      waitingUser = socket;
      socket.emit("system", "Waiting for a partner...");
    }
  });

  // Chat messages
  socket.on("chatMessage", (msg) => {
    const partnerId = socket.data.partner;
    if (partnerId) {
      io.to(partnerId).emit("chatMessage", {
        text: msg,
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    const partnerId = socket.data.partner;
    if (partnerId) {
      io.to(partnerId).emit(
        "system",
        `${socket.data.username || "Partner"} left.`
      );
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.data.partner = null;
        if (!waitingUser) waitingUser = partnerSocket;
        else partnerSocket.emit("system", "Please refresh to wait again.");
      }
    }
  });
}
