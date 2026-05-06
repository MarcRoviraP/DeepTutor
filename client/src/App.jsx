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
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      // Auto-redirect if already logged in
      window.location.href = '/dashboard'
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
      console.error('Login failed:', error)
      alert('Error during login. Please try again.')
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
        <p className="subtitle">Your AI-Powered Learning Assistant</p>

        {!user ? (
          <div className="login-section">
            <p>Sign in to continue</p>
            {loading ? (
              <div className="loader"></div>
            ) : (
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                useOneTap
              />
            )}
          </div>
        ) : (
          <div className="profile-section">
            <img src={user.picture} alt={user.name} className="avatar" />
            <h2>Welcome, {user.name}!</h2>
            <p>{user.email}</p>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
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
