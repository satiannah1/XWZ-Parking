import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { FiGrid, FiMapPin, FiTruck, FiBarChart2, FiUsers, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi'
import './Layout.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard',   icon: FiGrid,     roles: ['admin', 'attendant'] },
  { path: '/parkings',  label: 'Parkings',     icon: FiMapPin,   roles: ['admin', 'attendant'] },
  { path: '/entries',   label: 'Car Entries',  icon: FiTruck,    roles: ['admin', 'attendant'] },
  { path: '/reports',   label: 'Reports',      icon: FiBarChart2,roles: ['admin'] },
  { path: '/users',     label: 'Users',        icon: FiUsers,    roles: ['admin'] },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const filtered = navItems.filter(n => n.roles.includes(user?.role))

  return (
    <div className="layout">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🅿</span>
            <span className="logo-text">XWZ Parking</span>
          </div>
          <button className="close-btn" onClick={() => setOpen(false)}><FiX /></button>
        </div>

        <nav className="sidebar-nav">
          {filtered.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} className={`nav-item ${location.pathname === path ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <Icon className="nav-icon" /><span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar"><FiUser /></div>
            <div className="user-details">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className={`user-role ${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /><span>Logout</span>
          </button>
        </div>
      </aside>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <div className="main-wrapper">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)}><FiMenu /></button>
          <div className="topbar-title">
            {filtered.find(n => n.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div className="topbar-user">
            <span>{user?.firstName}</span>
            <span className={`badge ${user?.role}`}>{user?.role}</span>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
