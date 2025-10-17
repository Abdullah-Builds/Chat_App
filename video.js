// export default function registerVideoHandlers(io, socket) {
//   // Keeps track of room limits (shared across all sockets)
//   if (!io.roomSettings) io.roomSettings = {}; // { roomName: { maxPeers } }

//   console.log(`📹 Video handler ready for socket: ${socket.id}`);

//   // ---- CREATE ROOM ----
//   socket.on("create", ({ room, maxPeers }) => {
//     if (!room || typeof room !== "string") return;

//     const existing = io.sockets.adapter.rooms.get(room);
//     if (existing) {
//       socket.emit("room_full");
//       console.log(`❌ Room "${room}" already exists`);
//       return;
//     }

//     io.roomSettings[room] = { maxPeers: maxPeers || 2 };
//     socket.join(room);
//     socket.data.room = room;
//     console.log(`✅ Room "${room}" created (maxPeers=${maxPeers || 2})`);
//     socket.emit("created", { room, maxPeers });
//   });

//   // ---- JOIN ROOM ----
//   socket.on("join", (room) => {
//     if (!room || typeof room !== "string") return;

//     const roomInfo = io.sockets.adapter.rooms.get(room);
//     if (!roomInfo) {
//       socket.emit("error", "Room does not exist.");
//       return;
//     }

//     const peers = roomInfo.size;
//     const limit = io.roomSettings[room]?.maxPeers || 2;

//     if (peers >= limit) {
//       socket.emit("room_full");
//       console.log(`❌ Room "${room}" full (${peers}/${limit})`);
//       return;
//     }

//     socket.join(room);
//     socket.data.room = room;
//     socket.emit("joined", { room, peers });
//     console.log(`👥 ${socket.id} joined "${room}" (${peers + 1}/${limit})`);
//   });

//   // ---- SIGNAL (WebRTC offer/answer/ICE) ----
//   socket.on("signal", ({ room, type, data }) => {
//     if (!room) return;
//     socket.to(room).emit("signal", { type, data });
//   });

//   // ---- DISCONNECT / LEAVE ----
//   socket.on("disconnect", () => {
//     const room = socket.data.room;
//     if (room) {
//       socket.to(room).emit("peer_left");
//       console.log(`⚠️ ${socket.id} left room "${room}"`);
//       const members = io.sockets.adapter.rooms.get(room);
//       if (!members || members.size === 0) {
//         delete io.roomSettings[room];
//         console.log(`🧹 Room "${room}" deleted`);
//       }
//     }
//   });
// }


export default function registerVideoHandlers(io, socket) {
  // Keep track of rooms & max peers
  if (!io.roomSettings) io.roomSettings = {}; // { roomName: { maxPeers } }
  if (!io.waitingQueue) io.waitingQueue = []; // for random pairing

  console.log(`📹 Video handler ready for socket: ${socket.id}`);

  // ---- CREATE ROOM ----
  socket.on("create", ({ room, maxPeers }) => {
    if (!room || typeof room !== "string") return;

    const existing = io.sockets.adapter.rooms.get(room);
    if (existing) {
      socket.emit("room_full");
      console.log(`❌ Room "${room}" already exists`);
      return;
    }

    io.roomSettings[room] = { maxPeers: maxPeers || 2 };
    socket.join(room);
    socket.data.room = room;
    console.log(`✅ Room "${room}" created (maxPeers=${maxPeers || 2})`);
    socket.emit("created", { room, maxPeers });
  });

  // ---- JOIN ROOM ----
  socket.on("join", (room) => {
    if (!room || typeof room !== "string") return;

    const roomInfo = io.sockets.adapter.rooms.get(room);
    if (!roomInfo) {
      socket.emit("error", "Room does not exist.");
      return;
    }

    const peers = roomInfo.size;
    const limit = io.roomSettings[room]?.maxPeers || 2;

    if (peers >= limit) {
      socket.emit("room_full");
      console.log(`❌ Room "${room}" full (${peers}/${limit})`);
      return;
    }

    socket.join(room);
    socket.data.room = room;
    socket.emit("joined", { room, peers });
    console.log(`👥 ${socket.id} joined "${room}" (${peers + 1}/${limit})`);
  });

  // ---- JOIN RANDOM ROOM ----
  socket.on("joinRandom", async () => {
    // Check if there's someone waiting
    if (io.waitingQueue.length > 0) {
      const partner = io.waitingQueue.shift();
      const room = `room-${socket.id}-${partner.id}`;

      // Join both sockets to the room
      socket.join(room);
      partner.join(room);
      socket.data.room = room;
      partner.data.room = room;

      // Notify both clients
      socket.emit("joined", { room, peerId: partner.id });
      partner.emit("joined", { room, peerId: socket.id });
      console.log(`👥 Random pair created: ${socket.id} + ${partner.id} in "${room}"`);
    } else {
      io.waitingQueue.push(socket);
      socket.emit("waiting", "Waiting for a partner...");
      console.log(`⏳ ${socket.id} is waiting for a random partner`);
    }
  });

  // ---- SIGNAL (WebRTC offer/answer/ICE) ----
  socket.on("signal", ({ room, type, data }) => {
    if (!room) return;
    socket.to(room).emit("signal", { type, data });
  });

  // ---- DISCONNECT / LEAVE ----
  socket.on("disconnect", () => {
    const room = socket.data.room;

    // Remove from waiting queue if present
    io.waitingQueue = io.waitingQueue.filter(s => s.id !== socket.id);

    if (room) {
      socket.to(room).emit("peer_left");
      console.log(`⚠️ ${socket.id} left room "${room}"`);

      const members = io.sockets.adapter.rooms.get(room);
      if (!members || members.size === 0) {
        delete io.roomSettings[room];
        console.log(`🧹 Room "${room}" deleted`);
      }
    }
  });
}

