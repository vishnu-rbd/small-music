import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import HomePage from '../features/home/HomePage'
import LibraryPage from '../features/library/LibraryPage'
import SearchPage from '../features/search/SearchPage'
import ArtistPage from '../features/artist/ArtistPage'
import StatsPage from '../features/stats/StatsPage'
import SettingsPage from '../features/settings/SettingsPage'
import CallbackPage from '../auth/CallbackPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="artist/:id" element={<ArtistPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/callback" element={<CallbackPage />} />
    </Routes>
  )
}

export default App