"use client";

import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Debug output to confirm URL
console.log("Socket connecting to:", API_URL);

export const socket = io(API_URL, {
  autoConnect: true,
  withCredentials: true, // This ensures the sggtx cookie is sent with the connection
});

// Connection event handlers
socket.on("connect", () => {
  console.log("Socket connected successfully");
  
  // After successful connection, register as an online user
  // This aligns with the @SubscribeMessage('newUser') on the backend
  const username = getUsernameFromLocalStorage(); // Implement this function
  if (username) {
    socket.emit('newUser', username);
    console.log("Registered as online user:", username);
  }
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  
  // This could be due to authentication issues with the JWT cookie
  if (error.message.includes("Authentication")) {
    console.error("Authentication failed. Try logging in again.");
  }
  
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

// Listen for notifications - matches the 'getNotification' event from backend
socket.on("getNotification", (notification) => {
  console.log("Notification received:", notification);
  // Handle notification (show toast, update UI, etc.)
});

// Helper function to get username
function getUsernameFromLocalStorage() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || null;
  } catch (error) {
    console.error('Error getting username from localStorage:', error);
    return null;
  }
}

// Helper function to send notification
export const sendNotification = (receiverUsername: string, data: any) => {
  socket.emit('sendNotification', {
    receiverUsername, 
    data
  });
};

export default socket;