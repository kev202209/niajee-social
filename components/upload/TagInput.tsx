import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  disabled: boolean;
  maxTags?: number;
}

export default function TagInput({ 
  tags, 
  onAddTag, 
  onRemoveTag, 
  disabled,
  maxTags = 10
}: TagInputProps) {
  const [currentTag, setCurrentTag] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < maxTags) {
      onAddTag(currentTag.trim());
      setCurrentTag('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-blue-600 dark:hover:text-blue-300"
              >
                <FiX className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a tag"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          disabled={disabled || tags.length >= maxTags}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!currentTag.trim() || tags.length >= maxTags || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
          Add
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {tags.length}/{maxTags} tags
      </p>
    </div>
  );
}