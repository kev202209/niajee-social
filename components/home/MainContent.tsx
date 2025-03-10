import { FC, useCallback, useEffect, useRef, useState } from "react";
import VideoCard from "./VideoCard";
import ShortsRow from "./ShortsRow";
import { Short, Video } from "../../types";

const MainContent: FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to fetch data from the backend
  const fetchContent = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/content?page=${pageNumber}`);
      if (response.ok) {
        const data = await response.json();
        // Append new data to existing state
        setVideos((prev) => [...prev, ...data.videos]);
        setShorts((prev) => [...prev, ...data.shorts]);
      } else {
        console.error("Failed to fetch content");
      }
    } catch (error) {
      console.error("Error fetching content", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial content and additional pages as the "page" state updates
  useEffect(() => {
    fetchContent(page);
  }, [page]);

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastSegmentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          // Increase page number to load next batch
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  // Group videos into chunks of 8 for display purposes
  const videoChunks: Video[][] = [];
  for (let i = 0; i < videos.length; i += 8) {
    videoChunks.push(videos.slice(i, i + 8));
  }

  return (
    <div className="pt-16 pb-8 px-4 flex flex-col gap-8">
      {videoChunks.map((chunk, index) => (
        <div key={index}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {chunk.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <ShortsRow shorts={shorts} />
          {index === videoChunks.length - 1 && (
            <div ref={lastSegmentRef} className="h-1" />
          )}
        </div>
      ))}
    </div>
  );
};

export default MainContent;
