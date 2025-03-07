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
    title: string;
    views: string;
  }
  
export interface Tweet {
    id: number;
    profilePic: string;
    username: string;
    handle: string;
    content: string;
  }