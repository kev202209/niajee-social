'use client';

export async function fetchVideoHistory(page = 1, limit = 20) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/history?page=${page}&limit=${limit}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to fetch video history');
  return res.json();
}

export async function fetchShortHistory(page = 1, limit = 40) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shorts/history?page=${page}&limit=${limit}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to fetch short history');
  return res.json();
}