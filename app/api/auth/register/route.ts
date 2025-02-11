// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const registrationData = await request.json();

    // Forward the registration data to your backend server.
    // Adjust the URL to match your backend's registration endpoint.
    const backendRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    const backendData = await backendRes.json();

    return NextResponse.json(backendData, { status: backendRes.status });
  } catch (error) {
    console.error('Error in registration API route:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
