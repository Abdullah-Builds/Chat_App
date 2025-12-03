import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import registerVideoHandlers from "./handlers/videoHandler.js";
import registerChatHandlers from "./handlers/chatHandler.js";
import { SERVER_CONFIG } from "./config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: SERVER_CONFIG.CORS_ORIGIN,
        methods: ["GET", "POST"],
    },
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    registerVideoHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

const PORT = SERVER_CONFIG.PORT;
httpServer.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Serving static files from: ${path.join(__dirname, "../public")}`);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    httpServer.close(() => {
        console.log("HTTP server closed");
    });
});

