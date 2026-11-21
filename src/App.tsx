import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            test-music
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Your Spotify stats, visualized
          </p>
          <div className="mt-12 p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
            <p className="text-gray-400">
              A web app that plays your Spotify music in the browser and shows stats about your listening.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App