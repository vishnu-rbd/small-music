import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'

export default function CallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Simulate OAuth callback handling
    const timer = setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      const state = urlParams.get('state')

      if (error) {
        setStatus('error')
        setMessage(`Authentication failed: ${error}`)
        setTimeout(() => navigate('/'), 3000)
      } else if (code && state) {
        // In a real app, you would exchange the code for tokens here
        setStatus('success')
        setMessage('Successfully signed in with Spotify!')
        setTimeout(() => navigate('/'), 2000)
      } else {
        setStatus('error')
        setMessage('Invalid callback parameters')
        setTimeout(() => navigate('/'), 3000)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="card text-center">
          {status === 'loading' && (
            <>
              <div className="h-16 w-16 mx-auto mb-6">
                <div className="h-16 w-16 rounded-full border-4 border-accent/30 border-t-accent animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Completing Sign In</h2>
              <p className="text-text-secondary mb-6">
                Processing Spotify authentication...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-16 w-16 mx-auto mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Success!</h2>
              <p className="text-text-secondary mb-6">{message}</p>
              <p className="text-sm text-text-muted">
                Redirecting you to the homepage...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-16 w-16 mx-auto mb-6">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Authentication Failed</h2>
              <p className="text-text-secondary mb-6">{message}</p>
              <p className="text-sm text-text-muted">
                Redirecting you to the homepage...
              </p>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-text-secondary">
              This page handles the OAuth 2.0 callback from Spotify. In the real app, it would:
            </p>
            <ul className="mt-2 text-sm text-text-muted space-y-1">
              <li>• Exchange the authorization code for access tokens</li>
              <li>• Store tokens securely</li>
              <li>• Redirect to the main app</li>
              <li>• Handle errors gracefully</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}