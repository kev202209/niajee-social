// lib/customAdapter.ts
import { Adapter, AdapterUser, AdapterSession } from "next-auth/adapters";

// Base URL of your Node.js API server.
const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api/auth";
console.log("API_BASE", API_BASE);

export const customAdapter = (): Adapter => {
  return {
    // Create a new user by sending a POST request to your server.
    async createUser(user: any) {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!res.ok) {
        throw new Error("Error creating user");
      }
      const createdUser = await res.json();
      return createdUser as AdapterUser;
    },

    // Retrieve a user by id.
    async getUser(id) {
      const res = await fetch(`${API_BASE}/getUser/${id}`, {
        method: "GET",
      });
      if (!res.ok) return null;
      const user = await res.json();
      return user as AdapterUser;
    },

    // Get a user by email.
    async getUserByEmail(email) {
      const res = await fetch(`${API_BASE}/getUserByEmail?email=${encodeURIComponent(email)}`, {
        method: "GET",
      });
      if (!res.ok) return null;
      const user = await res.json();
      return user as AdapterUser;
    },

    // Update a user.
    async updateUser(user) {
      const res = await fetch(`${API_BASE}/updateUser/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error("Error updating user");
      const updatedUser = await res.json();
      return updatedUser as AdapterUser;
    },

    // Delete a user (if needed).
    async deleteUser(userId) {
      await fetch(`${API_BASE}/deleteUser/${userId}`, { method: "DELETE" });
      return null;
    },

    // (Other adapter methods such as linking accounts, sessions, and verification tokens
    // should be implemented similarly as needed.)
    
    // For this example, you may return null or implement empty stubs for methods you don't use.
    async linkAccount() { return Promise.resolve(); },
    async unlinkAccount() { return Promise.resolve(); },
    async getSessionAndUser() { return Promise.resolve(null); },
    async createSession(session) { 
      const res = await fetch(`${API_BASE}/createSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      if (!res.ok) {
        throw new Error("Error creating session");
      }
      const createdSession = await res.json();
      return createdSession as AdapterSession;
    },
    async updateSession() { return Promise.resolve(null); },
    async deleteSession() { return Promise.resolve(null); },
    async createVerificationToken() { return Promise.resolve(null); },
    async useVerificationToken() { return Promise.resolve(null); },
  };
};
