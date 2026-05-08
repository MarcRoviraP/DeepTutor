import { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    // ONLY redirect if we are on the login page (root) and have a user
    if (storedUser && window.location.pathname === '/') {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      // Auto-redirect to dashboard
      window.location.href = '/dashboard'
    } else if (storedUser) {
      // Just set the user if we are elsewhere but have the data
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLoginSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      const { credential } = credentialResponse
      const response = await axios.post('/api/auth/google', { credential })
      
      const { token, user: userData } = response.data
      
      // Store JWT and user info
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      // Redirect to main app
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Detalles de fallo en login:', error.response?.data || error.message)
      alert('Error durante el inicio de sesión. Por favor, intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <div className="container">
      <div className="card">
        <h1>DeepTutor</h1>
        <p className="subtitle">Tu asistente de aprendizaje potenciado por IA</p>

        {!user ? (
          <div className="login-section">
            <p>Iniciá sesión para continuar</p>
            {loading ? (
              <div className="loader"></div>
            ) : (
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Fallo en el Login')}
                useOneTap
              />
            )}
          </div>
        ) : (
          <div className="profile-section">
            <img src={user.picture} alt={user.name} className="avatar" />
            <h2>¡Bienvenido, {user.name}!</h2>
            <p>{user.email}</p>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
            <button onClick={() => window.location.href = '/avatar'} className="home-btn">
              Volver al Avatar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
