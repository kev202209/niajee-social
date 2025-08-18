"use client";

import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type Notification =
  | { type: 'like';   fromUser: string; videoId: string; createdAt: string }
  | { type: 'comment'; fromUser: string; videoId: string; commentId: string; text: string; createdAt: string }
  | { type: 'follow'; fromUser: string; createdAt: string }
  | { type: 'system'; message: string; severity?: 'info' | 'warn' | 'error'; createdAt: string };

interface ServerToClientEvents {
  getNotification: (notification: Notification) => void;
}

interface ClientToServerEvents {
  newUser: (username: string) => void;
  sendNotification: (payload: { receiverUsername: string; notification: Notification }) => void;
}

console.log("Socket connecting to:", API_URL);

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_URL, {
  autoConnect: true,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Socket connected successfully");
  const username = getUsernameFromLocalStorage();
  if (username) {
    socket.emit('newUser', username);
    console.log("Registered as online user:", username);
  }
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  if (error.message.includes("Authentication")) {
    console.error("Authentication failed. Try logging in again.");
  }
  setTimeout(() => {
    if (!socket.connected) socket.connect();
  }, 3000);
});

socket.on("disconnect", (reason) => {
  console.log(`Socket disconnected: ${reason}`);
  if (reason === "io server disconnect") {
    setTimeout(() => socket.connect(), 3000);
  }
});

// Typed notification listener
socket.on("getNotification", (notification) => {
  console.log("Notification received:", notification);
  // Narrow by discriminant:
  switch (notification.type) {
    case 'comment':
      // handle comment notification
      break;
    case 'like':
      break;
    case 'follow':
      break;
    case 'system':
      break;
  }
});

function getUsernameFromLocalStorage(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return typeof user.username === 'string' ? user.username : null;
  } catch {
    return null;
  }
}

// Strongly typed send
export const sendNotification = (receiverUsername: string, notification: Notification) => {
  socket.emit('sendNotification', { receiverUsername, notification });
};

export default socket;