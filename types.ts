export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  job: string | null;
  website: string | null;
  profileImg: string | null;
  cover: string | null;
  createdAt: Date;
  updatedAt: Date;
  posts: Post[];
  likes: Like[];
  saves: SavedPosts[];
  followers: Follow[];
  followings: Follow[];
}

export interface Video {
    id: number;
    videoSrc: string;
    videoId: string;
    title: string;
    channelAvatar: string;
    channelName: string;
    views: string;
    age: string;
  }
  
export interface Short {
  id: number;
  videoSrc: string;
  title: string;
  channelAvatar: string;
  channelName: string;
  views: string;
  age: string;
  }
  
export interface Tweet {
    id: number;
    profilePic: string;
    username: string;
    handle: string;
    content: string;
  }


// Types (same as before, but centralized here)
export interface mVideo {
  _id: string;
  videoId: string;
  title: string;
  description: string;
  tags: string;
  visibility: 'public' | 'private' | 'unlisted';
  videoUrl: {
    '240p': string;
    '360p': string;
    '480p': string;
    '720p': string;
    '1080p': string;
    [key: string]: string; // For any other quality levels
  };
  thumbnailUrl: string;
  duration: number;
  format: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields needed for VideoMeta component
  channelName: string;
  channelAvatar: string;
  likes: number;
  dislikes?: number;
  views: string;
  uploadDate: string;
  shares?: number;
  comments?: number;
  saved?: boolean;
}

// Update SuggestedVideo to extend from mVideo
export interface SuggestedVideo extends Omit<mVideo, 'videoUrl'> {
  videoSrc: string;
  channelName: string;
  channelAvatar: string;
  likes: number;
  views: string;
  uploadDate: string;
  duration: number;
  thumbnailUrl: string;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  age: string;
  text: string;
  likes: number;
}


export interface Post {
  id: string ;
  desc: string;
  img?: string;
  imgHeight?: number;
  video?: string;
  isSensitive?: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    img?: string;
  };
  _count?: {
    likes: number;
    rePosts: number;
    comments: number;
  };
  likes?: { id: number }[];
  rePosts?: { id: number }[];
  saves?: { id: number }[];
  rePost?: Post | null;
  rePostId?: string | null;
}

export interface Like {
  id: number;
  createdAt: Date;
  userId: string;
  postId: number;
  user: User;
  post: Post;
}

export interface SavedPosts {
  id: number;
  createdAt: Date;
  userId: string;
  postId: number;
  user: User;
  post: Post;
}

export interface Follow {
  id: number;
  createdAt: Date;
  followerId: string;
  followingId: string;
  follower: User;
  following: User;
}



export interface Channel {
  _id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  videoCount: number;
  isSubscribed?: boolean;
  hasJoined?: boolean;
  createdAt: string;
  updatedAt: string;
}
