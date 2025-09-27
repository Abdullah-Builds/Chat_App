// video.js
export default function registerVideoHandlers(io, socket) {
  // join a video room
  socket.on("join", (room) => {
    const clientsInRoom = io.sockets.adapter.rooms.get(room) || new Set();
    if (clientsInRoom.size >= 2) {
      socket.emit("room_full");
      return;
    }

    socket.join(room);
    socket.data.videoRoom = room;

    socket.emit("joined", { room, peers: clientsInRoom.size });
    socket.to(room).emit("peer_joined");
  });

  // WebRTC signaling relay
  socket.on("signal", ({ room, type, data }) => {
    socket.to(room).emit("signal", { type, data });
  });

  socket.on("disconnect", () => {
    const room = socket.data.videoRoom;
    if (room) {
      socket.to(room).emit("peer_left");
      socket.leave(room);
    }
  });
}
