import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>CodePath</h1>
        <p style={styles.subtitle}>Hesabına giriş yap</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p style={styles.link}>Hesabın yok mu? <Link to="/register">Kayıt ol</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' },
  card: { background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '400px' },
  title: { color: '#00ff88', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: '700' },
  subtitle: { color: '#666', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: { background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '0.75rem 1rem', fontSize: '1rem', outline: 'none' },
  button: { background: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  error: { color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' },
  link: { color: '#666', textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem' },
}