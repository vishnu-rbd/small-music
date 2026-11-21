import { Link } from 'react-router-dom';

/**
 * The original static page from index.html, now a route. Markup is kept as-is:
 * one <h1>, the "Coming soon" line, and the site footer.
 */
export function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Hello, world</h1>
      <p className="mt-2 text-neutral-400">Coming soon</p>
      <p className="mt-6 text-sm">
        <Link to="/stats" className="text-[#1ed760] underline underline-offset-4">
          See your listening stats
        </Link>
      </p>
      <footer className="site-footer mt-12 border-t border-neutral-800 pt-4 text-sm text-neutral-500">
        test-music
      </footer>
    </main>
  );
}
