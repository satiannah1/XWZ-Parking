import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiSearch } from 'react-icons/fi'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import './Pages.css'

const INIT = { code: '', name: '', totalSpaces: '', location: '', feePerHour: '' }

export default function Parkings() {
  const { isAdmin } = useAuth()
  const [parkings, setParkings] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(INIT)
  const [submitting, setSubmitting] = useState(false)

  const fetchParkings = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.location = search
      const { data } = await api.get('/parkings', { params })
      setParkings(data.data)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load parkings') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchParkings() }, [fetchParkings])

  const openCreate = () => { setEditItem(null); setForm(INIT); setModalOpen(true) }
  const openEdit = p => { setEditItem(p); setForm({ code: p.code, name: p.name, totalSpaces: p.totalSpaces, location: p.location, feePerHour: p.feePerHour }); setModalOpen(true) }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editItem) { await api.put(`/parkings/${editItem._id}`, form); toast.success('Parking updated') }
      else { await api.post('/parkings', form); toast.success('Parking created') }
      setModalOpen(false); fetchParkings()
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this parking?')) return
    try { await api.delete(`/parkings/${id}`); toast.success('Deleted'); fetchParkings() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Parking Locations</h2><p>Manage all parking spaces and locations</p></div>
        {isAdmin() && <button className="btn-primary" onClick={openCreate}><FiPlus /> Add Parking</button>}
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <FiSearch />
          <input placeholder="Search by location..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-rows">{[1,2,3,4,5].map(i => <div key={i} className="skeleton-row" />)}</div>
        ) : parkings.length === 0 ? (
          <div className="empty-state"><FiMapPin size={40} /><p>No parkings found</p></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th><th>Name</th><th>Location</th><th>Total</th><th>Available</th><th>Fee/Hour</th>
                    {isAdmin() && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {parkings.map(p => (
                    <tr key={p._id}>
                      <td><span className="code-badge">{p.code}</span></td>
                      <td>{p.name}</td>
                      <td>{p.location}</td>
                      <td>{p.totalSpaces}</td>
                      <td><span className={`spaces-badge ${p.availableSpaces === 0 ? 'full' : p.availableSpaces < 5 ? 'low' : 'ok'}`}>{p.availableSpaces}</span></td>
                      <td>RWF {p.feePerHour.toLocaleString()}/hr</td>
                      {isAdmin() && (
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon edit" onClick={() => openEdit(p)}><FiEdit2 /></button>
                            <button className="btn-icon delete" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Parking' : 'Add New Parking'}>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Parking Code *</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. PKG001" required disabled={!!editItem} />
            </div>
            <div className="form-group">
              <label>Parking Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kigali City Center" required />
            </div>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. KN 5 Rd, Kigali" required />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Total Spaces *</label>
              <input type="number" min="1" value={form.totalSpaces} onChange={e => setForm({ ...form, totalSpaces: e.target.value })} placeholder="50" required />
            </div>
            <div className="form-group">
              <label>Fee Per Hour (RWF) *</label>
              <input type="number" min="0" step="0.01" value={form.feePerHour} onChange={e => setForm({ ...form, feePerHour: e.target.value })} placeholder="500" required />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner-sm" /> : editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
