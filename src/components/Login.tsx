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
          <svg viewBox="0 0 240 230" role="img">
            <ellipse className="tooth-ground" cx="121" cy="214" rx="67" ry="8" />
            <g className="mascot-brush">
              <path className="brush-handle" d="M39 70 72 202c2 8-10 11-12 3L27 76Z" />
              <path className="brush-neck" d="m27 76-8-35 18-5 8 35Z" />
              <rect className="brush-head" x="15" y="8" width="27" height="40" rx="10" transform="rotate(-14 15 8)" />
              <path className="brush-bristles" d="M18 13h21M16 19h23M17 25h23M18 31h23M20 37h22" />
              <path className="brush-label" d="M48 129l9 35" />
            </g>
            <path className="tooth-shadow" d="M76 61c0-19 8-32 22-38 8-4 14-3 21 1 7-7 18-8 26-3 8-5 19-5 27 1 13 8 19 21 19 39 0 27-8 39-13 56-5 18-6 47-22 47-12 0-13-22-22-22s-10 22-23 22c-16 0-17-29-22-47-5-17-13-29-13-56Z" />
            <path className="tooth-body" d="M73 57c0-19 8-32 22-38 8-4 14-3 21 1 7-7 18-8 26-3 8-5 19-5 27 1 13 8 19 21 19 39 0 27-8 39-13 56-5 18-6 47-22 47-12 0-13-22-22-22s-10 22-23 22c-16 0-17-29-22-47-5-17-13-29-13-56Z" />
            <path className="tooth-highlight" d="M88 35c8-11 18-16 29-15-14 8-20 20-21 36-1 12-9 15-14 7-4-7-2-18 6-28Z" />
            <path className="coat-left" d="m78 112 31 10-6 54-29-5c-6-1-9-7-7-13Z" />
            <path className="coat-right" d="m176 112-31 10 6 54 29-5c6-1 9-7 7-13Z" />
            <path className="coat-collar" d="m104 111 21 18-16 11-16-24ZM150 111l-21 18 16 11 16-24Z" />
            <path className="bowtie" d="m126 121-17-9-5 14 19 8Zm3 0 17-9 5 14-19 8Z" />
            <circle className="bowtie-center" cx="128" cy="128" r="5" />
            <path className="coat-button" d="M101 148h4M103 157h4M154 148h4M156 157h4" />
            <path className="brow" d="M101 66c6-5 12-6 18-3M139 63c7-3 13-2 18 3" />
            <ellipse className="tooth-eye" cx="109" cy="82" rx="8" ry="10" />
            <ellipse className="tooth-eye" cx="148" cy="82" rx="8" ry="10" />
            <circle className="eye-glint" cx="111" cy="79" r="3" />
            <circle className="eye-glint" cx="150" cy="79" r="3" />
            <circle className="cheek" cx="96" cy="100" r="7" />
            <circle className="cheek" cx="161" cy="100" r="7" />
            <path className="tooth-mouth" d="M116 99c8 12 22 12 30 0" />
            <path className="mouth-tongue" d="M126 108c4 3 8 3 12 0" />
            <path className="wave-arm" d="m177 117 25-28" />
            <path className="wave-hand" d="m198 91c-5-9 3-13 7-5l2-13c1-8 9-7 8 1l-1 14 6-11c4-7 10-2 6 5l-7 15c-3 7-10 12-18 10Z" />
            <path className="tooth-spark" d="m211 36 4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9Z" />
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
