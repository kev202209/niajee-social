import React, { useState, useEffect } from "react";
import "./components_css/LikeButton.css";

interface LikeButtonProps {
  isLiked?: boolean;
  onLike?: (liked: boolean) => void;
  size?: number;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  isLiked = false, 
  onLike,
  size = 26,
  className = ""
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const handleClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    
    if (newLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    
    onLike?.(newLiked);
  };

  return (
    <button
      className={`like-btn ${liked ? 'liked' : ''} ${isAnimating ? 'animating' : ''} ${className}`}
      onClick={handleClick}
      style={{
        '--size': `${size}px`,
        '--half-size': `${size / 2}px`
      } as React.CSSProperties}
    >
      <div className="heart-container">
        {/* Heart SVG */}
        <svg 
          className="heart-icon" 
          viewBox="0 0 24 24" 
          width={size} 
          height={size}
        >
          <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z"/>
        </svg>
        
        {/* Animated particles */}
        <div className="particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--delay': `${i * 0.1}s`,
                '--angle': `${(360 / 6) * i}deg`,
                '--color': `hsl(${(i * 60) + 300}, 70%, 60%)`
              } as React.CSSProperties}
            />
          ))}
        </div>
        
        {/* Ripple effect */}
        <div className="ripple"></div>
      </div>
    </button>
  );
};

export default LikeButton;