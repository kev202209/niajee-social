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
