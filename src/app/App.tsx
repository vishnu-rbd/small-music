function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>test-music</h1>
      <p>A web app that plays your Spotify music in the browser and shows stats about your listening.</p>
      <p>
        <strong>Status:</strong> Project initialized with Vite + React + TypeScript
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#333', borderRadius: '8px', maxWidth: '600px', margin: '2rem auto' }}>
        <h3>Project Structure Created:</h3>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>app/ - App shell, router, providers, layout</li>
          <li>auth/ - PKCE helpers, token storage, refresh</li>
          <li>api/ - Typed Spotify client</li>
          <li>player/ - Web Playback SDK wrapper</li>
          <li>features/ - Feature pages (home, library, search, stats, etc.)</li>
          <li>history/ - Listening history storage</li>
          <li>components/ - Shared UI components</li>
          <li>lib/ - Utilities and formatting</li>
          <li>types/ - TypeScript definitions</li>
        </ul>
      </div>
      <p>Check the <code>docs/</code> directory for architecture and setup details.</p>
    </div>
  )
}

export default App