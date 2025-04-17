'use client';

import React, { FC, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface OverlayPosition {
  label: string;
  value: 'top' | 'center' | 'bottom';
}

const positions: OverlayPosition[] = [
  { label: 'Top', value: 'top' },
  { label: 'Center', value: 'center' },
  { label: 'Bottom', value: 'bottom' },
];

const EditorPage: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [overlayText, setOverlayText] = useState<string>('');
  const [overlayColor, setOverlayColor] = useState<string>('#ffffff');
  const [overlayPosition, setOverlayPosition] = useState<'top'|'center'|'bottom'>('bottom');
  const [processing, setProcessing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle file drop
  const onDrop = (accepted: File[]) => {
    const f = accepted[0];
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoURL(url);
    setStartTime(0);
    setEndTime(0);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'video/*': []},
    multiple: false,
    maxSize: 500 * 1024 * 1024,
  });

  // Handle trimming update
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setStartTime(val);
  };
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setEndTime(val);
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload a video first.');
      return;
    }
    if (startTime >= endTime) {
      toast.error('Start time must be less than end time.');
      return;
    }
    setProcessing(true);
    try {
      // Placeholder: send formData to API for processing
      const formData = new FormData();
      formData.append('file', file);
      formData.append('start', startTime.toString());
      formData.append('end', endTime.toString());
      formData.append('overlayText', overlayText);
      formData.append('overlayColor', overlayColor);
      formData.append('overlayPosition', overlayPosition);
      // e.g. await axios.post('/api/editor/process', formData);
      await new Promise((r) => setTimeout(r, 2000));
      toast.success('Video processed successfully!');
    } catch {
      toast.error('Processing failed. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Video Editor</h1>
        </header>
        <div className="space-y-6">
          {/* Dropzone */}
          {!videoURL && (
            <div
              {...getRootProps()}
              className="p-8 border-2 border-dashed rounded-lg text-center bg-white dark:bg-gray-800 cursor-pointer"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the video here...</p>
              ) : (
                <p>Drag & drop a video file here, or click to select</p>
              )}
            </div>
          )}

          {/* Video Preview & Controls */}
          {videoURL && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <video
                ref={videoRef}
                src={videoURL}
                controls
                className="w-full max-h-[400px] rounded"
              />
              <div className="mt-4 space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time (s)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={startTime}
                      onChange={handleStartChange}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex-1 mt-4 md:mt-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time (s)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={endTime}
                      onChange={handleEndChange}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overlay Text</label>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Text Color</label>
                    <input
                      type="color"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="w-full h-10 border-0 p-0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                    <select
                      value={overlayPosition}
                      onChange={(e) => setOverlayPosition(e.target.value as any)}
                      className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      {positions.map((pos) => (
                        <option key={pos.value} value={pos.value}>{pos.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full py-3 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Process Video'}
                </button>
              </div>
            </div>
          )}
        </div>
        <ToastContainer />
      </main>
    </div>
  );
};

export default EditorPage;