export default function LibraryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Library</h1>
        <p className="text-text-secondary">Manage and explore your saved music</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Playlists', 'Albums', 'Artists', 'Liked Songs', 'Podcasts', 'Downloads'].map((category) => (
          <div key={category} className="card cursor-pointer hover:bg-background-elevated transition-colors">
            <div className="h-40 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-4xl">🎵</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{category}</h3>
            <p className="text-text-secondary text-sm">Browse your {category.toLowerCase()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}