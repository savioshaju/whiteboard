import { io } from "socket.io-client";

export const createSocket = (boardId) =>
  io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["websocket"],
    query: { boardId },
  });
