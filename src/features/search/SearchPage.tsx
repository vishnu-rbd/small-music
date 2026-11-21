import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-text-secondary">Find music, artists, playlists, and podcasts</p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search for artists, songs, albums, or playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 py-3 text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Top Results', 'Songs', 'Artists', 'Albums', 'Playlists', 'Podcasts & Shows'].map((category) => (
          <div key={category} className="card">
            <h3 className="font-semibold text-lg mb-4">{category}</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-background-elevated transition-colors">
                  <div className="h-12 w-12 bg-gradient-to-br from-accent/20 to-accent/5 rounded flex items-center justify-center">
                    <span className="text-lg">🎵</span>
                  </div>
                  <div>
                    <div className="font-medium">Sample {category.slice(0, -1)} {i}</div>
                    <div className="text-sm text-text-secondary">Placeholder details</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}