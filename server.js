// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const path = require("path");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// // serve static files from "public" folder
// app.use(express.static(path.join(__dirname, "public")));

// let waitingUser = null;

// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//   if (waitingUser) {
//     const room = `room-${waitingUser.id}-${socket.id}`;
//     socket.join(room);
//     waitingUser.join(room);

//     socket.emit("matched", { room, partner: waitingUser.id });
//     waitingUser.emit("matched", { room, partner: socket.id });

//     console.log(`🔗 Matched ${waitingUser.id} and ${socket.id} in room: ${room}`);
//     waitingUser = null;
//   } else {
//     waitingUser = socket;
//     socket.emit("waiting", { message: "Waiting for a partner..." });
//   }

//   socket.on("message", ({ room, text }) => {
//     io.to(room).emit("message", { sender: socket.id, text });
//   });

  
//   socket.on("disconnect", () => {
//     if (waitingUser === socket) {
//       waitingUser = null;
//     }
//   });
// });

// server.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
// server.js

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

// serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // attach video call events
  registerVideoHandlers(io, socket);

  // attach chat events
  registerChatHandlers(io, socket);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
