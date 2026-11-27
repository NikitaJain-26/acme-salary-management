import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'

function Login() {
  const { login, error: connectionError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (requestError) {
      const message =
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        requestError.response &&
        typeof requestError.response === 'object' &&
        'data' in requestError.response &&
        requestError.response.data &&
        typeof requestError.response.data === 'object' &&
        'message' in requestError.response.data
          ? String(requestError.response.data.message)
          : 'Sign in failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">ACME</h1>
          <p className="mt-1 text-sm text-slate-500">Salary Management</p>
        </div>

        <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign in with your HR account to continue.
        </p>

        {(error || connectionError) && (
          <p className="mt-5 text-sm text-red-600" role="alert">
            {error || connectionError}
          </p>
        )}

        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button
            className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500">
          Accounts are created by an administrator. Public registration is disabled.
        </p>
      </section>
    </main>
  )
}

export default Login
