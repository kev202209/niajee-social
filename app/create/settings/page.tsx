"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FiSave } from "react-icons/fi";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = async () => {
    try {
      // Example API call placeholder
      await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          emailNotifications,
          darkMode,
        }),
      });

      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>

          {/* Display Name */}
          <div className="mb-5">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your display name"
            />
          </div>

          {/* Bio */}
          <div className="mb-5">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tell us a little about yourself"
              rows={4}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center mb-5">
            <input
              id="emailNotifications"
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
            />
            <label
              htmlFor="emailNotifications"
              className="ml-3 text-gray-800 dark:text-gray-300 font-medium"
            >
              Enable Email Notifications
            </label>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center mb-6">
            <input
              id="darkMode"
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
            />
            <label
              htmlFor="darkMode"
              className="ml-3 text-gray-800 dark:text-gray-300 font-medium"
            >
              Enable Dark Mode
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:opacity-90 transition"
          >
            <FiSave className="text-lg" />
            Save Settings
          </button>
        </motion.div>

        <ToastContainer
          toastClassName={() =>
            "relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg"
          }
          closeButton={false}
          autoClose={7000}
          hideProgressBar={true}
        />
      </div>
    </div>
  );
}
