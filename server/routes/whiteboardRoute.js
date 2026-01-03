const {
  onConnection,
  onDrawEvent,
  onClearBoard,
  onCursorMove,
  onDisconnect,
} = require("../controllers/whiteboardController");

module.exports = function registerWhiteboardSockets(io) {
  io.on("connection", (socket) => {
    const { boardId } = socket.handshake.query;

    if (!boardId) {
      socket.disconnect();
      return;
    }

    onConnection(socket, boardId);

    socket.on("DRAW_EVENT", (data) =>
      onDrawEvent(io, socket, boardId, data)
    );

    socket.on("CLEAR_BOARD", () =>
      onClearBoard(io, boardId)
    );

    socket.on("CURSOR_MOVE", (data) =>
      onCursorMove(socket, boardId, data)
    );

    socket.on("disconnect", onDisconnect);
  });
};
