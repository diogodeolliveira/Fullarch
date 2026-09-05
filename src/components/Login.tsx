import { FormEvent, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('A senha precisa ter pelo menos 6 caracteres.')
        }
        if (password !== confirmPassword) {
          throw new Error('As senhas não conferem.')
        }
        const { session } = await signUp(email, password)
        if (!session) {
          setSuccess('Usuário criado. Confira seu e-mail para confirmar o acesso.')
          setPassword('')
          setConfirmPassword('')
        }
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : mode === 'login' ? 'Falha no login.' : 'Falha ao criar usuário.')
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
        <div className="login-switch" role="tablist" aria-label="Acesso à clínica">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
          >
            Criar usuário
          </button>
        </div>
        <div className="modal-title">{mode === 'login' ? 'Entrar' : 'Criar acesso'}</div>
        <div className="modal-sub">
          {mode === 'login' ? 'Acesso da equipe da clínica.' : 'Cadastre seu e-mail para acessar a clínica.'}
        </div>
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
        {mode === 'signup' && (
          <>
            <label className="field-label">Confirmar senha</label>
            <input
              className="field-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </>
        )}
        {error && (
          <p style={{ color: '#9C4A3C', fontSize: 12.5, marginBottom: 10 }}>{error}</p>
        )}
        {success && (
          <p className="login-success">{success}</p>
        )}
        <div className="modal-actions">
          <button className="btn btn-solid" type="submit" disabled={loading}>
            {loading ? mode === 'login' ? 'Entrando…' : 'Criando…' : mode === 'login' ? 'Entrar' : 'Criar usuário'}
          </button>
        </div>
      </form>
    </div>
  )
}
