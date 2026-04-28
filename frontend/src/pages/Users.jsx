import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { FiUsers, FiSearch } from 'react-icons/fi'
import api from '../services/api.js'
import Pagination from '../components/Pagination.jsx'
import './Pages.css'

export default function Users() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/auth/users', { params: { page, limit: 10 } })
      setUsers(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = search
    ? users.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
    : users

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>System Users</h2><p>Manage all registered users</p></div>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <FiSearch />
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-rows">{[1,2,3,4,5].map(i => <div key={i} className="skeleton-row" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><FiUsers size={40} /><p>No users found</p></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Registered</th></tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u._id}>
                      <td>{(page - 1) * 10 + i + 1}</td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">{u.firstName[0]}{u.lastName[0]}</div>
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
