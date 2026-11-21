import { useParams } from 'react-router-dom'
import { Music, Users, Calendar, Globe } from 'lucide-react'

export default function ArtistPage() {
  const { id } = useParams()

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <div className="h-64 w-64 mx-auto md:mx-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <span className="text-6xl">👨‍🎤</span>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <div className="mb-6">
            <div className="text-sm text-accent font-medium mb-2">ARTIST</div>
            <h1 className="text-4xl font-bold mb-4">Sample Artist</h1>
            <p className="text-text-secondary mb-6">
              This is a placeholder artist page for artist ID: {id}. In the real app, this would show detailed information from the Spotify API.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-text-secondary" />
                <span className="font-medium">1,234,567</span>
                <span className="text-text-secondary">monthly listeners</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-text-secondary" />
                <span className="font-medium">987,654</span>
                <span className="text-text-secondary">followers</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="btn btn-primary">
              Play
            </button>
            <button className="btn btn-secondary">
              Follow
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Popular</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-background-elevated transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-text-muted">{i}</div>
                  <div>
                    <div className="font-medium">Sample Track {i}</div>
                    <div className="text-sm text-text-secondary">Album Name</div>
                  </div>
                </div>
                <div className="text-text-secondary">3:{i.toString().padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Albums</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-16 w-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded flex items-center justify-center">
                  <span className="text-xl">💿</span>
                </div>
                <div>
                  <div className="font-medium">Sample Album {i}</div>
                  <div className="text-sm text-text-secondary">{2020 + i} • {5 + i} tracks</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">About</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-text-secondary" />
              <span>Started in 2015</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-text-secondary" />
              <span>Based in Sample City</span>
            </div>
            <p className="text-text-secondary text-sm">
              This artist page is a placeholder. In the actual app, it would display real data from the Spotify API including biography, related artists, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}