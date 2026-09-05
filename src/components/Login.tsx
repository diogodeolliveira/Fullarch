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
          <svg className="pixel-mascot" viewBox="0 0 160 160" role="img">
            <g shapeRendering="crispEdges">
              <path className="pixel-brush" d="M22 47h12v7h5v7h5v7h-5v7h-4v7h-5v-7h-5v-7h-5v-7h-3v-7h5Z" />
              <path className="pixel-brush-handle" d="M27 76h10v49h-5v8h-7v-8h-4v-7h6Z" />
              <path className="pixel-bristles" d="M20 43h20v8H20Z" />
              <path className="pixel-tooth-shadow" d="M55 35h8v-5h12v-5h20v5h13v5h9v7h7v13h5v28h-5v15h-6v14h-8v15h-9v10h-13v-7H72v7H60v-10h-8v-15h-7v-14h-6V83h-5V55h5V42h8v-7h8Z" />
              <path className="pixel-tooth" d="M52 31h10v-6h13v-5h20v5h13v6h10v8h7v14h5v27h-5v15h-6v15h-8v15h-9v9H76v-7H63v7H51v-9h-8v-15h-7v-15h-6V81h-5V54h5V40h7v-9h15Z" />
              <path className="pixel-highlight" d="M48 42h8v-7h10v-5h10v5h-7v8h-6v15h-9v-7h-6Z" />
              <path className="pixel-brow" d="M54 67h12v4H54ZM87 71h12v-4h5v4h-5v4H87Z" />
              <path className="pixel-eye" d="M54 77h13v4h4v12h-4v5H54v-4h-5V81h5Z" />
              <path className="pixel-eye" d="M91 77h13v4h4v12h-4v5H91v-4h-5V81h5Z" />
              <path className="pixel-glint" d="M55 81h5v5h-5Z" /><path className="pixel-glint" d="M92 81h5v5h-5Z" />
              <path className="pixel-cheek" d="M43 101h9v5h5v6H43Z" /><path className="pixel-cheek" d="M103 106h5v-5h9v11h-14Z" />
              <path className="pixel-mouth" d="M65 104h5v5h17v-5h5v10h-5v5H70v-5h-5Z" />
              <path className="pixel-tongue" d="M74 114h9v4h-9Z" />
              <path className="pixel-coat" d="M43 119h21v7h8v9H58v-5H43ZM91 126h8v-7h20v18H99v-9Z" />
              <path className="pixel-bowtie" d="M75 119h-9v8h9v5h10v-5h9v-8h-9v-4H75Z" />
              <path className="pixel-spark" d="M132 28h5v7h6v5h-6v7h-5v-7h-6v-5h6Z" />
            </g>
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
