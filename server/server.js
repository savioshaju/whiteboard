const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const router = require("./routes/index");                 // API routes
const registerWhiteboardSockets = require("./routes/whiteboardRoute"); // 👈 ADD

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);

// HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

// 👇 REGISTER WHITEBOARD SOCKET ROUTES
registerWhiteboardSockets(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
