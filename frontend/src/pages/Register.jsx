import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'attendant' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min. 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role })
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">🅿</div>
          <h1>XWZ Parking</h1>
          <p>Smart Parking Management for Kigali</p>
        </div>
        <div className="auth-features">
          <div className="feature-item">✓ Real-time space monitoring</div>
          <div className="feature-item">✓ Automated billing</div>
          <div className="feature-item">✓ Comprehensive reports</div>
          <div className="feature-item">✓ Multi-location support</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Join XWZ Parking Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input type="text" name="firstName" placeholder="John"
                    value={form.firstName} onChange={handleChange}
                    className={errors.firstName ? 'error' : ''} />
                </div>
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input type="text" name="lastName" placeholder="Doe"
                    value={form.lastName} onChange={handleChange}
                    className={errors.lastName ? 'error' : ''} />
                </div>
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input type="email" name="email" placeholder="john@example.com"
                  value={form.email} onChange={handleChange}
                  className={errors.email ? 'error' : ''} />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="input-wrapper">
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="attendant">Parking Attendant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input type={showPwd ? 'text' : 'password'} name="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange}
                  className={errors.password ? 'error' : ''} />
                <button type="button" className="toggle-password" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input type="password" name="confirmPassword" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''} />
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
