export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Fleet Registration & Compliance System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Manage vehicles and vessels registration, compliance, and payments
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </a>
          <a
            href="/dashboard"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
