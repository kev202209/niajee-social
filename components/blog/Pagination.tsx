"use client";

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPages?: number; // Number of page buttons to show
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPages = 5 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(showPages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= half) {
      end = Math.min(totalPages, showPages);
    }
    if (currentPage + half >= totalPages) {
      start = Math.max(1, totalPages - showPages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }
    
    // Add page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:text-gray-500 dark:disabled:hover:text-gray-400 transition-colors"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:text-gray-500 dark:disabled:hover:text-gray-400 transition-colors"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>

      {/* Page Info */}
      <div className="hidden sm:flex items-center ml-4 text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}