/** Formats milliseconds as `m:ss` (Spotify track durations). */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Picks the smallest image that is still at least `minSize` wide, else the last one. */
export function pickImageUrl(images: { url: string; width: number | null }[], minSize = 64): string | undefined {
  const usable = images
    .filter((image) => image.url)
    .slice()
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (usable.find((image) => (image.width ?? 0) >= minSize) ?? usable[usable.length - 1])?.url;
}
