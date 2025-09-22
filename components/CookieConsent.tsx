'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    posthog?: {
      opt_in_capturing?: () => void;
      opt_out_capturing?: () => void;
    };
  }
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const status = getCookie('cookie_consent');
    if (!status) {
      setVisible(true);
      return;
    }
    if (status === 'accepted') {
      window.posthog?.opt_in_capturing?.();
    } else {
      window.posthog?.opt_out_capturing?.();
    }
  }, []);

  const acceptAll = () => {
    setCookie('cookie_consent', 'accepted', 365);
    window.posthog?.opt_in_capturing?.();
    setVisible(false);
  };

  const cancel = () => {
    // Record declined choice and dismiss
    setCookie('cookie_consent', 'declined', 365);
    window.posthog?.opt_out_capturing?.();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
    >
      <div className="mx-auto max-w-4xl rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            We use cookies to operate this site and improve your experience. Essential cookies are
            required and the site may not function correctly without them. By continuing to use this site, you agree to our use of cookies. See our{' '}
            <Link href="/privacy" className="underline text-indigo-600 dark:text-indigo-400">
              Privacy Policy
            </Link>.
          </p>
          <div className="flex items-center gap-3 md:ml-auto">
            <button
              onClick={cancel}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}