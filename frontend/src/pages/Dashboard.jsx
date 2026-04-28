import React, { useEffect, useState } from 'react'
import { FiMapPin, FiTruck, FiCheckCircle, FiLayers } from 'react-icons/fi'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ parkings: 0, totalSpaces: 0, availableSpaces: 0, parked: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, eRes] = await Promise.all([
          api.get('/parkings?limit=100'),
          api.get('/entries?status=parked&limit=5'),
        ])
        const parkings = pRes.data.data
        setStats({
          parkings: pRes.data.pagination.total,
          totalSpaces: parkings.reduce((s, p) => s + p.totalSpaces, 0),
          availableSpaces: parkings.reduce((s, p) => s + p.availableSpaces, 0),
          parked: eRes.data.pagination.total,
        })
        setRecent(eRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Parkings',    value: stats.parkings,        icon: FiMapPin,      color: 'blue' },
    { label: 'Available Spaces',  value: stats.availableSpaces, icon: FiCheckCircle, color: 'green' },
    { label: 'Cars Parked Now',   value: stats.parked,          icon: FiTruck,       color: 'orange' },
    { label: 'Total Spaces',      value: stats.totalSpaces,     icon: FiLayers,      color: 'purple' },
  ]

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {user?.firstName}! 👋</h2>
          <p>Here's what's happening in your parking system today.</p>
        </div>
        <span className={`role-badge ${user?.role}`}>{user?.role}</span>
      </div>

      {loading ? (
        <div className="stats-grid">{[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}</div>
      ) : (
        <div className="stats-grid">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`stat-card stat-${color}`}>
              <div className="stat-icon"><Icon /></div>
              <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-section">
        <h3>Currently Parked Cars</h3>
        {recent.length === 0 ? (
          <div className="empty-state">No cars currently parked.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Plate Number</th><th>Parking</th><th>Location</th><th>Entry Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map(e => (
                  <tr key={e._id}>
                    <td><span className="plate">{e.plateNumber}</span></td>
                    <td>{e.parking?.name || e.parkingCode}</td>
                    <td>{e.parking?.location || '—'}</td>
                    <td>{new Date(e.entryDateTime).toLocaleString()}</td>
                    <td><span className="status-badge parked">Parked</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
