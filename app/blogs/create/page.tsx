"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import  Button  from "@/components/ui/CustomButton";
import { toast } from "sonner";
import BlockEditor from '@/components/blog/BlockEditor';
import type { OutputData } from "@editorjs/editorjs";
import { CreateBlogDto } from '@/types';
import { FiBookmark, FiEye, FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = [
  'Technology',
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Science',
  'Health',
  'Lifestyle',
  'Travel',
  'Food',
  'Education',
  'Entertainment',
  'Other'
];

export default function CreateBlogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  const [formData, setFormData] = useState<CreateBlogDto>({
    title: '',
    content: { blocks: [] } as OutputData, // Initialize as empty OutputData so TS is satisfied
    excerpt: '',
    category: 'Technology',
    tags: [],
    status: 'draft'
  });
  
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Redirect if not authenticated
  // useEffect(() => {
  //   if (!user) {
  //     router.push('/login?redirect=/blogs/create');
  //   }
  // }, [user, router]);

  const handleInputChange = <K extends keyof CreateBlogDto>(field: K, value: CreateBlogDto[K]) => {
    setFormData(prev => ({ ...prev, [field]: value } as CreateBlogDto));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, featuredImage: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, featuredImage: 'Image size must be less than 5MB' }));
      return;
    }

    setFeaturedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFeaturedImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear error
    setErrors(prev => ({ ...prev, featuredImage: '' }));
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      
      const tags = formData.tags ?? [];
      if (!tags.includes(newTag) && tags.length < 10) {
        handleInputChange('tags', [...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', (formData.tags ?? []).filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    // Safe content validation
    const hasContent = formData.content?.blocks && formData.content.blocks.length > 0;
    if (!hasContent) {
      newErrors.content = 'Content is required';
    } else if (JSON.stringify(formData.content).length < 100) {
      newErrors.content = 'Content must be at least 100 characters';
    }

    if (!formData.excerpt?.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if ((formData.excerpt?.length ?? 0) < 20) {
      newErrors.excerpt = 'Excerpt must be at least 20 characters';
    }

    if ((formData.tags ?? []).length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', JSON.stringify(formData.content?.blocks ?? []));
      submitData.append('excerpt', formData.excerpt || '');
      submitData.append('category', formData.category || '');

      // Send tags as array (tags[])
      (formData.tags ?? []).forEach(tag => submitData.append('tags', tag));

      submitData.append('status', status);

      // Optional fields with defaults
      submitData.append('subtitle', formData.subtitle || '');
      submitData.append('slug', formData.slug || '');
      submitData.append('channelId', formData.channelId || '');
      submitData.append('allowComments', String(formData.allowComments ?? true));
      submitData.append('allowHighlighting', String(formData.allowHighlighting ?? true));
      submitData.append('allowResponses', String(formData.allowResponses ?? true));
      submitData.append('isMonetized', String(formData.isMonetized ?? false));
      submitData.append('isPremium', String(formData.isPremium ?? false));
      // topics, seoMetadata, customCSS, isSensitive, contentWarning
      (formData.topics || []).forEach(topic => submitData.append('topics', topic));
      if (formData.seoMetadata) submitData.append('seoMetadata', JSON.stringify(formData.seoMetadata));
      if (formData.customCSS) submitData.append('customCSS', formData.customCSS);
      submitData.append('isSensitive', String(formData.isSensitive ?? false));
      if (formData.contentWarning) submitData.append('contentWarning', formData.contentWarning);

      if (featuredImage) {
        submitData.append('featuredImage', featuredImage);
      }
      
      console.log('---------Submitting data:', submitData);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
        method: 'POST',
        credentials: 'include',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Blog ${status === 'published' ? 'published' : 'saved'} successfully!`);
        router.push(`/blogs/${data.data.slug}`);
      } else {
        toast.error(data.message || 'Failed to create blog');
        setErrors({ submit: data.message || 'Failed to create blog' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create blog';
      toast.error(message);
      setErrors({ submit: message });
     } finally {
       setIsSubmitting(false);
     }
  };

  // Simple, safe preview renderer — avoids using `any` and prevents XSS by escaping HTML.
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const renderEditorContent = (content?: OutputData) => {
    if (!content?.blocks || content.blocks.length === 0) {
      return '<p>Your blog content will appear here...</p>';
    }

    // Render each block as JSON preview — safe and avoids `any` typing.
    return content.blocks
      .map(block => `<pre class="editor-block-preview">${escapeHtml(JSON.stringify(block, null, 2))}</pre>`)
      .join('');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Blog
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                <FiEye className="w-4 h-4" />
                <span>{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
              
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                <FiBookmark className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              
              <Button
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <FiBookmark className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <FiBookmark className="w-4 h-4" />
                    <span>Publish</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Form */}
          {!showPreview ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your blog title..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Write a brief description of your blog..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.excerpt}</p>
                )}
              </div>

              {/* Category and Featured Image Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image
                  </label>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                    >
                      <FiUpload className="w-5 h-5 mr-2" />
                      Upload Image
                    </button>
                    {errors.featuredImage && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.featuredImage}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Image Preview */}
              {featuredImagePreview && (
                <div className="relative">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={featuredImagePreview}
                      alt="Featured image preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags * (Press Enter to add)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  placeholder="Add tags for your blog..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(formData.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(formData.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <BlockEditor
                  value={formData.content}
                  onChange={(data) => handleInputChange('content', data)}
                  placeholder="Write your blog content here..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}
            </div>
          ) : (
            /* Preview */
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                {/* Preview Badge */}
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                    📝 This is a preview of your blog. Click &quot;Edit&quot; to continue editing.
                  </p>
                </div>

                {/* Category */}
                <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {formData.category}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {formData.title || 'Your Blog Title'}
                </h1>

                {/* Excerpt */}
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {formData.excerpt || 'Your blog excerpt will appear here...'}
                </p>

                {/* Featured Image */}
                {featuredImagePreview && (
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                    <Image
                      src={featuredImagePreview}
                      alt="Featured image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderEditorContent(formData.content)
                  }}
                />

                {/* Tags */}
                {(formData.tags ?? []).length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <div className="flex flex-wrap gap-2">
                      {(formData.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}