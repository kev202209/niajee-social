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
export async function fetchVideoSaved(page=1, limit=20) {
  const response = await fetch(`${API_BASE}/api/videos/me/saved?page=${page}&limit=${limit}`, {
    credentials:'include', cache:'no-store'
  });
  return handle(response);
}
export async function toggleVideoSave(id: string) {
  const response = await fetch(`${API_BASE}/api/videos/${id}/save`, {
    method:'POST', credentials:'include'
  });
  return handle(response);
}

// Shorts
export async function fetchShortSaved(page=1, limit=20) {
  const response = await fetch(`${API_BASE}/api/shorts/me/saved?page=${page}&limit=${limit}`, {
    credentials:'include', cache:'no-store'
  });
  return handle(response);
}
export async function toggleShortSave(id: string) {
  const response = await fetch(`${API_BASE}/api/shorts/${id}/save`, {
    method:'POST', credentials:'include'
  });
  return handle(response);
}

// Blogs
// Backend returns { success, message, data: { saves, pagination } }
export async function fetchBlogSaved(page=1, limit=20, collection?: string) {
  const url = new URL(`${API_BASE}/api/blogs/me/saved`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  if (collection) url.searchParams.set('collection', collection);
  const response = await fetch(url.toString(), { credentials:'include', cache:'no-store' });
  const json = await handle(response);
  return json.data || { saves: [], pagination:{ page:1,totalPages:0 } };
}
export async function toggleBlogSave(id: string, collectionName='default') {
  const response = await fetch(`${API_BASE}/api/blogs/${id}/save`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body: JSON.stringify({ collectionName })
  });
  return handle(response);
}