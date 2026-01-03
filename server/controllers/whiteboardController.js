// boardId -> { strokes, lastActivity }
const boards = {};

const BOARD_TTL =
  Number(process.env.BOARD_IDLE_CLEAR_MS) || 60 * 60 * 1000;

function getBoard(boardId) {
  if (!boards[boardId]) {
    boards[boardId] = {
      strokes: [],
      lastActivity: Date.now(),
    };
  }
  return boards[boardId];
}

function onConnection(socket, boardId) {
  const board = getBoard(boardId);
  socket.join(boardId);
  socket.emit("INIT_BOARD", board.strokes);
}

function onDrawEvent(io, socket, boardId, stroke) {
  const board = getBoard(boardId);
  board.strokes.push(stroke);
  board.lastActivity = Date.now();

  socket.to(boardId).emit("DRAW_EVENT", stroke);
}

function onClearBoard(io, boardId) {
  const board = getBoard(boardId);
  board.strokes = [];
  board.lastActivity = Date.now();

  io.to(boardId).emit("CLEAR_BOARD");
}

function onCursorMove(socket, boardId, data) {
  socket.to(boardId).emit("CURSOR_MOVE", {
    ...data,
    userId: socket.id,
  });
}

function onDisconnect() {}

// AUTO-CLEAN ALL BOARDS
setInterval(() => {
  const now = Date.now();

  for (const boardId in boards) {
    if (now - boards[boardId].lastActivity > BOARD_TTL) {
      console.log(`Auto-clearing board ${boardId}`);
      delete boards[boardId];
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  onConnection,
  onDrawEvent,
  onClearBoard,
  onCursorMove,
  onDisconnect,
};
