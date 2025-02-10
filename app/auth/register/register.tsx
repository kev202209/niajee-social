// app/auth/register/page.tsx
export default function RegisterPage() {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold mb-4">Register</h1>
        <form>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Username"
            />
          </div>
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
          <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
            Register
          </button>
        </form>
      </div>
    )
  }
  