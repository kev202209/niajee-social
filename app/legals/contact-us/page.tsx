'use client';

import { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const sanitizeInput = (input: string) => {
    // Sanitize using DOMPurify and trim whitespace
    return DOMPurify.sanitize(input.trim());
  };

  const validateEmail = (email: string) => {
    // Basic email regex validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(form.name),
      email: sanitizeInput(form.email),
      subject: sanitizeInput(form.subject),
      message: sanitizeInput(form.message),
    };

    // Basic validation
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
      toast.error("⚠️ Name, Email, and Message are required.");
      return;
    }

    if (!validateEmail(sanitizedData.email)) {
      toast.error("📧 Please enter a valid email address.");
      return;
    }

    if (sanitizedData.message.length < 10) {
      toast.error("📝 Message should be at least 10 characters long.");
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contact`, sanitizedData);

      toast.success(" Message was successfully Recieved.");

      setForm({ name: '', email: '', subject: '', message: '' });

    } catch (error) {
      toast.error("❌ Failed to send message. Please try again!")
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl pt-20">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-1/2 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-1/2 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <input
          type="text"
          name="subject"
          placeholder="Subject (optional)"
          value={form.subject}
          onChange={handleChange}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          className="w-full p-3 h-40 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition duration-300"
        >
          Send Message
        </button>
      </form>

      <ToastContainer
        toastClassName={() =>
          "relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg"
        }
        closeButton={false}
        autoClose={7000}
        hideProgressBar={true}
      />
    </div>
  );
};

export default ContactForm;
