import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { usePlayerStore } from '../player/store'

export default function Player() {
  const {
    isPlaying,
    currentTrack,
    currentPosition,
    volume,
    play,
    pause,
    next,
    previous,
    setVolume,
  } = usePlayerStore()

  const handlePlay = () => {
    if (!currentTrack) {
      play({
        id: 'sample',
        name: 'Sample Track',
        artist: 'Sample Artist',
        album: 'Sample Album',
        duration: 180000,
        image: '',
      })
    } else if (isPlaying) {
      pause()
    } else {
      // In a real app, this would resume playback
      console.log('Resume playback')
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <p className="text-text-secondary">No track playing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded flex items-center justify-center">
              <span className="text-xl">🎵</span>
            </div>
            <div>
              <div className="font-medium">{currentTrack.name}</div>
              <div className="text-sm text-text-secondary">{currentTrack.artist}</div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-6">
              <button
                onClick={previous}
                className="p-2 rounded-full hover:bg-background-card transition-colors"
                aria-label="Previous track"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={handlePlay}
                className="h-10 w-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent-light transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white" />
                )}
              </button>
              
              <button
                onClick={next}
                className="p-2 rounded-full hover:bg-background-card transition-colors"
                aria-label="Next track"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 w-96">
              <span className="text-xs text-text-secondary">{formatTime(currentPosition)}</span>
              <div className="flex-1 h-1 bg-background-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${(currentPosition / currentTrack.duration) * 100}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary">{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-text-secondary" />
            <div className="w-32">
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                className="w-full accent-accent"
              />
            </div>
            <span className="text-sm text-text-secondary w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}