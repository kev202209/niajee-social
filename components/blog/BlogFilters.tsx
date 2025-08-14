"use client";

import { useState } from 'react';
import { BlogFilterDto } from '@/types';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

interface BlogFiltersProps {
  categories: string[];
  onFilterChange: (filters: Partial<BlogFilterDto>) => void;
  currentFilters: BlogFilterDto;
  onClearFilters: () => void;
}

export default function BlogFilters({ 
  categories, 
  onFilterChange, 
  currentFilters, 
  onClearFilters 
}: BlogFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleCategoryChange = (category: string) => {
    onFilterChange({ 
      category: currentFilters.category === category ? undefined : category 
    });
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      const currentTags = currentFilters.tags || [];
      
      if (!currentTags.includes(newTag)) {
        onFilterChange({ tags: [...currentTags, newTag] });
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = currentFilters.tags || [];
    onFilterChange({ 
      tags: currentTags.filter(tag => tag !== tagToRemove) 
    });
  };

  const hasActiveFilters = currentFilters.category || 
                          (currentFilters.tags && currentFilters.tags.length > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <FiFilter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <FiX className="w-4 h-4" />
            <span className="text-sm">Clear all</span>
          </button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    currentFilters.category === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Add a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {currentFilters.tags && currentFilters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentFilters.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      #{tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}