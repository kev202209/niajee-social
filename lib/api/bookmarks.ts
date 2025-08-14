'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function handle(res: Response) {
  if (!res.ok) {
    let msg = 'Request failed';
    try { const j = await res.json(); msg = j.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// Videos
export async function fetchVideoBookmarks(page=1, limit=20) {
  const response = await fetch(`${API_BASE}/api/videos/me/bookmarks?page=${page}&limit=${limit}`, {
    credentials:'include', cache:'no-store'
  });
  return handle(response);
}
export async function toggleVideoBookmark(id: string) {
  const response = await fetch(`${API_BASE}/api/videos/${id}/bookmark`, {
    method:'POST', credentials:'include'
  });
  return handle(response);
}

// Shorts
export async function fetchShortBookmarks(page=1, limit=20) {
  const response = await fetch(`${API_BASE}/api/shorts/me/bookmarks?page=${page}&limit=${limit}`, {
    credentials:'include', cache:'no-store'
  });
  return handle(response);
}
export async function toggleShortBookmark(id: string) {
  const response = await fetch(`${API_BASE}/api/shorts/${id}/bookmark`, {
    method:'POST', credentials:'include'
  });
  return handle(response);
}

// Blogs
// Backend returns { success, message, data: { bookmarks, pagination } }
export async function fetchBlogBookmarks(page=1, limit=20, collection?: string) {
  const url = new URL(`${API_BASE}/api/blogs/my/bookmarks`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  if (collection) url.searchParams.set('collection', collection);
  const response = await fetch(url.toString(), { credentials:'include', cache:'no-store' });
  const json = await handle(response);
  return json.data || { bookmarks: [], pagination:{ page:1,totalPages:0 } };
}
export async function toggleBlogBookmark(id: string, collectionName='default') {
  const response = await fetch(`${API_BASE}/api/blogs/${id}/bookmark`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body: JSON.stringify({ collectionName })
  });
  return handle(response);
}