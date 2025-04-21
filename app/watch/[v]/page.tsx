// This is a Server Component by default in Next.js 15 App Router
import { Suspense } from "react";
import VideoPlayer from "@/components/video/VideoPlayer";
import Header from "@/components/watch/Header";
import SuggestedVideos from "./SuggestedVideos";
import CommentsSection from "./CommentSection";
import Sidebar from "@/components/watch/Sidebar";

import { mVideo as Video, SuggestedVideo, Comment } from "../../../types";

interface PageProps {
  params: Promise<{
    v: string
  }> | {
    v: string
  };
  searchParams: Promise<{
    channelName?: string;
    channelAvatar?: string;
  }> | {
    channelName?: string;
    channelAvatar?: string;
  };
}

// Server-side data fetching
async function fetchVideoData(videoId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`, {
      cache: "no-store",
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    if (!data.video) {
      throw new Error('Video data not found in response');
    }
    return data.video as Video;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
}

async function fetchSuggestedVideos(videoId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suggested?v=${videoId}`, {
    cache: "no-store",
    credentials: 'include', // Add this to include cookies
  });
  if (!res.ok) throw new Error("Failed to fetch suggested videos");
  const data = await res.json();
  return data.videos as SuggestedVideo[];
}

async function fetchComments(videoId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments?v=${videoId}`, {
    cache: "no-store",
    credentials: 'include', // Add this to include cookies
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  const data = await res.json();
  return data.comments as Comment[];
}

// Add new function to handle video streaming URL generation
function getVideoStreamUrl(videoId: string, quality: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/stream/${videoId}/${quality}`;
}

// For HLS streams
function getHLSStreamUrl(videoId: string, quality: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/stream/${videoId}/${quality}/playlist.m3u8`;
}

// Update the component to handle async params
export default async function WatchPage({ params }: { params: { v: string } }) {
  try {
    // Fetch data server-side
    const [video, suggestedVideos, comments] = await Promise.all([
      fetchVideoData(params.v),
      fetchSuggestedVideos(params.v),
      fetchComments(params.v),
    ]);

    return (
      <>
        <Header />
        <Sidebar isOpen={false} onClose={() => {}} />
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16">
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-4 ml-10">
              <div className="md:w-2/3 space-y-4">
                <Suspense fallback={<div>Loading video…</div>}>
                  <VideoPlayer video={video} />
                </Suspense>
                <Suspense fallback={<div>Loading comments…</div>}>
                  <CommentsSection comments={comments} />
                </Suspense>
              </div>
              <div className="md:w-1/3">
                <Suspense fallback={<div>Loading suggestions…</div>}>
                  <SuggestedVideos suggestedVideos={suggestedVideos} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error(error);
    throw new Error('Failed to load video data');
  }
}