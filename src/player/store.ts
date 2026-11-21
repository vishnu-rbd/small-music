import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Track {
  id: string
  name: string
  artist: string
  album: string
  duration: number
  image: string
}

interface PlayerState {
  // Playback state
  isPlaying: boolean
  currentTrack: Track | null
  currentPosition: number
  volume: number
  deviceId: string | null
  isActiveDevice: boolean
  
  // Queue
  queue: Track[]
  currentIndex: number
  
  // Actions
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seek: (position: number) => void
  setVolume: (volume: number) => void
  setDeviceId: (deviceId: string) => void
  setIsActiveDevice: (isActive: boolean) => void
  addToQueue: (track: Track) => void
  clearQueue: () => void
}

const defaultTrack: Track = {
  id: 'default',
  name: 'Sample Track',
  artist: 'Sample Artist',
  album: 'Sample Album',
  duration: 180000, // 3 minutes in milliseconds
  image: '',
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    (set) => ({
      // Initial state
      isPlaying: false,
      currentTrack: null,
      currentPosition: 0,
      volume: 0.7,
      deviceId: null,
      isActiveDevice: false,
      queue: [],
      currentIndex: -1,
      
      // Actions
      play: (track) =>
        set((state) => ({
          isPlaying: true,
          currentTrack: track,
          currentPosition: 0,
          currentIndex: state.queue.length > 0 ? state.currentIndex : -1,
        })),
      
      pause: () => set({ isPlaying: false }),
      
      resume: () => set({ isPlaying: true }),
      
      next: () =>
        set((state) => {
          if (state.queue.length === 0) {
            return { isPlaying: false, currentTrack: null, currentPosition: 0, currentIndex: -1 }
          }
          
          const nextIndex = state.currentIndex + 1
          if (nextIndex >= state.queue.length) {
            return { isPlaying: false, currentTrack: null, currentPosition: 0, currentIndex: -1 }
          }
          
          return {
            currentTrack: state.queue[nextIndex],
            currentPosition: 0,
            currentIndex: nextIndex,
          }
        }),
      
      previous: () =>
        set((state) => {
          if (state.queue.length === 0 || state.currentIndex <= 0) {
            return { currentPosition: 0 }
          }
          
          const prevIndex = state.currentIndex - 1
          return {
            currentTrack: state.queue[prevIndex],
            currentPosition: 0,
            currentIndex: prevIndex,
          }
        }),
      
      seek: (position) => set({ currentPosition: position }),
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      setDeviceId: (deviceId) => set({ deviceId }),
      
      setIsActiveDevice: (isActiveDevice) => set({ isActiveDevice }),
      
      addToQueue: (track) =>
        set((state) => ({
          queue: [...state.queue, track],
        })),
      
      clearQueue: () =>
        set({
          queue: [],
          currentIndex: -1,
          currentTrack: null,
          currentPosition: 0,
          isPlaying: false,
        }),
    }),
    { name: 'PlayerStore' }
  )
)