import { useState } from 'react'
import { Settings as SettingsIcon, Palette, Bell, Shield, Database, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [accentColor, setAccentColor] = useState('#1db954')

  const accentColors = [
    { name: 'Spotify Green', value: '#1db954' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cyan', value: '#06b6d4' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-text-secondary">Customize your test-music experience</p>
      </div>

      <div className="space-y-8">
        {/* Appearance Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Appearance</h3>
              <p className="text-text-secondary">Customize the look and feel</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-text-secondary">Switch between light and dark themes</div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-accent' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <div className="font-medium mb-3">Accent Color</div>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setAccentColor(color.value)
                      // In a real app, this would update CSS variables
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                      accentColor === color.value
                        ? 'bg-accent/10 border-2 border-accent'
                        : 'hover:bg-background-elevated border-2 border-transparent'
                    }`}
                  >
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Notifications</h3>
              <p className="text-text-secondary">Control app notifications</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Notifications</div>
              <div className="text-sm text-text-secondary">Show playback and system notifications</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-accent' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Privacy & Data</h3>
              <p className="text-text-secondary">Manage your data and privacy settings</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Privacy Mode</div>
                <div className="text-sm text-text-secondary">Hide listening activity from Spotify</div>
              </div>
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacyMode ? 'bg-accent' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacyMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Clear Local History</div>
                <div className="text-sm text-text-secondary">Delete all listening history stored in your browser</div>
              </div>
              <button className="px-4 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Clear Data
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Database className="h-5 w-5 text-blue-500" />
              <div className="text-sm">
                <div className="font-medium">Data Storage</div>
                <div className="text-blue-600 dark:text-blue-300">
                  All data is stored locally in your browser. No information is sent to external servers.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">About</h3>
              <p className="text-text-secondary">App information and credits</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-text-secondary">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">License</span>
              <span className="font-medium">MIT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Source Code</span>
              <a href="#" className="text-accent hover:underline font-medium">
                GitHub
              </a>
            </div>
            <div className="pt-4 border-t border-border text-sm text-text-secondary">
              <p>
                test-music is an open-source Spotify client that runs entirely in your browser.
                It is not affiliated with Spotify. Spotify is a registered trademark of Spotify AB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}