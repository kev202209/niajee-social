"use client";

import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const socket = io(API_URL, {
  autoConnect: true,
  withCredentials: true,
});

// Connection event handlers
socket.on("connect", () => {
  console.log("Socket connected successfully");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  
  setTimeout(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, 3000);
});

socket.on("disconnect", (reason) => {
  console.log(`Socket disconnected: ${reason}`);
  
  if (reason === "io server disconnect") {
    setTimeout(() => {
      socket.connect();
    }, 3000);
  }
});

export default socket;