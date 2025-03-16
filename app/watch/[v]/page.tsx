// This is a Server Component by default in Next.js 15 App Router
import { Suspense } from "react";
import VideoPlayer from "./VideoPlayer";
import Header from "@/components/watch/Header";
import SuggestedVideos from "./SuggestedVideos";
import CommentsSection from "./CommentSection";
import Sidebar from "@/components/watch/Sidebar";

import { mVideo as Video, SuggestedVideo, Comment } from "../../../types";
// Server-side data fetching
async function fetchVideoData(videoId: string) {
    console.log('this is the res', `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`, {
    cache: "no-store", // Adjust caching as needed
  });
  
  if (!res.ok) throw new Error("Failed to fetch video");
  const data = await res.json();
  return data.video as Video;
}

async function fetchSuggestedVideos(videoId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suggested?v=${videoId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch suggested videos");
  const data = await res.json();
  return data.videos as SuggestedVideo[];
}

async function fetchComments(videoId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments?v=${videoId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  const data = await res.json();
  return data.comments as Comment[];
}

export default async function WatchPage({ params }: { params: { v: string } }) {
  const videoId = params.v;

  // Fetch data server-side
  const videoPromise = fetchVideoData(videoId);
  const suggestedVideosPromise = fetchSuggestedVideos(videoId);
  const commentsPromise = fetchComments(videoId);

  const [video, suggestedVideos, comments] = await Promise.all([
    videoPromise,
    suggestedVideosPromise,
    commentsPromise,
  ]);

  return (
    <>
    <Header/>
    <Sidebar isOpen={false} onClose={() => {}} />
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4 ml-10">
          {/* Left: Video Player & Details */}
          <div className="md:w-2/3 space-y-4">
            <Suspense fallback={<div>Loading video…</div>}>
              <VideoPlayer video={video} />
            </Suspense>
            <Suspense fallback={<div>Loading comments…</div>}>
              <CommentsSection comments={comments} />
            </Suspense>
          </div>
          {/* Right: Suggested Videos */}
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
}