export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to test-music</h1>
        <p className="text-xl text-text-secondary mb-8">
          A Spotify client that plays music directly in your browser and shows detailed stats about your listening.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn btn-primary px-8 py-3 text-lg">
            Get Started
          </button>
          <button className="btn btn-secondary px-8 py-3 text-lg">
            Learn More
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="card">
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
            <span className="text-2xl">🎵</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">In-Browser Playback</h3>
          <p className="text-text-secondary">
            Play Spotify music directly in your browser tab using the Web Playback SDK.
          </p>
        </div>

        <div className="card">
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Detailed Statistics</h3>
          <p className="text-text-secondary">
            Track your listening habits with charts and insights beyond what Spotify provides.
          </p>
        </div>

        <div className="card">
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Privacy Focused</h3>
          <p className="text-text-secondary">
            Your listening history stays in your browser. No servers, no tracking.
          </p>
        </div>
      </div>
    </div>
  )
}