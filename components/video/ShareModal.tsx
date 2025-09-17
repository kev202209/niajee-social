'use client';
import React, { useState } from 'react';
import { 
  X,
  Copy,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  Check,
  ExternalLink
} from 'lucide-react';
import { toast } from "sonner";
import ShareService from '@/utils/ShareService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  videoId: string;
  videoUrl?: string;
  onShareComplete?: (newCount?: number) => void;
  contentType?: 'video' | 'short';
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  videoTitle,
  videoId,
  videoUrl,
  onShareComplete,
  contentType = 'video'
}) => {
  // Hooks must be called on every render — declare them unconditionally
  const [copied, setCopied] = useState(false);
  const [sharedPlatforms, setSharedPlatforms] = useState<Set<string>>(new Set());

  // Early return after hooks to avoid rendering when closed
  if (!isOpen) return null;

  const currentUrl = videoUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      
      // Only update share count if this is the first copy action
      if (!copied) {
        const shareCount = await ShareService.recordManualShare(videoId, contentType);
        if (shareCount !== null) {
          onShareComplete?.(shareCount);
          toast.success('Link copied and shared!');
        } else {
          // Rate limited
          const { timeLeft } = ShareService.checkRateLimit(videoId);
          toast.error(`Rate limited. Try again in ${timeLeft || 'a few minutes'}.`);
        }
      } else {
        toast.success('Link copied to clipboard!');
      }
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  // Handle platform sharing
  const handlePlatformShare = async (platform: string) => {
    const url = encodeURIComponent(currentUrl);
    const text = encodeURIComponent(`Check out this ${contentType}: ${videoTitle}`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${text}&body=Check out this ${contentType}: ${currentUrl}`;
        break;
      default:
        return;
    }
    
    try {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      }
      
      // Only update share count if this platform hasn't been used yet
      if (!sharedPlatforms.has(platform)) {
        const shareCount = await ShareService.recordManualShare(videoId, contentType);
        if (shareCount !== null) {
          setSharedPlatforms(prev => new Set(prev).add(platform));
          onShareComplete?.(shareCount);
          toast.success(`Shared to ${platform === 'x' ? 'X' : platform}!`);
        } else {
          // Rate limited
          const { timeLeft } = ShareService.checkRateLimit(videoId);
          toast.error(`Rate limited. Try again in ${timeLeft || 'a few minutes'}.`);
        }
      } else {
        toast.success(`Opened ${platform === 'x' ? 'X' : platform} share`);
      }
      
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      toast.error(`Failed to share to ${platform}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Share this {contentType}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Title Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
              {videoTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {currentUrl}
            </p>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Copy Link
            </h3>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                readOnly 
                value={currentUrl}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <button 
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 min-w-[80px] justify-center ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share to social media
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => handlePlatformShare('facebook')}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-900 dark:text-white">Facebook</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Share to your Facebook feed</p>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>
              
              <button 
                onClick={() => handlePlatformShare('x')}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <Twitter size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-900 dark:text-white">X (Twitter)</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Post to your X timeline</p>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>
              
              <button 
                onClick={() => handlePlatformShare('whatsapp')}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-900 dark:text-white">WhatsApp</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Send to WhatsApp contacts</p>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>
              
              <button 
                onClick={() => handlePlatformShare('email')}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all group"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Mail size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-900 dark:text-white">Email</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Send via email client</p>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Bottom note */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            Share count updates when you successfully share or copy the link
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;