'use client';
import React, { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  planName: string;
  billing: 'monthly' | 'annual';
  onSubmit: (phone: string) => void;
  loading: boolean;
  message?: string | null;
}

export default function PurchaseModal({ open, onClose, planName, billing, onSubmit, loading, message }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [phone, setPhone] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const validationReason = (raw: string): string | null => {
    if (!raw.trim()) return null;
    const cleaned = raw.replace(/\s+/g, '');
    const digits = cleaned.replace(/\D/g, '');

    // Acceptable final normal forms: 07XXXXXXXX / 01XXXXXXXX
    // Step 1: Identify pattern class
    const hasPlus = cleaned.startsWith('+');
    if (hasPlus && !cleaned.startsWith('+254')) return 'International format must start with +254.';
    if (!hasPlus && cleaned.startsWith('254') && digits.length < 12) return 'Incomplete 254 format (needs 12 digits like 2547XXXXXXXX).';

    // Length / prefix checks
    if (digits.startsWith('0')) {
      if (digits.length !== 10) return 'Local numbers must be 10 digits (e.g. 07XXXXXXXX).';
      if (!/^0[71]/.test(digits)) return 'Local number must start with 07 or 01.';
      if (!/^0(7\d{8}|1\d{8})$/.test(digits)) return 'Pattern must be 07 / 01 followed by 8 digits.';
      return null;
    }

    if (digits.startsWith('254')) {
      if (digits.length !== 12) return 'Format 2547XXXXXXXX requires 12 digits.';
      if (!/^254[71]/.test(digits)) return 'After 254 must be 7 or 1.';
      if (!/^254(7\d{8}|1\d{8})$/.test(digits)) return 'Pattern must be 2547 / 2541 + 8 digits.';
      return null;
    }

    // Missing leading 0 case: 7XXXXXXXX or 1XXXXXXXX
    if (/^[71]\d{8}$/.test(digits)) return null;

    return 'Invalid format. Use 07XXXXXXXX, 01XXXXXXXX or +2547XXXXXXXX.';
  };

  const normalizePhone = (raw: string): string | null => {
    const digits = raw.replace(/\D/g, '');
    if (/^0(7\d{8}|1\d{8})$/.test(digits)) return digits;
    if (/^254(7\d{8}|1\d{8})$/.test(digits)) return '0' + digits.slice(3);
    if (/^[71]\d{8}$/.test(digits)) return '0' + digits;
    return null;
  };

  const reason = validationReason(phone);
  const normalizedPhone = normalizePhone(phone);
  const isValid = !!normalizedPhone && !reason;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      setPhone('');
      setError(null);
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!isValid) {
      setError(reason || 'Enter a valid Kenyan number.');
      return;
    }
    setError(null);
    onSubmit(normalizedPhone!);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center px-4 sm:px-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 flex flex-col">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm disabled:opacity-40"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold tracking-tight mb-1">
          Complete Purchase
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-5">
          M-Pesa STK push for <span className="font-medium">{planName}</span> ({billing}) will be sent to your phone.
        </p>
        <label className="text-xs font-medium mb-1" htmlFor="mpesa-phone">
          M-Pesa Phone Number
        </label>
        <input
          ref={inputRef}
          id="mpesa-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={e => {
            setPhone(e.target.value);
            if (error) setError(null);
          }}
          onBlur={() => {
            if (normalizedPhone) setPhone(normalizedPhone);
          }}
          placeholder="07XXXXXXXX or +2547XXXXXXXX"
          className={`w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 mb-1
            ${isValid || !phone
              ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-400/50'
              : 'border-red-400 dark:border-red-500 focus:ring-red-400/50'
            }`}
          aria-invalid={!isValid && !!phone}
          aria-describedby="phone-help phone-error"
        />
        <div id="phone-help" className="text-[10px] text-gray-500 dark:text-gray-400">
          Formats: 07XXXXXXXX / 01XXXXXXXX / +2547XXXXXXXX
        </div>
        {(error || (!isValid && reason)) && (
          <div
            id="phone-error"
            className="text-[11px] mt-2 mb-2 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 text-red-600 dark:text-red-300"
            role="alert"
          >
            {error || reason}
          </div>
        )}
        {message && !error && isValid && (
          <div className="text-[11px] mt-2 mb-2 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3 py-2 text-blue-700 dark:text-blue-300">
            {message}
          </div>
        )}
        <button
          disabled={loading || !isValid}
          onClick={submit}
          className="h-11 rounded-xl font-medium text-sm bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending STK…' : 'Pay with M-Pesa'}
        </button>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
          Confirm the prompt on your device. Close after approval.
        </p>
      </div>
    </div>
  );
}