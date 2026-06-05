import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>CodePath</h1>
        <button style={styles.signOut} onClick={handleSignOut}>Çıkış</button>
      </div>
      <div style={styles.content}>
        <h2 style={styles.welcome}>Hoş geldin!</h2>
        <p style={styles.email}>{user?.email}</p>
        <p style={styles.info}>Dashboard yakında gelecek...</p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #222' },
  title: { color: '#00ff88', margin: 0, fontSize: '1.5rem' },
  signOut: { background: 'transparent', border: '1px solid #333', color: '#666', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' },
  content: { padding: '3rem 2rem', textAlign: 'center' },
  welcome: { fontSize: '2rem', marginBottom: '0.5rem' },
  email: { color: '#666', marginBottom: '2rem' },
  info: { color: '#444' },
}