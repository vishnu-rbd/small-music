import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../auth/AuthProvider';
import { HomePage } from './HomePage';

vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');

/**
 * The original static index.html content moved into the Home route unchanged:
 * a single <h1> ("Hello, world"), the "Coming soon" line, and the site footer.
 */
describe('HomePage', () => {
  it('renders exactly one h1, the paragraph, and the site footer', () => {
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], {
      initialEntries: ['/'],
    });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>,
    );

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Hello, world');
    expect(screen.getByText('Coming soon')).toBeInTheDocument();

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('test-music');
    expect(footer).toHaveClass('site-footer');
  });
});
