import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface MentionInputProps {
  mentions: string[];
  onAddMention: (mention: string) => void;
  onRemoveMention: (mention: string) => void;
  disabled: boolean;
  maxMentions?: number;
}

export default function MentionInput({ 
  mentions, 
  onAddMention, 
  onRemoveMention, 
  disabled,
  maxMentions = 5
}: MentionInputProps) {
  const [currentMention, setCurrentMention] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMention();
    }
  };

  const addMention = () => {
    if (currentMention.trim() && !mentions.includes(currentMention.trim()) && mentions.length < maxMentions) {
      const mention = currentMention.startsWith('@') ? currentMention.trim() : `@${currentMention.trim()}`;
      onAddMention(mention);
      setCurrentMention('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Mentions
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {mentions.map(mention => (
          <span
            key={mention}
            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
          >
            {mention}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemoveMention(mention)}
                className="hover:text-purple-600 dark:hover:text-purple-300"
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
          value={currentMention}
          onChange={(e) => setCurrentMention(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="@username"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          disabled={disabled || mentions.length >= maxMentions}
        />
        <button
          type="button"
          onClick={addMention}
          disabled={!currentMention.trim() || mentions.length >= maxMentions || disabled}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition"
        >
          Add
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {mentions.length}/{maxMentions} mentions
      </p>
    </div>
  );
}