export const getFullUrl = (keyOrUrl?: string) => {
  if (!keyOrUrl || typeof keyOrUrl !== 'string') return "";
  if (keyOrUrl.startsWith("http")) return keyOrUrl;
  return `${process.env.NEXT_PUBLIC_API_URL}/media/raw/${keyOrUrl.replace(/^\/+/, "")}`;
};