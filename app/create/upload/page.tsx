'use client';

import React, { useState, useCallback, useEffect, FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UploadFormValues {
  title: string;
  description: string;
  tags: string;
  visibility: 'public' | 'private' | 'unlisted';
  channelId: string;
}

interface Channel {
  _id: string;
  name: string;
}

const UploadPage: FC = () => {
  const { register, handleSubmit, reset } = useForm<UploadFormValues>();
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [channels, setChannels] = useState<Channel[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const onThumbnailDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    maxSize: 500 * 1024 * 1024,
  });

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
    isDragActive: isThumbnailDragActive,
  } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
  });

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/my-channel`, {
          withCredentials: true
        });
        setChannels(response.data.channels || []);
      } catch (error) {
        toast.error('Failed to load channels.');
      }
    };

    fetchChannels();
  }, []);

  const onSubmit: SubmitHandler<UploadFormValues> = async (data) => {
    if (!file) {
      toast.error('Please select a video file to upload.');
      return;
    }
    if (!data.channelId) {
      toast.error('Please select a channel.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', data.title.trim());
    formData.append('description', data.description.trim());
    formData.append('tags', data.tags.split(',').map((t) => t.trim()).join(','));
    formData.append('visibility', data.visibility);
    formData.append('channelId', data.channelId);

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
          onUploadProgress: (event) => {
            setProgress(Math.round((event.loaded * 100) / (event.total || 1)));
          },
        }
      );
      toast.success('Video uploaded successfully!');
      reset();
      setFile(null);
      setThumbnail(null);
      setThumbnailPreview(null);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Upload Video
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Video File Drop */}
        <div
          {...getRootProps()}
          className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer bg-white dark:bg-gray-800"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the video here...</p>
          ) : file ? (
            <p>{file.name}</p>
          ) : (
            <p>Drag & drop a video file here, or click to select</p>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Title</label>
          <input
            {...register('title', { required: true })}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Description</label>
          <textarea
            {...register('description')}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white h-24"
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Tags (comma separated)</label>
          <input
            {...register('tags')}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        {/* Visibility Select */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Visibility</label>
          <select
            {...register('visibility')}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>

        {/* Channel Select */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Channel</label>
          <select
            {...register('channelId')}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
          >
            <option value="">Select a channel</option>
            {channels.map((channel) => (
              <option key={channel._id} value={channel._id}>
                {channel.name}
              </option>
            ))}
          </select>
        </div>

        {/* Thumbnail Upload (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Thumbnail (optional)</label>
          <div
            {...getThumbnailRootProps()}
            className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer bg-white dark:bg-gray-800 mb-2"
          >
            <input {...getThumbnailInputProps()} />
            {isThumbnailDragActive ? (
              <p>Drop the image here...</p>
            ) : thumbnail ? (
              <p>{thumbnail.name}</p>
            ) : (
              <p>Drag & drop an image file here, or click to select</p>
            )}
          </div>
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-40 h-auto rounded-lg border border-gray-300 dark:border-gray-700"
            />
          )}
        </div>

        {/* Upload Progress Bar - just above button */}
        {uploading && (
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
            <div
              className="bg-blue-600 text-sm font-semibold text-white text-center leading-6"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <ToastContainer
        toastClassName={() =>
          'relative flex items-center space-x-4 p-6 text-white rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 backdrop-blur-md text-lg'
        }
        closeButton={false}
        autoClose={7000}
        hideProgressBar={true}
      />
    </div>
  );
};

export default UploadPage;
