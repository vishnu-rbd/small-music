import { BarChart3, Clock, Calendar, TrendingUp, Music2, Heart } from 'lucide-react'

export default function StatsPage() {
  const stats = [
    { label: 'Total Listening Time', value: '1,234 hours', icon: Clock, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Tracks Played', value: '12,345', icon: Music2, color: 'bg-green-500/10 text-green-500' },
    { label: 'Artists Discovered', value: '567', icon: User, color: 'bg-purple-500/10 text-purple-500' },
    { label: 'Current Streak', value: '14 days', icon: TrendingUp, color: 'bg-orange-500/10 text-orange-500' },
    { label: 'Top Genre', value: 'Indie Rock', icon: Heart, color: 'bg-pink-500/10 text-pink-500' },
    { label: 'Most Active Day', value: 'Saturday', icon: Calendar, color: 'bg-cyan-500/10 text-cyan-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Listening Statistics</h1>
        <p className="text-text-secondary">Insights into your music listening habits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold mb-2">{stat.value}</div>
                  <div className="text-text-secondary">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Listening Trends
          </h3>
          <div className="h-64 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-text-secondary">Chart visualization would appear here</p>
              <p className="text-sm text-text-muted mt-2">Using Recharts for data visualization</p>
            </div>
          </div>
          <div className="mt-6 text-sm text-text-secondary">
            <p>This chart would show your listening patterns over time, including:</p>
            <ul className="mt-2 space-y-1">
              <li>• Hours listened per day/week</li>
              <li>• Genre preferences over time</li>
              <li>• Most active listening hours</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-background-elevated transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-accent/20 to-accent/5 rounded flex items-center justify-center">
                    <span className="text-lg">🎵</span>
                  </div>
                  <div>
                    <div className="font-medium">Sample Track {i}</div>
                    <div className="text-sm text-text-secondary">Sample Artist • {i} hour{i !== 1 ? 's' : ''} ago</div>
                  </div>
                </div>
                <div className="text-text-secondary">3:{i.toString().padStart(2, '0')}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-text-secondary">
              Your listening history is stored locally in your browser using IndexedDB. This allows for long-term tracking beyond Spotify's 50-track limit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Need to import User icon
import { User } from 'lucide-react'