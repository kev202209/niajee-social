import React from 'react';
import { UploadForm } from '../../app/create/channels/[channelId]/upload/types';
import TagInput from './TagInput';
import MentionInput from './MentionInput';

interface FormFieldsProps {
  form: UploadForm;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addMention: (mention: string) => void;
  removeMention: (mention: string) => void;
  uploading: boolean;
  categories: string[];
}

export default function FormFields({
  form,
  handleInputChange,
  addTag,
  removeTag,
  addMention,
  removeMention,
  uploading,
  categories
}: FormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={form.title}
          onChange={handleInputChange}
          placeholder={`Enter ${form.contentType} title`}
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required
          disabled={uploading}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {form.title.length}/100 characters
        </p>
      </div>

      {/* Description/Caption */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {form.contentType === 'short' ? 'Caption' : 'Description'}
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleInputChange}
          placeholder={`Tell viewers about your ${form.contentType}`}
          rows={form.contentType === 'short' ? 3 : 4}
          maxLength={form.contentType === 'short' ? 1000 : 5000}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          disabled={uploading}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {form.description.length}/{form.contentType === 'short' ? 1000 : 5000} characters
        </p>
      </div>

      {/* Short-specific fields */}
      {form.contentType === 'short' && (
        <>
          <div>
            <label htmlFor="song" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Song/Music (Optional)
            </label>
            <input
              type="text"
              id="song"
              name="song"
              value={form.song || ''}
              onChange={handleInputChange}
              placeholder="Add music credit"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={uploading}
            />
          </div>

          {/* Mentions */}
          <MentionInput
            mentions={form.mentions}
            onAddMention={addMention}
            onRemoveMention={removeMention}
            disabled={uploading}
          />

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={form.location || ''}
              onChange={handleInputChange}
              placeholder="Add location"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={uploading}
            />
          </div>

          {/* Social Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Social Settings</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allowLikes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Likes
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Let viewers like your short
                </p>
              </div>
              <input
                type="checkbox"
                id="allowLikes"
                name="allowLikes"
                checked={form.allowLikes}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={uploading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allowDuet" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Duets
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Let others create duets with your short
                </p>
              </div>
              <input
                type="checkbox"
                id="allowDuet"
                name="allowDuet"
                checked={form.allowDuet}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={uploading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="isSensitive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sensitive Content
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mark if content may be sensitive
                </p>
              </div>
              <input
                type="checkbox"
                id="isSensitive"
                name="isSensitive"
                checked={form.isSensitive}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                disabled={uploading}
              />
            </div>
          </div>
        </>
      )}

      {/* Long-form video specific fields */}
      {form.contentType === 'video' && (
        <>
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={uploading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={form.visibility}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={uploading}
            >
              <option value="public">Public - Anyone can watch</option>
              <option value="unlisted">Unlisted - Only people with the link</option>
              <option value="private">Private - Only you can watch</option>
            </select>
          </div>
        </>
      )}

      {/* Tags (for both video and shorts) */}
      <TagInput
        tags={form.tags}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        disabled={uploading}
      />

      {/* Comments Setting */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="commentsEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Allow Comments
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Viewers can comment on your {form.contentType}
          </p>
        </div>
        <input
          type="checkbox"
          id="commentsEnabled"
          name="commentsEnabled"
          checked={form.commentsEnabled}
          onChange={handleInputChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          disabled={uploading}
        />
      </div>

      {/* Public Setting (for shorts) */}
      {form.contentType === 'short' && (
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Public Short
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Make your short visible to everyone
            </p>
          </div>
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={form.isPublic}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
}