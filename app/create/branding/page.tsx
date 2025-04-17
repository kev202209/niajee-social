'use client';

import React, { FC, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface BrandingFormValues {
  thumbnail: File | null;
  channelLogo: File | null;
  watermark: File | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

const availableFonts = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Roboto, sans-serif',
];

const BrandingPage: FC = () => {
  const { register, handleSubmit, setValue, watch } = useForm<BrandingFormValues>();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const onFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: 'thumbnail' | 'channelLogo' | 'watermark',
  ) => {
    const file = e.target.files?.[0] || null;
    setValue(field, file);
    if (file) {
      const preview = URL.createObjectURL(file);
      if (field === 'thumbnail') setThumbnailPreview(preview);
      if (field === 'channelLogo') setLogoPreview(preview);
      if (field === 'watermark') setWatermarkPreview(preview);
    }
  };

  const onSubmit: SubmitHandler<BrandingFormValues> = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
      if (data.channelLogo) formData.append('channelLogo', data.channelLogo);
      if (data.watermark) formData.append('watermark', data.watermark);
      formData.append('primaryColor', data.primaryColor);
      formData.append('secondaryColor', data.secondaryColor);
      formData.append('fontFamily', data.fontFamily);
      formData.append('channelId', '<YOUR_CHANNEL_ID>');

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/channels/branding`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      toast.success('Branding settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save branding settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = watch('primaryColor', '#000000');
  const secondaryColor = watch('secondaryColor', '#ffffff');
  const fontFamily = watch('fontFamily', availableFonts[0]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-6 overflow-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Thumbnails & Branding</h1>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Thumbnail Upload */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Channel Thumbnail</h2>
            <div className="flex items-center space-x-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileChange(e, 'thumbnail')}
                  className="block text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-24 h-24 rounded-md object-cover"
                />
              )}
            </div>
          </section>

          {/* Channel Logo Upload */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Channel Logo</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e, 'channelLogo')}
                className="block text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
            </div>
          </section>

          {/* Watermark Upload */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Watermark (Optional)</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e, 'watermark')}
                className="block text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {watermarkPreview && (
                <img
                  src={watermarkPreview}
                  alt="Watermark Preview"
                  className="w-24 h-24 object-contain opacity-75"
                />
              )}
            </div>
          </section>

          {/* Color & Font Settings */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Colors & Fonts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Primary Color</label>
                <input
                  type="color"
                  {...register('primaryColor')}
                  defaultValue="#000000"
                  className="w-full h-10 p-0 border-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Secondary Color</label>
                <input
                  type="color"
                  {...register('secondaryColor')}
                  defaultValue="#ffffff"
                  className="w-full h-10 p-0 border-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Font Family</label>
                <select
                  {...register('fontFamily')}
                  defaultValue={availableFonts[0]}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {availableFonts.map((font) => (
                    <option key={font} value={font}>{font.split(',')[0]}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Branding'}
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
      </main>
    </div>
  );
};

export default BrandingPage;
