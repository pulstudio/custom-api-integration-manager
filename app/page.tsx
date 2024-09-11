import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800">
            Custom API Integration Manager
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Simplifying API Integrations for Everyone. Connect your tools effortlessly, no coding required.
          </p>
          <div className="space-x-4">
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 inline-block"
            >
              Get Started
            </Link>
            <Link 
              href="/auth/login" 
              className="bg-white text-blue-600 py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300 inline-block border border-blue-600"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Easy Integration</h2>
            <p className="text-gray-600">Connect your favorite tools with just a few clicks. No coding knowledge required.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Real-time Sync</h2>
            <p className="text-gray-600">Keep your data up-to-date across all your platforms with real-time synchronization.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Customizable Workflows</h2>
            <p className="text-gray-600">Create custom workflows tailored to your specific business needs.</p>
          </div>
        </div>
      </main>
    </div>
  );
}