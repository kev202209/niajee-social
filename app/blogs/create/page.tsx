"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import Button from "@/components/ui/CustomButton";
import { toast } from "sonner";
import BlockEditor from '@/components/blog/BlockEditor';
import DOMPurify from 'dompurify';
import type { OutputData } from "@editorjs/editorjs";
import { CreateBlogDto } from '@/types';
import { FiBookmark, FiEye, FiUpload, FiX, FiArrowLeft, FiLoader } from 'react-icons/fi';
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

type BlogLimitData = {
  role: string;
  unlimited: boolean;
  limit: number | null;
  used: number;
  remaining: number | null;
  canCreate: boolean;
};

type BlogLimitResponse = {
  success: boolean;
  message?: string;
  data?: BlogLimitData;
};

export default function CreateBlogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  const [formData, setFormData] = useState<CreateBlogDto>({
    title: '',
    content: { blocks: [] } as OutputData,
    excerpt: '',
    category: 'Technology',
    tags: [],
    status: 'draft'
  });
  
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // NEW: limit gate
  const [isCheckingLimit, setIsCheckingLimit] = useState<boolean>(true);
  const [canCreate, setCanCreate] = useState<boolean>(false);

  const handleInputChange = <K extends keyof CreateBlogDto>(field: K, value: CreateBlogDto[K]) => {
    setFormData(prev => ({ ...prev, [field]: value } as CreateBlogDto));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Clear any previous errors
    setErrors(prev => ({ ...prev, featuredImage: '' }));

    // Store the file and create preview
    setFeaturedImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFeaturedImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast.success('Image selected. It will be uploaded when you publish the blog.');
  };

  const removeImage = () => {
    setFeaturedImageFile(null);
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

  // NEW: Helper function to upload and process featured image
  const uploadAndProcessFeaturedImage = async (blogId: string): Promise<void> => {
    if (!featuredImageFile) return;

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/presigned-upload`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'featured',
          fileName: featuredImageFile.name,
          blogId: blogId, // Now we have the actual blog ID
        })
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, s3Key } = await presignedResponse.json();

      // Step 2: Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: featuredImageFile,
        headers: {
          'Content-Type': featuredImageFile.type,
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3');
      }

      // Step 3: Start image processing (this creates placeholder and starts Lambda)
      const processResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/start-image-processing`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: blogId,
          type: 'featured',
          s3Key: s3Key,
        })
      });

      if (!processResponse.ok) {
        throw new Error('Failed to start image processing');
      }

      toast.success('Featured image uploaded and processing started!');
    } catch (error) {
      console.error('Image upload/processing error:', error);
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // NEW: Helper function to process content images from editor
  const processContentImages = async (blogId: string): Promise<void> => {
    if (!formData.content?.blocks) return;

    // Find all image blocks that might have uploaded images
    const imageBlocks = formData.content.blocks
      .filter(block => block.type === 'image' && block.data?.file?.url)
      .map((block, index) => ({
        blockId: `block_${index}`,
        s3Key: (block.data)?.file?.s3Key, // If the editor stores S3 keys
      }))
      .filter(img => img.s3Key); // Only process if we have S3 keys

    if (imageBlocks.length === 0) return;

    try {
      const processResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/process-content-images`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: blogId,
          images: imageBlocks,
        })
      });

      if (!processResponse.ok) {
        throw new Error('Failed to start content image processing');
      }

      const data = await processResponse.json();
      if (data.started) {
        toast.success(`Started processing ${imageBlocks.length} content images`);
      }
    } catch (error) {
      console.error('Content image processing error:', error);
      // Don't throw here - content image processing is not critical for blog creation
      toast.warning('Blog created but some content images may not be processed');
    }
  };

  useEffect(() => {
    const checkLimit = async () => {
      if (!user) {
        setIsCheckingLimit(false);
        setCanCreate(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/me/limit`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to fetch limit');
        const data: BlogLimitResponse = await res.json();
        const allowed = !!data?.data?.canCreate;
        setCanCreate(allowed);
        if (!allowed) {
          toast.error('You have reached your blog creation limit.');
          router.replace('/blogs');
        }
      } catch (e) {
        console.error('Limit check failed:', e);
        // Fail-safe: block creation if check fails
        toast.error('Unable to verify creation limit. Please try again later.');
        router.replace('/blogs');
      } finally {
        setIsCheckingLimit(false);
      }
    };
    void checkLimit();
  }, [user, router]);

  const handleSubmit = async (status: 'draft' | 'published') => {
    // Prevent submission if somehow canCreate toggled false later
    if (!canCreate) {
      toast.error('You have reached your blog creation limit.');
      return;
    }
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the blog with basic data (no images yet)
      const blogData = {
        title: formData.title,
        content: JSON.stringify(formData.content?.blocks ?? []),
        excerpt: formData.excerpt || '',
        category: formData.category || '',
        tags: formData.tags ?? [],
        status,
        // Optional fields
        subtitle: formData.subtitle || '',
        slug: formData.slug || '',
        channelId: formData.channelId || '',
        allowComments: formData.allowComments ?? true,
        allowHighlighting: formData.allowHighlighting ?? true,
        allowResponses: formData.allowResponses ?? true,
        isMonetized: formData.isMonetized ?? false,
        isPremium: formData.isPremium ?? false,
        topics: formData.topics || [],
        seoMetadata: formData.seoMetadata ? JSON.stringify(formData.seoMetadata) : undefined,
        customCSS: formData.customCSS || '',
        isSensitive: formData.isSensitive ?? false,
        contentWarning: formData.contentWarning || '',
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create blog');
      }

      const createdBlog = data.data;
      
      // Step 2: Process images if any (only after successful blog creation)
      if (featuredImageFile || (formData.content?.blocks && formData.content.blocks.length > 0)) {
        setIsProcessingImages(true);
        
        try {
          // Process featured image if selected
          if (featuredImageFile) {
            await uploadAndProcessFeaturedImage(createdBlog.id);
          }

          // Process content images from editor
          await processContentImages(createdBlog.id);
          
        } catch (imageError) {
          console.error('Image processing error:', imageError);
          // Don't fail the whole operation if image processing fails
          toast.warning('Blog created successfully, but some images may need to be re-uploaded');
        } finally {
          setIsProcessingImages(false);
        }
      }

      toast.success(`Blog ${status === 'published' ? 'published' : 'saved'} successfully!`);
      router.push(`/blogs/${createdBlog.slug}`);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create blog';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
      setIsProcessingImages(false);
    }
  };

  // Render Editor.js content to HTML for preview (sanitized)
  const escapeHtml = (str: string): string =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const sanitize = (html: string): string =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'a','abbr','b','blockquote','br','caption','code','div','em','figure','figcaption','h1','h2','h3','h4','h5','h6',
        'hr','i','img','li','mark','ol','p','pre','s','small','span','strong','sub','sup','table','tbody','td','th','thead','tr','u','ul','iframe'
      ],
      ALLOWED_ATTR: [
        'href','title','target','rel','src','alt','class','width','height','loading','referrerpolicy','frameborder','allow','allowfullscreen'
      ],
      ALLOW_DATA_ATTR: false,
      RETURN_TRUSTED_TYPE: false,
    });

  const safeHeadingLevel = (level: unknown): 1|2|3|4|5|6 => {
    const n = typeof level === 'number' ? level : parseInt(String(level), 10);
    if (n >= 1 && n <= 6) return n as 1|2|3|4|5|6;
    return 2;
  };

  const renderEditorContent = (content?: OutputData): string => {
    if (!content?.blocks || content.blocks.length === 0) {
      return '<p>Your blog content will appear here...</p>';
    }

    const htmlParts: string[] = [];

    for (const block of content.blocks) {
      const type = block.type;
      const data = block.data as unknown;

      if (type === 'paragraph') {
        const d = data as { text?: string };
        const text = d.text ?? '';
        // Paragraphs may include inline formatting; sanitize, not escape.
        htmlParts.push(`<p>${text}</p>`);
        continue;
      }

      if (type === 'header') {
        const d = data as { text?: string; level?: number };
        const level = safeHeadingLevel(d.level);
        const text = d.text ?? '';
        htmlParts.push(`<h${level}>${text}</h${level}>`);
        continue;
      }

      if (type === 'list') {
        const d = data as { style?: 'unordered'|'ordered'; items?: string[] };
        const items = Array.isArray(d.items) ? d.items : [];
        const isOrdered = d.style === 'ordered';
        const tag = isOrdered ? 'ol' : 'ul';
        const li = items.map(i => `<li>${i}</li>`).join('');
        htmlParts.push(`<${tag}>${li}</${tag}>`);
        continue;
      }

      if (type === 'checklist') {
        const d = data as { items?: Array<{ text?: string; checked?: boolean }> };
        const items = Array.isArray(d.items) ? d.items : [];
        const li = items
          .map(i => `<li><input type="checkbox" disabled ${i.checked ? 'checked' : ''}/> <span>${i.text ?? ''}</span></li>`) 
          .join('');
        htmlParts.push(`<ul class="cdx-checklist">${li}</ul>`);
        continue;
      }

      if (type === 'image' || type === 'simpleImage') {
        // Handle both Image tool and SimpleImage
        const d1 = data as { file?: { url?: string }; caption?: string; withBorder?: boolean; withBackground?: boolean; stretched?: boolean };
        const d2 = data as { url?: string; caption?: string };
        const url = d1.file?.url || d2.url || '';
        const caption = d1.caption ?? d2.caption ?? '';
        if (url) {
          htmlParts.push(`<figure><img src="${url}" alt="${escapeHtml(caption)}" loading="lazy"/><figcaption>${escapeHtml(caption)}</figcaption></figure>`);
        }
        continue;
      }

      if (type === 'code') {
        const d = data as { code?: string };
        const code = d.code ? escapeHtml(d.code) : '';
        htmlParts.push(`<pre><code>${code}</code></pre>`);
        continue;
      }

      if (type === 'table') {
        const d = data as { content?: string[][] };
        const rows = Array.isArray(d.content) ? d.content : [];
        const trs = rows
          .map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`)
          .join('');
        htmlParts.push(`<table><tbody>${trs}</tbody></table>`);
        continue;
      }

      if (type === 'delimiter') {
        htmlParts.push('<hr />');
        continue;
      }

      if (type === 'raw') {
        const d = data as { html?: string };
        htmlParts.push(d.html ?? '');
        continue;
      }

      if (type === 'embed') {
        const d = data as { service?: string; embed?: string; source?: string; width?: number; height?: number };
        // Only allow known safe providers for preview (e.g., YouTube)
        const isYouTube = (d.service === 'youtube') || (typeof d.source === 'string' && d.source.includes('youtube'));
        if (isYouTube && typeof d.embed === 'string') {
          htmlParts.push(d.embed);
        } else if (typeof d.source === 'string') {
          // Fallback to a link
          htmlParts.push(`<p><a href="${d.source}" target="_blank" rel="noopener noreferrer">${d.source}</a></p>`);
        }
        continue;
      }

      if (type === 'linkTool' || type === 'link') {
        const d = data as { link?: string; meta?: { title?: string; description?: string; image?: { url?: string } } };
        const href = d.link ?? '';
        const title = d.meta?.title ?? href;
        const description = d.meta?.description ?? '';
        const img = d.meta?.image?.url;
        const imageHtml = img ? `<img src="${img}" alt="${escapeHtml(title)}" loading="lazy"/>` : '';
        htmlParts.push(`
          <a class="link-card" href="${href}" target="_blank" rel="noopener noreferrer">
            <div class="link-card__content">
              <div class="link-card__text">
                <div class="link-card__title">${escapeHtml(title)}</div>
                <div class="link-card__desc">${escapeHtml(description)}</div>
                <div class="link-card__url">${escapeHtml(href)}</div>
              </div>
              ${imageHtml}
            </div>
          </a>
        `);
        continue;
      }

      // Unknown block: show nothing to avoid JSON noise in preview
    }

    const html = htmlParts.join('');
    return sanitize(html);
  };

  // Block rendering until limit is checked
  if (!user || isCheckingLimit || !canCreate) {
    return null;
  }

  const isLoading = isSubmitting || isProcessingImages;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
        
        <main className="flex-1 min-w-0">
          {/* Updated container: Responsive padding */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Updated header: Stack on mobile, responsive text */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Back</span>
                </button>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Blog
                </h1>
              </div>

              {/* Action buttons: Better visual distinction */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Preview/Edit Button */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  <FiEye className="w-4 h-4" />
                  <span>{showPreview ? 'Edit' : 'Preview'}</span>
                </button>
                
                {/* Save as Draft Button */}
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <FiBookmark className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
                
                {/* Publish Button */}
                <Button
                  onClick={() => handleSubmit('published')}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-sm px-4 py-2"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>
                        {isSubmitting ? 'Publishing...' : 'Processing...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-4 h-4" />
                      <span>Publish</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress indicator */}
            {isProcessingImages && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FiLoader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Processing images...
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Your blog has been created. Images are being processed in the background.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {!showPreview ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.title}</p>
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
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  {errors.excerpt && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.excerpt}</p>
                  )}
                </div>

                {/* Category and Featured Image Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
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
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50"
                      >
                        <FiUpload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        {featuredImageFile ? 'Change Image' : 'Select Image'}
                      </button>
                      {errors.featuredImage && (
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.featuredImage}</p>
                      )}
                      {featuredImageFile && (
                        <p className="text-xs text-green-600 dark:text-green-400 truncate">
                          Image selected: {featuredImageFile.name}
                        </p>
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
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Will be uploaded when you submit
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={removeImage}
                      disabled={isLoading}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
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
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  {(formData.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(formData.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 sm:ml-2 hover:text-blue-600 dark:hover:text-blue-400"
                            disabled={isLoading}
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {errors.tags && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
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
                    readOnly={isLoading}
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Preview */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Preview Badge */}
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 text-center">
                      📝 This is a preview of your blog. Click &quot;Edit&quot; to continue editing.
                    </p>
                  </div>

                  {/* Category */}
                  <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-4">
                    {formData.category}
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 break-words">
                    {formData.title || 'Your Blog Title'}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 break-words">
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
                    className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none break-words"
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
                            className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm"
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
        </main>
      </div>
    </div>
  );
}