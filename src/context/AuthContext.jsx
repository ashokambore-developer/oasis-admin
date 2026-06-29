import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || null)
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || 'null')
    } catch {
      return null
    }
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (identifier, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/auth/login', { identifier, password, type: 'admin' })
      const { token: jwt, user } = res.data.data

      if (user.role !== 'ADMIN') {
        setError('Access denied. Admin accounts only.')
        return false
      }

      localStorage.setItem('admin_token', jwt)
      localStorage.setItem('admin_user', JSON.stringify(user))
      setToken(jwt)
      setAdmin(user)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setToken(null)
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, error, loading, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
