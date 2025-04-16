'use client';

import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 pt-10">Privacy Policy</h1>
          <p className="text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Mosaic ("we", "us", or "our"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use our services, including our website, mobile applications, and other platforms (collectively, the "Services"). By using our Services, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
          <p className="mb-4">
            We collect different types of information in connection with the services we provide. This includes:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>
              <strong>Personal Information:</strong> Data that can be used to identify you, such as your name, email address, phone number, and other contact details when you register or update your profile.
            </li>
            <li>
              <strong>Usage Data:</strong> Information on how you access and use the Services, including pages viewed, features used, and actions taken.
            </li>
            <li>
              <strong>Device Information:</strong> Details about the device you use to access our Services (such as IP address, browser type, operating system, and unique device identifiers).
            </li>
            <li>
              <strong>Cookies and Tracking Data:</strong> Information collected through cookies, web beacons, and other tracking technologies to enhance user experience, analyze usage patterns, and deliver targeted advertising.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
          <p className="mb-4">
            The information we collect is used to:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>Provide, operate, and maintain our Services.</li>
            <li>Improve your experience by personalizing content and recommendations.</li>
            <li>Understand and analyze how you use our Services.</li>
            <li>Develop new products, features, and services.</li>
            <li>Communicate with you, including customer support and updates about your account or changes to our Services.</li>
            <li>Send you marketing and promotional materials, subject to your consent.</li>
            <li>Monitor and analyze usage and trends to better serve you.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">4. Disclosure of Your Information</h2>
          <p className="mb-4">
            We may share your information with:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>
              <strong>Service Providers:</strong> Third parties that perform services on our behalf, such as data analytics, payment processing, and marketing services.
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business.
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law, regulation, or legal process, or to protect the rights, property, or safety of Mosaic, our users, or others.
            </li>
          </ul>
          <p className="mb-4">
            We will not sell or rent your personal information to third parties for their marketing purposes without your explicit consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">5. Data Security</h2>
          <p className="mb-4">
            We take the security of your data seriously and implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the internet, or method of electronic storage, is 100% secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">6. Your Data Protection Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>The right to access – You have the right to request copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li>The right to restrict processing – You have the right to request that we restrict the processing
    of your personal data, under certain conditions.</li>
            <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>
          <p className="mb-4">
            If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at [contact email].
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">7. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>By a call: 07000000998847</li>
            <li>By visiting this page on our website: mosaic-social.com/legals/contact-us</li>
            <li>By mail: support@mosaic-social.com</li>
          </ul>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Mosaic. All rights reserved.
        </footer>
      </div>    

    </div>
  );
}