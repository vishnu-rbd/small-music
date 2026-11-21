export class SpotifyApiError extends Error {
  readonly status: number;
  /** Seconds to wait, from the `Retry-After` header on a 429. */
  readonly retryAfterSeconds: number | undefined;

  constructor(status: number, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'SpotifyApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }
}
