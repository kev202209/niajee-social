import { FC, useCallback, useRef, useState } from "react";
import VideoCard from "./VideoCard";
import ShortsRow from "./ShortsRow";
import { Short, Video } from "../../types";

const MainContent: FC = () => {
  const [videos, setVideos] = useState<Video[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      videoSrc: "/sample-video.mp4",
      title: `Long Video ${i + 1}`,
      channelAvatar: "/channel-avatar.jpg",
      channelName: `Channel ${i + 1}`,
      views: `${(i + 1) * 1000}`,
      age: "1 day ago",
    }))
  );

  const [shorts, setShorts] = useState<Short[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      title: `Short ${i + 1}`,
      views: `${(i + 1) * 100} views`,
    }))
  );

  // Infinite scroll: observer on the last segment block
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSegmentRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Append new long videos and shorts
        setVideos((prev) => [
          ...prev,
          ...Array.from({ length: 8 }, (_, i) => ({
            id: prev.length + i,
            videoSrc: "/sample-video.mp4",
            title: `Long Video ${prev.length + i + 1}`,
            channelAvatar: "/channel-avatar.jpg",
            channelName: `Channel ${prev.length + i + 1}`,
            views: `${(prev.length + i + 1) * 1000}`,
            age: "2 days ago",
          })),
        ]);
        setShorts((prev) => [
          ...prev,
          ...Array.from({ length: 4 }, (_, i) => ({
            id: prev.length + i,
            title: `Short ${prev.length + i + 1}`,
            views: `${(prev.length + i + 1) * 100} views`,
          })),
        ]);
      }
    });
    if (node) observer.current.observe(node);
  }, []);

  // Group long videos into chunks of 8 (2 rows of 4)
  const videoChunks: Video[][] = [];
  for (let i = 0; i < videos.length; i += 8) {
    videoChunks.push(videos.slice(i, i + 8));
  }

  return (
    <div className="pt-16 pb-8 px-4 flex flex-col gap-8">
      {videoChunks.map((chunk, index) => (
        <div key={index}>
          {/* Responsive Grid: 2 columns on extra-small, 4 on small+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {chunk.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          {/* Shorts Row */}
          <ShortsRow shorts={shorts} />
          {/* Attach observer to the last block */}
          {index === videoChunks.length - 1 && (
            <div ref={lastSegmentRef} className="h-1" />
          )}
        </div>
      ))}
    </div>
  );
};



export default MainContent;