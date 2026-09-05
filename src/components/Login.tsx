import { FormEvent, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-orbit login-orbit-one" />
      <div className="login-orbit login-orbit-two" />
      <form onSubmit={handleSubmit} className="login-card">
        <div className="login-mascot" aria-hidden="true">
          <svg viewBox="0 0 180 180" role="img">
            <path
              className="tooth-shadow"
              d="M47 62c2-27 21-43 43-43s41 16 43 43c2 25-8 35-13 53-4 15-6 37-20 37-10 0-11-15-20-15s-10 15-20 15c-14 0-16-22-20-37-5-18-15-28-13-53Z"
            />
            <path
              className="tooth-body"
              d="M47 59c2-27 21-40 43-40s41 13 43 40c2 24-8 34-13 52-4 15-6 37-20 37-10 0-11-15-20-15s-10 15-20 15c-14 0-16-22-20-37-5-18-15-28-13-52Z"
            />
            <path className="tooth-highlight" d="M61 39c7-9 16-13 27-14-13 8-19 18-21 32-2 13-8 15-12 8-4-7-2-17 6-26Z" />
            <path className="tooth-mouth" d="M73 101c9 9 25 9 34 0" />
            <circle className="tooth-eye" cx="72" cy="82" r="5" />
            <circle className="tooth-eye" cx="108" cy="82" r="5" />
            <path className="tooth-spark" d="m139 49 4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9Z" />
            <path className="tooth-arc" d="M55 126c23 15 47 15 70 0" />
          </svg>
        </div>
        <div className="login-brand">Full<span>arch</span></div>
        <div className="login-kicker">Gestão odontológica com cuidado</div>
        <div className="modal-title">Entrar</div>
        <div className="modal-sub">Acesso da equipe da clínica.</div>
        <label className="field-label">E-mail</label>
        <input
          className="field-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="field-label">Senha</label>
        <input
          className="field-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p style={{ color: '#9C4A3C', fontSize: 12.5, marginBottom: 10 }}>{error}</p>
        )}
        <div className="modal-actions">
          <button className="btn btn-solid" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
