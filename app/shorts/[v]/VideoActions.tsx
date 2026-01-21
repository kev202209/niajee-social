import { useState, useEffect, useMemo } from 'react';
import {
  MessageCircle,
  Share2,
  Bookmark,
  Plus,
} from 'lucide-react';
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext';
import LikeButton from "@/components/LikeButton";
import AuthRequiredModal from '@/components/modals/AuthRequiredModal';
import { toast } from "sonner";
import { formatCount } from '@/utils/formatUtils';
import ShareModal from '@/components/video/ShareModal';
import ShareService from '@/utils/ShareService';
import AuthenticatedImage from "@/components/Image";
import { getImageSrc } from '@/utils/imageUtils';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';
import { ShortData, getImageSrcSafe } from '@/types'


interface VideoActionsProps {
  video: ShortData;
  onToggleComments: () => void;
  onShowReport: () => void; // kept for compatibility, not used here anymore
}

const VideoActions = ({ 
  video,
  onToggleComments,
}: VideoActionsProps) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Destructure properties from the video object
  const { 
    id: videoId, 
    likeCount, 
    commentCount, 
    saveCount, 
    shareCount, 
    isLiked, 
    isSaved, 
    channel 
  } = video;
  const { id: channelId, isFollowed } = channel;

  const [showShareModal, setShowShareModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<'like' | 'comment' | 'save' | 'share'>('like');
  
  // State is now initialized directly from the video object's properties
  const [liked, setLiked] = useState(isLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [currentSaveCount, setCurrentSaveCount] = useState(saveCount);
  const [currentShareCount, setCurrentShareCount] = useState(shareCount);
  const [saved, setSaved] = useState(isSaved);
  const [following, setFollowing] = useState(isFollowed);
  
  const [loading, setLoading] = useState({
    like: false,
    save: false,
    follow: false,
    notInterested: false
  });

  // This effect now correctly syncs all state when the video object changes.
  useEffect(() => {
    setLiked(video.isLiked);
    setSaved(video.isSaved);
    setFollowing(video.channel.isFollowed);
    setCurrentLikeCount(video.likeCount);
    setCurrentSaveCount(video.saveCount);
    setCurrentShareCount(video.shareCount);
  }, [video]); // The only dependency needed is the video object itself.

  // Handle like toggle
  const handleLikeToggle = async (newLiked: boolean) => {
    if (!isAuthenticated) {
      setAuthModalAction('like');
      setAuthModalOpen(true);
      return;
    }

    setLoading(prev => ({ ...prev, like: true }));
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}/like`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle like');
      }

      const data = await response.json();
      
      setLiked(data.isLiked);
      setCurrentLikeCount(data.likeCount);
      
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
      setLiked(!newLiked);
    } finally {
      setLoading(prev => ({ ...prev, like: false }));
    }
  };

  // Handle follow toggle
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setAuthModalAction('like');
      setAuthModalOpen(true);
      return;
    }

    if (loading.follow) return;
    
    setLoading(prev => ({ ...prev, follow: true }));
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/follow`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle follow');
      }

      const data = await response.json();
      setFollowing(data.isFollowed);
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setLoading(prev => ({ ...prev, follow: false }));
    }
  };

  // Handle save toggle
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      setAuthModalAction('save');
      setAuthModalOpen(true);
      return;
    }

    if (loading.save) return;
    
    setLoading(prev => ({ ...prev, save: true }));
    const optimisticSave = !saved;
    setSaved(optimisticSave);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}/save`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle save');
      }

      const data = await response.json();
      setSaved(data.isSaved);
      
      // Update save count optimistically
      if (data.isSaved) {
        setCurrentSaveCount(prev => prev + 1);
      } else {
        setCurrentSaveCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success(data.isSaved ? 'Video saved' : 'Video removed from saved');
      
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
      setSaved(!optimisticSave);
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Handle not interested
  // const handleNotInterested = async () => {
  //   if (loading.notInterested) return;
    
  //   setLoading(prev => ({ ...prev, notInterested: true }));
  //   // setShowMenu(false);
    
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/shorts/${videoId}/not-interested`,
  //       {
  //         method: 'POST',
  //         credentials: 'include',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Accept': 'application/json',
  //         }
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to mark as not interested');
  //     }

  //     toast.success('We\'ll show you fewer videos like this');
      
  //   } catch (error) {
  //     console.error('Error marking as not interested:', error);
  //     toast.error(GENERIC_ERROR_MESSAGE);
  //   } finally {
  //     setLoading(prev => ({ ...prev, notInterested: false }));
  //   }
  // };

  // Handle share with proper native share timing
  const handleShare = async () => {
    if (!isAuthenticated) {
      setAuthModalAction('share');
      setAuthModalOpen(true);
      return;
    }

    const result = await ShareService.share(
      video.id,
      video.title,
      'short'
    );

    if (result.success) {
      // Native share succeeded
      if (result.shareCount) {
        setCurrentShareCount(result.shareCount);
      } else {
        setCurrentShareCount(prev => prev + 1);
      }
      toast.success('Shared successfully!');
    } else if (result.rateLimited) {
      // Rate limited
      toast.error(`You've shared this short too many times. Please wait ${result.timeLeft} before sharing again.`);
    } else if (result.userCancelled) {
      // User cancelled native share, do nothing
    } else if (result.showFallback) {
      // Show fallback modal
      setShowShareModal(true);
    }
  };

  const handleShareComplete = (newCount?: number) => {
    if (newCount !== undefined) {
      setCurrentShareCount(newCount);
    } else {
      setCurrentShareCount(prev => prev + 1);
    }
  };

  // unified sound id (supports soundId or sound_id)
  const effectiveSoundId = useMemo(() => {
    if (typeof video.soundId === 'string' && video.soundId) return video.soundId;
    const raw = video as unknown as Record<string, unknown>;
    return typeof raw['sound_id'] === 'string' ? (raw['sound_id'] as string) : null;
  }, [video]);

  // resolve image: sound cover -> channel avatar -> placeholder
  const soundImageSrc = useMemo(() => {
    const avatar = getImageSrcSafe(video.channel.avatar);
    return avatar || '/placeholder.png';
  }, [video.channel.avatar]);

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        {/* Channel Avatar with Follow Button */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <Link href={`/channels/${video.channel.handle}`}>
              <AuthenticatedImage
                mediaKey={getImageSrc(video.channel.avatar, '480w') || ""}
                alt={video.channel.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                fallbackSrc="/placeholder.png"
              />
            </Link>
            {/* Follow/Unfollow Button */}
            {!following && (
              <button
                onClick={handleFollowToggle}
                disabled={loading.follow}
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading.follow ? (
                  <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                ) : (
                  <Plus size={14} className="text-white" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Like Button with Animation */}
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-full transition-all hover:bg-black/20">
            <LikeButton 
              isLiked={liked}
              onLike={handleLikeToggle}
              size={26}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            />
          </div>
          <span className="text-xs mt-1 font-medium text-gray-900 dark:text-white">
            {formatCount(currentLikeCount)}
          </span>
        </div>

        {/* Comment Button with Count */}
        <div className="flex flex-col items-center">
          <button 
            onClick={() => {
              if (!isAuthenticated) {
                setAuthModalAction('comment');
                setAuthModalOpen(true);
              } else {
                onToggleComments();
              }
            }}
            className="p-3 rounded-full transition-all hover:bg-black/20"
          >
            <MessageCircle 
              size={26} 
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
            />
          </button>
          <span className="text-xs mt-1 font-medium text-gray-900 dark:text-white">
            {formatCount(commentCount)}
          </span>
        </div>

        {/* Save Button with Count */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleSaveToggle}
            disabled={loading.save}
            className="p-3 rounded-full backdrop-blur-sm transition-all hover:bg-black/20"
          >
            {loading.save ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <Bookmark
                size={26} 
                className={`transition-colors ${
                  saved 
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400'
                }`} 
              />
            )}
          </button>
          <span className="text-xs mt-1 font-medium text-gray-900 dark:text-white">
            {formatCount(currentSaveCount)}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleShare}
            className="p-3 rounded-full backdrop-blur-sm transition-all hover:bg-black/20"
          >
            <Share2 
              size={26} 
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
            />
          </button>
          <span className="text-xs mt-1 font-medium text-gray-900 dark:text-white">
            {formatCount(currentShareCount)}
          </span>
        </div>

        {/* Sound Action (bottom) */}
        {effectiveSoundId && (
          <div className="group mt-1 flex flex-col items-center">
            <Link
              href={`/shorts/sounds/${effectiveSoundId}`}
              className="relative"
              title={'Original audio'}
            >
              <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden relative bg-gray-800 flex items-center justify-center animate-spin [animation-duration:6s]">
                <AuthenticatedImage
                  mediaKey={getImageSrc(soundImageSrc, '480w') || ""}
                  alt={'Original audio'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  fallbackSrc="/placeholder.png"
                />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionType={authModalAction}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoTitle={video.title}
        videoId={video.id}
        onShareComplete={handleShareComplete}
        contentType="short"
      />
    </>
  );
};

export default VideoActions;