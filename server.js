// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import registerVideoHandlers from "./video.js";
import registerChatHandlers from "./chat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Serve static frontend (public folder)
app.use(express.static(path.join(__dirname, "public")));

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Attach WebRTC signaling handlers
  registerVideoHandlers(io, socket);

  // Attach chat message handlers
  registerChatHandlers(io, socket);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
