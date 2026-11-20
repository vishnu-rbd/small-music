function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-4">test‑music</h1>
        <p className="text-xl text-gray-300">
          A web app that plays your Spotify music in the browser and shows stats about your listening.
        </p>
      </header>

      <main className="max-w-4xl">
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Getting started</h2>
          <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
            <p>
              This is the foundation of the Spotify music player and stats app. The project is built with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vite – fast dev server and build tool</li>
              <li>React 19 – UI library</li>
              <li>TypeScript – type safety</li>
              <li>Tailwind CSS – styling (to be added)</li>
              <li>React Router – client‑side routing (to be added)</li>
              <li>TanStack Query – data fetching (to be added)</li>
              <li>Zustand – state management (to be added)</li>
            </ul>
            <p className="pt-4">
              Check the <code className="bg-gray-900 px-2 py-1 rounded">docs/</code> folder for architecture,
              product specs, and Spotify API notes.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Next steps</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Setup Spotify App</h3>
              <p className="text-gray-300 mb-4">
                You'll need a Spotify Developer account to get a Client ID for authentication.
              </p>
              <a
                href="https://developer.spotify.com/dashboard/create"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Create Spotify App
              </a>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Explore the code</h3>
              <p className="text-gray-300 mb-4">
                The folder structure follows the architecture described in{' '}
                <code className="bg-gray-900 px-2 py-1 rounded">docs/ARCHITECTURE.md</code>.
              </p>
              <div className="text-sm font-mono bg-gray-900 p-3 rounded">
                src/
                <div className="ml-4">
                  app/ – App shell, router<br/>
                  auth/ – PKCE helpers<br/>
                  api/ – Spotify client<br/>
                  features/ – Pages<br/>
                  components/ – Shared UI
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6">Development</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="mb-4">Run the development server:</p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>npm run dev</code>
            </pre>
            <p className="mt-4 text-sm text-gray-400">
              The server should be running on <a href="http://localhost:3000" className="text-blue-400 hover:text-blue-300">http://localhost:3000</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-16 pt-8 border-t border-gray-800 text-gray-500 text-sm">
        <p>
          test‑music · No backend · All data stays in your browser ·
          <a
            href="https://github.com/yourusername/test-music"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App