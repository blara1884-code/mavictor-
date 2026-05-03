import { io } from "socket.io-client";

// In this environment, we connect to the same host.
// We use polling as a fallback and ensure we handle the proxy correctly.
const socket = io({
  transports: ["websocket", "polling"], // Preferred websocket first
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 30000,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

export default socket;
