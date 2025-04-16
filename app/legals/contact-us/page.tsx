'use client';

import React, { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Replace with your submission logic (e.g., API call)
    try {
      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setError("");
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 pt-10">Contact Us</h1>
          <p className="text-lg">
            If you have any questions, concerns, or feedback, please do not hesitate to get in touch.
          </p>
        </header>

        {submitted ? (
          <div className="p-6 bg-green-100 dark:bg-green-900 rounded shadow text-center">
            <p className="text-green-800 dark:text-green-200 text-xl">
              Thank you for reaching out! We will get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email on the same line for larger screens */}
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1">
                <label htmlFor="name" className="block font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 mt-4 md:mt-0">
                <label htmlFor="email" className="block font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>

            {error && <div className="text-red-600">{error}</div>}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-blue-500 dark:bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p>
            Alternatively, you can email us directly at{" "}
            <a
              href="mailto:support@mosaic.com"
              className="text-blue-500 dark:text-blue-400 underline"
            >
              support@mosaic-social.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
