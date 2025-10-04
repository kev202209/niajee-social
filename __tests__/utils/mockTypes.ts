// __tests__/utils/mockTypes.ts
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profilePic: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockDeviceInfo {
  userAgent: string;
  platform: string;
  timestamp: string;
}

export interface MockApiResponse<T = any> {
  message?: string;
  data?: T;
  csrfToken?: string;
  user?: MockUser;
}

export interface MockFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
}