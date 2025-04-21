import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const res = await fetch(`${process.env.BACKEND_URL}/stream/${videoId}/auto`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch video');
    }

    const videoData = await res.json();
    return NextResponse.json({ video: videoData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}