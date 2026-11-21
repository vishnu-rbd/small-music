import './App.css'

function App() {
  // Placeholder - will update with actual color once chosen
  const accentColor = '#1DB954' // Default Spotify green
  
  return (
    <div className="app">
      <h1 style={{ color: accentColor }}>test-music</h1>
      <p className="tagline" style={{ color: accentColor }}>
        Your music testing platform
      </p>
    </div>
  )
}

export default App