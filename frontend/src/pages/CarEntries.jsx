import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiLogOut, FiTruck, FiSearch, FiPrinter } from 'react-icons/fi'
import api from '../services/api.js'
import Modal from '../components/Modal.jsx'
import Pagination from '../components/Pagination.jsx'
import './Pages.css'

export default function CarEntries() {
  const [entries, setEntries] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [parkings, setParkings] = useState([])
  const [entryModal, setEntryModal] = useState(false)
  const [entryForm, setEntryForm] = useState({ plateNumber: '', parkingCode: '', driverEmail: '' })
  const [submitting, setSubmitting] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [bill, setBill] = useState(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (statusFilter) params.status = statusFilter
      if (search) params.plateNumber = search
      const { data } = await api.get('/entries', { params })
      setEntries(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load entries') }
    finally { setLoading(false) }
  }, [page, statusFilter, search])

  useEffect(() => { fetchEntries() }, [fetchEntries])
  useEffect(() => { api.get('/parkings?limit=100').then(({ data }) => setParkings(data.data)).catch(() => {}) }, [])

  const handleEntry = async e => {
    e.preventDefault(); setSubmitting(true)
    try {
      const { data } = await api.post('/entries', entryForm)
      setTicket({ ...data.ticket, emailSent: data.emailSent, driverEmail: entryForm.driverEmail })
      setEntryModal(false)
      setEntryForm({ plateNumber: '', parkingCode: '', driverEmail: '' })
      toast.success(data.emailSent ? `Entry registered — ticket sent to ${entryForm.driverEmail}` : 'Car entry registered')
      fetchEntries()
    } catch (err) { toast.error(err.response?.data?.message || 'Entry failed') }
    finally { setSubmitting(false) }
  }

  const handleExit = async id => {
    if (!window.confirm('Confirm car exit?')) return
    try {
      const { data } = await api.put(`/entries/${id}/exit`)
      setBill({ ...data.bill, emailSentTo: data.emailSentTo })
      toast.success(data.emailSentTo ? `Exit registered — bill sent to ${data.emailSentTo}` : 'Car exit registered')
      fetchEntries()
    } catch (err) { toast.error(err.response?.data?.message || 'Exit failed') }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Car Entries</h2><p>Manage car entries and exits</p></div>
        <button className="btn-primary" onClick={() => setEntryModal(true)}><FiPlus /> Register Entry</button>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <FiSearch />
          <input placeholder="Search plate number..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option value="parked">Parked</option>
          <option value="exited">Exited</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-rows">{[1,2,3,4,5].map(i => <div key={i} className="skeleton-row" />)}</div>
        ) : entries.length === 0 ? (
          <div className="empty-state"><FiTruck size={40} /><p>No entries found</p></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Plate</th><th>Parking</th><th>Entry Time</th><th>Exit Time</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e._id}>
                      <td><span className="plate">{e.plateNumber}</span></td>
                      <td>{e.parking?.name || e.parkingCode}</td>
                      <td>{new Date(e.entryDateTime).toLocaleString()}</td>
                      <td>{e.exitDateTime ? new Date(e.exitDateTime).toLocaleString() : '—'}</td>
                      <td>{e.chargedAmount > 0 ? `RWF ${e.chargedAmount.toLocaleString()}` : '—'}</td>
                      <td><span className={`status-badge ${e.status}`}>{e.status}</span></td>
                      <td>{e.status === 'parked' && <button className="btn-exit" onClick={() => handleExit(e._id)}><FiLogOut /> Exit</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Entry Modal */}
      <Modal isOpen={entryModal} onClose={() => setEntryModal(false)} title="Register Car Entry" size="sm">
        <form onSubmit={handleEntry} className="modal-form">
          <div className="form-group">
            <label>Plate Number *</label>
            <input
              value={entryForm.plateNumber}
              onChange={e => setEntryForm({ ...entryForm, plateNumber: e.target.value })}
              placeholder="e.g. RAB 123 A"
              required
            />
          </div>
          <div className="form-group">
            <label>Parking *</label>
            <select
              value={entryForm.parkingCode}
              onChange={e => setEntryForm({ ...entryForm, parkingCode: e.target.value })}
              required
            >
              <option value="">Select parking...</option>
              {parkings.map(p => (
                <option key={p._id} value={p.code} disabled={p.availableSpaces === 0}>
                  {p.name} ({p.code}) — {p.availableSpaces} spaces
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Driver Email <span className="label-optional">(optional)</span></label>
            <input
              type="email"
              value={entryForm.driverEmail}
              onChange={e => setEntryForm({ ...entryForm, driverEmail: e.target.value })}
              placeholder="driver@example.com"
            />
            <span className="field-hint">
              📧 Ticket will be emailed on entry. Bill will be emailed on exit.
            </span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setEntryModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner-sm" /> : 'Register Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Modal */}
      <Modal isOpen={!!ticket} onClose={() => setTicket(null)} title="Entry Ticket" size="sm">
        {ticket && (
          <div className="ticket">
            <div className="ticket-header">
              <span className="ticket-logo">🅿</span>
              <h3>XWZ PARKING SYSTEM</h3>
              <p>Entry Ticket</p>
            </div>
            <div className="ticket-body">
              <div className="ticket-row"><span>Ticket #</span><strong>{ticket.ticketNumber}</strong></div>
              <div className="ticket-row"><span>Plate</span><strong>{ticket.plateNumber}</strong></div>
              <div className="ticket-row"><span>Parking</span><strong>{ticket.parkingName}</strong></div>
              <div className="ticket-row"><span>Location</span><strong>{ticket.location}</strong></div>
              <div className="ticket-row"><span>Entry Time</span><strong>{new Date(ticket.entryDateTime).toLocaleString()}</strong></div>
              <div className="ticket-row"><span>Rate</span><strong>RWF {ticket.feePerHour}/hr</strong></div>
            </div>
            {ticket.emailSent && (
              <div className="email-notice">
                📧 Ticket sent to <strong>{ticket.driverEmail}</strong>
              </div>
            )}
            <button className="btn-print" onClick={() => window.print()}><FiPrinter /> Print Ticket</button>
          </div>
        )}
      </Modal>

      {/* Bill Modal */}
      <Modal isOpen={!!bill} onClose={() => setBill(null)} title="Exit Bill" size="sm">
        {bill && (
          <div className="ticket">
            <div className="ticket-header">
              <span className="ticket-logo">🅿</span>
              <h3>XWZ PARKING SYSTEM</h3>
              <p>Exit Bill</p>
            </div>
            <div className="ticket-body">
              <div className="ticket-row"><span>Bill #</span><strong>{bill.billNumber}</strong></div>
              <div className="ticket-row"><span>Plate</span><strong>{bill.plateNumber}</strong></div>
              <div className="ticket-row"><span>Parking</span><strong>{bill.parkingCode}</strong></div>
              <div className="ticket-row"><span>Entry</span><strong>{new Date(bill.entryDateTime).toLocaleString()}</strong></div>
              <div className="ticket-row"><span>Exit</span><strong>{new Date(bill.exitDateTime).toLocaleString()}</strong></div>
              <div className="ticket-row"><span>Duration</span><strong>{bill.durationMinutes} min ({bill.durationHours} hrs)</strong></div>
              <div className="ticket-row"><span>Rate</span><strong>RWF {bill.feePerHour}/hr</strong></div>
              <div className="ticket-total"><span>Total Amount</span><strong>RWF {bill.totalAmount.toLocaleString()}</strong></div>
            </div>
            {bill.emailSentTo && (
              <div className="email-notice">
                📧 Bill sent to <strong>{bill.emailSentTo}</strong>
              </div>
            )}
            <button className="btn-print" onClick={() => window.print()}><FiPrinter /> Print Bill</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
