import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket) {
    // In a real app, this would connect to your WebSocket server
    socket = io("http://localhost:3001", {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return;
  }

  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
