export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  job: string | null;
  website: string | null;
  img: string | null;
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
  id: string;
  videoSrc: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  likes: number;
  views: string;
  uploadDate: string;
  description: string;
}

export interface SuggestedVideo {
  id: string;
  videoSrc: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  likes: number;
  views: string;
  uploadDate: string;
  description: string;
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