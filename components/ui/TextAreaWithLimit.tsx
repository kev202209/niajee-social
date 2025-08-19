"use client";

import { useState, useRef, useEffect, forwardRef } from 'react';

interface TextAreaWithLimitProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxChars?: number;
  minRows?: number;
  maxRows?: number;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const TextAreaWithLimit = forwardRef<HTMLTextAreaElement, TextAreaWithLimitProps>(function TextAreaWithLimit({
  value,
  onChange,
  placeholder = "Type your message...",
  maxChars = 500, // Changed from maxWords to maxChars with reasonable default
  minRows = 1,
  maxRows = 6,
  className = "",
  disabled = false,
  autoFocus = false
}: TextAreaWithLimitProps, ref) {
  const [isFocused, setIsFocused] = useState(false);
  const [rows, setRows] = useState(minRows);
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  // support forwarded ref (ref could be function or RefObject) by using innerRef
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(innerRef.current);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore assign to forwarded ref
      ref.current = innerRef.current;
    }
  }, [ref]);

  // Calculate character count
  const charCount = value.length;
  const isOverLimit = charCount > maxChars;

  // Auto-resize functionality
  const updateRows = () => {
    if (innerRef.current) {
      const textarea = innerRef.current;
      const lineHeight = 20; // Approximate line height in pixels
      const padding = 24; // Top and bottom padding
      
      // Reset height to calculate scrollHeight properly
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      
      // Calculate number of rows needed
      const calculatedRows = Math.floor((scrollHeight - padding) / lineHeight);
      const newRows = Math.max(minRows, Math.min(maxRows, calculatedRows));
      
      setRows(newRows);
    }
  };

  useEffect(() => {
    updateRows();
  }, [value, minRows, maxRows, updateRows]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Check character limit - allow typing if under limit or if deleting text
    if (newValue.length <= maxChars || newValue.length < value.length) {
      onChange(newValue);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setRows(Math.max(3, minRows)); // Expand on focus
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    if (!value.trim()) {
      setRows(minRows); // Collapse if empty
    }
  };

  // Handle keydown to prevent space bar conflicts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent event bubbling for certain keys to avoid conflicts with parent components
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Backspace') {
      e.stopPropagation();
    }
    
    // Prevent typing if at character limit (except for deletion keys)
    if (charCount >= maxChars && 
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key) &&
        !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    
    // Handle Enter key for submission (Ctrl+Enter or Shift+Enter)
    if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey)) {
      e.preventDefault();
      // You can emit a custom event or callback here for submission
      const submitEvent = new CustomEvent('submitTextArea', { detail: value });
      innerRef.current?.dispatchEvent(submitEvent);
    }
  };

  // Get border color based on state
  const getBorderColor = () => {
    if (isOverLimit) return 'border-red-500 focus:ring-red-500';
    if (isFocused) return 'border-blue-500 focus:ring-blue-500';
    return 'border-gray-300 dark:border-gray-600 focus:ring-blue-500';
  };

  // Get character count color
  const getCharCountColor = () => {
    if (isOverLimit) return 'text-red-600 dark:text-red-400';
    if (charCount > maxChars * 0.9) return 'text-red-500 dark:text-red-400'; // Warning at 90%
    if (charCount > maxChars * 0.8) return 'text-yellow-600 dark:text-yellow-400'; // Caution at 80%
    return 'text-gray-500 dark:text-gray-400';
  };

  // Get progress bar width
  const getProgressWidth = () => {
    return Math.min((charCount / maxChars) * 100, 100);
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (charCount > maxChars * 0.9) return 'bg-red-500';
    if (charCount > maxChars * 0.8) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="relative">
      <textarea
        ref={innerRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        rows={rows}
        className={`
          w-full px-3 py-3 
          ${getBorderColor()}
          border rounded-lg 
          resize-none 
          focus:outline-none focus:ring-2 
          dark:bg-gray-800 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          transition-all duration-200 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        style={{
          minHeight: `${minRows * 20 + 24}px`, // 20px line height + 24px padding
          maxHeight: `${maxRows * 20 + 24}px`,
        }}
      />
      
      {/* Character count indicator */}
      <div className={`
        absolute bottom-2 right-3 text-xs font-medium
        ${getCharCountColor()}
        transition-colors duration-200
      `}>
        {charCount}/{maxChars}
      </div>
      
      {/* Progress bar (only show when focused or near limit) */}
      {(isFocused || charCount > maxChars * 0.7) && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${getProgressWidth()}%` }}
          />
        </div>
      )}
      
      {/* Hint text */}
      {isFocused && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {isOverLimit ? (
            <span className="text-red-600 dark:text-red-400">
              You&apos;ve exceeded the character limit by {charCount - maxChars} characters
            </span>
          ) : (
            <span>
              Press Ctrl+Enter to submit • {maxChars - charCount} characters remaining
            </span>
          )}
        </div>
      )}
    </div>
  );
});

export default TextAreaWithLimit;