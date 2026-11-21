import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Music, Library, Search, User, BarChart3, Settings, Moon, Sun } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Music },
  { path: '/library', label: 'Library', icon: Library },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">test-music</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'text-text-secondary hover:text-text hover:bg-background-card'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-background-card transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-text" />
                ) : (
                  <Moon className="h-5 w-5 text-text" />
                )}
              </button>
              
              <button className="btn btn-primary">
                Sign in with Spotify
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-text-secondary">
          <p>© {new Date().getFullYear()} test-music. An open-source Spotify client.</p>
          <p className="mt-2 text-sm">
            This app is not affiliated with Spotify. Spotify is a registered trademark of Spotify AB.
          </p>
        </div>
      </footer>
    </div>
  )
}