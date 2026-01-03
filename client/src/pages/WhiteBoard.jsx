import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSocket } from "../socket";

const COLORS = [
  "#000000",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

const WhiteBoard = () => {
  const { id: boardId } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const cursorsRef = useRef({});
  const socketRef = useRef(null);

  const drawingState = useRef({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  });

  // tool state
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(2);
  const [, forceRender] = useState(0);

  // create new board
  const createNewBoard = () => {
    const newId = crypto.randomUUID();
    navigate(`/board/${newId}`);
  };

  // copy share link
  const copyShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Board link copied");
  };

  useEffect(() => {
    socketRef.current = createSocket(boardId);
    const socket = socketRef.current;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    socket.on("INIT_BOARD", (strokes) => {
      strokes.forEach(drawStroke);
    });

    socket.on("DRAW_EVENT", drawStroke);

    socket.on("CURSOR_MOVE", (cursor) => {
      cursorsRef.current[cursor.userId] = cursor;
      forceRender((v) => v + 1);
    });

    socket.on("CLEAR_BOARD", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.disconnect();
    };
  }, [boardId]);

  const drawStroke = ({ x1, y1, x2, y2, color, width, tool }) => {
    const ctx = canvasRef.current.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = width;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = tool === "pencil" ? 0.4 : 1;
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const startDraw = (e) => {
    drawingState.current.isDrawing = true;
    drawingState.current.lastX = e.clientX;
    drawingState.current.lastY = e.clientY;
  };

  const draw = (e) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("CURSOR_MOVE", {
      x: e.clientX,
      y: e.clientY,
      color,
      tool,
    });

    if (!drawingState.current.isDrawing) return;

    const stroke = {
      x1: drawingState.current.lastX,
      y1: drawingState.current.lastY,
      x2: e.clientX,
      y2: e.clientY,
      color,
      width,
      tool,
    };

    drawStroke(stroke);
    socket.emit("DRAW_EVENT", stroke);

    drawingState.current.lastX = e.clientX;
    drawingState.current.lastY = e.clientY;
  };

  const stopDraw = () => {
    drawingState.current.isDrawing = false;
  };

  return (
    <>
      {/* TOOLBAR */}
      <div className="fixed top-4 left-4 bg-white shadow-lg rounded-lg p-3 flex gap-2 z-10 items-center">
        {/* BOARD CONTROLS */}
        <button onClick={createNewBoard} className="px-2 py-1 border rounded">
          ➕ New Board
        </button>

        <button onClick={copyShareLink} className="px-2 py-1 border rounded">
          🔗 Share
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* TOOLS */}
        <button onClick={() => setTool("pen")}>✏️</button>
        <button onClick={() => setTool("pencil")}>✎</button>
        <button onClick={() => setTool("eraser")}>🧽</button>

        <input
          type="range"
          min="1"
          max="20"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />

        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-5 h-5 rounded-full border"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* OTHER USERS CURSORS */}
      {Object.values(cursorsRef.current).map((c) => (
        <div
          key={c.userId}
          className="fixed pointer-events-none z-20"
          style={{
            left: c.x,
            top: c.y,
            transform: "translate(10px, 10px)",
          }}
        >
          {c.tool === "pen" && (
            <span style={{ color: c.color, fontSize: "18px" }}>✏️</span>
          )}
          {c.tool === "pencil" && (
            <span style={{ color: c.color, fontSize: "18px" }}>✎</span>
          )}
          {c.tool === "eraser" && (
            <span style={{ fontSize: "18px" }}>🧽</span>
          )}
        </div>
      ))}

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          cursor:
            tool === "eraser"
              ? "cell"
              : tool === "pencil"
              ? "crosshair"
              : "pointer",
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
      />
    </>
  );
};

export default WhiteBoard;
