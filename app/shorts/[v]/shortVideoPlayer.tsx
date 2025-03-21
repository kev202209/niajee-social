import { FC } from 'react';
import { FaVolumeMute, FaVolumeDown, FaVolumeUp, FaPause, FaPlay } from 'react-icons/fa';

interface Channel {
  name: string;
  icon: string | null;
}

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement> | null;
  videoSrc: string;
  isMuted: boolean;
  isPaused: boolean;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
  channel: Channel;
  caption: string;
  song: string;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  videoRef,
  videoSrc,
  isMuted,
  isPaused,
  volume,
  onVolumeChange,
  toggleMute,
  togglePlayPause,
  channel,
  caption,
  song,
}) => {
  // Determine which volume icon to display based on volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <FaVolumeMute className="text-white text-xl" />;
    } else if (volume > 0 && volume < 0.33) {
      return <FaVolumeDown className="text-white text-xl" />;
    } else if (volume >= 0.33 && volume < 0.66) {
      // Using FaVolumeDown for mid volume as a placeholder for a distinct mid-volume icon.
      return <FaVolumeDown className="text-white text-xl" />;
    } else {
      return <FaVolumeUp className="text-white text-xl" />;
    }
  };

  return (
    <div
      className="relative rounded-md overflow-hidden bg-black"
      style={{
        height: '80vh',
        width: `calc(80vh * 9 / 16)`,
      }}
    >
      <video
        ref={videoRef || undefined}
        src={videoSrc}
        muted={isMuted}
        loop
        playsInline
        autoPlay
        onLoadedData={() => {
          if (videoRef && videoRef.current) {
            videoRef.current.volume = 0.5;
            // Keep muted for autoplay policy; unmute on user interaction.
            videoRef.current.play().catch((err) => console.error("Autoplay failed:", err));
          }
        }}
        className="w-full h-full object-cover"
      />
      {/* Central click region */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          onClick={togglePlayPause}
          className="w-1/2 h-1/2 cursor-pointer"
        ></div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-between z-20 pointer-events-none">
        {/* Top controls */}
        <div className="flex justify-between p-2 pointer-events-auto">
          {/* Play/Pause Button using isPaused */}
          <button
            onClick={togglePlayPause}
            className="bg-black bg-opacity-70 p-2 rounded-full transition-transform duration-300"
          >
            {isPaused ? (
              <FaPlay className="text-white text-xl" />
            ) : (
              <FaPause className="text-white text-xl" />
            )}
          </button>
          {/* Volume control container */}
          <div className="relative group">
            <div className="flex items-center bg-black bg-opacity-70 rounded-full overflow-hidden transition-all duration-300 w-12 group-hover:w-48">
              {/* Volume slider appears on hover */}
              <button onClick={toggleMute} className="p-2">
                {getVolumeIcon()}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={onVolumeChange}
                className="w-32 hidden group-hover:block"
              />

            </div>
          </div>
        </div>
        {/* Bottom overlay: Channel info, caption and song */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-transparent pointer-events-auto">
          <div className="flex items-center">
            <img
              src={channel.icon || "/placeholder.png"}
              alt={channel.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="ml-2 text-white text-sm font-semibold">
              {channel.name}
            </span>
            <button className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-xs">
              Subscribe
            </button>
          </div>
          <div className="mt-2 text-white text-xs">
            <p>{caption}</p>
            <p className="text-xs">{song}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
