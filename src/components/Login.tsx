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
          <svg className="smooth-mascot" viewBox="0 0 200 210" role="img">
            <ellipse className="mascot-ground" cx="100" cy="199" rx="45" ry="6" />
            <path className="mascot-arm mascot-arm-left" d="M68 132c-14 2-24 9-32 20" />
            <path className="mascot-arm mascot-arm-right" d="M132 132c14 2 24 9 32 20" />
            <circle className="mascot-hand" cx="34" cy="154" r="9" />
            <circle className="mascot-hand" cx="166" cy="154" r="9" />
            <path className="mascot-leg" d="M82 165v24c0 8-5 12-11 12s-10-4-10-12v-24Z" />
            <path className="mascot-leg" d="M118 165v24c0 8 5 12 11 12s10-4 10-12v-24Z" />
            <rect className="mascot-body" x="63" y="105" width="74" height="65" rx="17" />
            <path className="mascot-body-shine" d="M76 119c5-5 12-7 20-7h7c-10 5-14 12-15 21-1 7-6 9-10 4-4-5-4-12-2-18Z" />
            <path className="mascot-tooth-shadow" d="M55 58c0-27 18-44 45-44s45 17 45 44c0 20-6 28-10 42-4 13-5 25-17 25-9 0-10-16-18-16s-9 16-18 16c-12 0-13-12-17-25-4-14-10-22-10-42Z" />
            <path className="mascot-tooth" d="M51 54c0-27 18-44 45-44s45 17 45 44c0 20-6 28-10 42-4 13-5 25-17 25-9 0-10-16-18-16s-9 16-18 16c-12 0-13-12-17-25-4-14-10-22-10-42Z" />
            <path className="mascot-tooth-highlight" d="M65 34c7-10 17-15 29-15-14 7-20 18-21 31-1 10-8 12-12 6-4-6-3-14 4-22Z" />
            <path className="mascot-brow" d="M70 55c5-4 11-5 17-2M112 53c6-3 12-2 17 2" />
            <ellipse className="mascot-eye" cx="78" cy="69" rx="7" ry="9" />
            <ellipse className="mascot-eye" cx="122" cy="69" rx="7" ry="9" />
            <circle className="mascot-eye-glint" cx="80" cy="66" r="2.5" /><circle className="mascot-eye-glint" cx="124" cy="66" r="2.5" />
            <circle className="mascot-cheek" cx="65" cy="88" r="6" /><circle className="mascot-cheek" cx="135" cy="88" r="6" />
            <path className="mascot-mouth" d="M84 85c5 9 11 11 16 11s11-2 16-11" />
            <path className="mascot-tongue" d="M94 94c4 3 8 3 12 0" />
            <path className="mascot-collar" d="m80 109 20 18 20-18-8-7H88Z" />
            <path className="mascot-bowtie" d="m100 119-18-9-5 13 17 8Zm0 0 18-9 5 13-17 8Z" />
            <circle className="mascot-bowtie-center" cx="100" cy="125" r="5" />
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
