'use client';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-gray-600">Can you reload the page?</p>
      </div>
    </div>
  );
}