'use client';

import React from "react";
import Link from "next/link";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 pt-10">Cookie Policy</h1>
          <p className="text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p className="mb-4">
            This Cookie Policy explains how Niajee (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar technologies to recognize you when you visit our website, mobile applications, and other platforms (collectively, the &quot;Services&quot;). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">2. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          <p className="mb-4">
            Cookies set by the website owner (in this case, Niajee) are called &quot;first-party cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party cookies.&quot; Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">3. Types of Cookies We Use</h2>
          <p className="mb-4">
            We use several types of cookies for different reasons:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>
              <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.
            </li>
            <li>
              <strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
            </li>
            <li>
              <strong>Functionality Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
            </li>
            {/* <li>
              <strong>Targeting/Advertising Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.
            </li>
            <li>
              <strong>Social Media Cookies:</strong> These cookies are set by social media services that we have added to the site to enable you to share our content with your friends and networks. They can track your browser across other sites and build a profile of your interests.
            </li> */}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">4. How Long Do Cookies Stay On Your Device</h2>
          <p className="mb-4">
            The length of time a cookie will remain on your device depends on whether it is a &quot;persistent&quot; or &quot;session&quot; cookie. Session cookies will remain on your device until you stop browsing. Persistent cookies remain on your device until they expire or are deleted.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">5. How to Manage Cookies</h2>
          <p className="mb-4">
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager that we provide on our website.
          </p>
          <p className="mb-4">
            Most web browsers also allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">www.allaboutcookies.org</a>.
          </p>
          <p className="mb-4">
            Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">6. Changes to This Cookie Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time. The updated version will be indicated by an updated &quot;Last updated&quot; date at the top of this Cookie Policy. We encourage you to review this Cookie Policy frequently to be informed of how we are using cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <ul className="list-disc ml-8 mb-4">
            <li>By visiting this page on our website: <Link href="/legals/contact-us" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">niajee.com/legals/contact-us</Link></li>
            <li>By email: <a href="mailto:support@niajee.com" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">support@niajee.com</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}