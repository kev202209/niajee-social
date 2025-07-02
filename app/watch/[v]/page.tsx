'use client';

import { useEffect, useState } from "react";
import VideoPlayer from "@/components/video/VideoPlayer";
import Header from "@/components/watch/Header";
import SuggestedVideos from "./SuggestedVideos";
import CommentsSection from "./CommentSection";
import Sidebar from "@/components/watch/Sidebar";
import { mVideo as Video, SuggestedVideo } from "../../../types";

function getVideoStreamUrl(videoId: string, quality: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/stream/${videoId}/${quality}`;
}
function getHLSStreamUrl(videoId: string, quality: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}/stream/${videoId}/${quality}/playlist.m3u8`;
}

export default function WatchPage({ params }: { params: { v: string } }) {
  const videoId = params.v;
  const [video, setVideo] = useState<Video | null>(null);
  const [suggestedVideos, setSuggestedVideos] = useState<SuggestedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch video data
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`, {
          cache: "no-store",
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (!data.video) throw new Error('Video data not found in response');
        const processedVideo = {
          ...data.video,
          videoUrl: data.video.videoUrl || getHLSStreamUrl(videoId, 'auto'),
          streamUrls: {
            '720p': getVideoStreamUrl(videoId, '720p'),
            '480p': getVideoStreamUrl(videoId, '480p'),
            '360p': getVideoStreamUrl(videoId, '360p'),
            '240p': getVideoStreamUrl(videoId, '240p'),
            auto: getHLSStreamUrl(videoId, 'auto')
          }
        };
        if (isMounted) setVideo(processedVideo);

        // Fetch suggested videos
        const suggRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/suggested?v=${videoId}`, {
          cache: "no-store",
          credentials: 'include'
        });
        if (!suggRes.ok) throw new Error("Failed to fetch suggested videos");
        const suggData = await suggRes.json();
        if (isMounted) setSuggestedVideos(suggData.videos || []);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading video');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [videoId]);

  if (loading) return <div>Loading…</div>;
  if (error || !video) return <div className="text-red-500">{error || "Video not found"}</div>;

  return (
    <>
      <Header />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 ml-10">
            <div className="md:w-2/3 space-y-4">
              <VideoPlayer video={video} />
              <CommentsSection videoId={videoId} allowComments={video.allowComments} />
            </div>
            <div className="md:w-1/3">
              <SuggestedVideos suggestedVideos={suggestedVideos} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}