// app/auth/login/page.tsx
export default function LoginPage() {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <form>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              placeholder="********"
            />
          </div>
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            Login
          </button>
        </form>
      </div>
    )
  }
  