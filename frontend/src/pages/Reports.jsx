import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { FiSearch } from 'react-icons/fi'
import api from '../services/api.js'
import Pagination from '../components/Pagination.jsx'
import './Pages.css'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('outgoing')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const fetchReport = async (p = 1) => {
    if (!from || !to) { toast.warning('Please select date range'); return }
    setLoading(true)
    try {
      const endpoint = activeTab === 'outgoing' ? '/entries/reports/outgoing' : '/entries/reports/entered'
      const res = await api.get(endpoint, { params: { from, to, page: p, limit: 10 } })
      setData(res.data.data); setPagination(res.data.pagination)
      setTotalAmount(res.data.totalAmount || 0); setSearched(true)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to load report') }
    finally { setLoading(false) }
  }

  const switchTab = tab => { setActiveTab(tab); setSearched(false); setData([]) }

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Reports</h2><p>Generate parking activity reports</p></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'outgoing' ? 'active' : ''}`} onClick={() => switchTab('outgoing')}>Outgoing Cars</button>
        <button className={`tab ${activeTab === 'entered' ? 'active' : ''}`} onClick={() => switchTab('entered')}>Entered Cars</button>
      </div>

      <div className="card">
        <form onSubmit={e => { e.preventDefault(); fetchReport(1) }} className="report-filter">
          <div className="form-group">
            <label>From Date &amp; Time</label>
            <input type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>To Date &amp; Time</label>
            <input type="datetime-local" value={to} onChange={e => setTo(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <FiSearch /> {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </form>

        {searched && (
          <>
            {activeTab === 'outgoing' && (
              <div className="report-summary">
                <div className="summary-item"><span>Total Records</span><strong>{pagination?.total || 0}</strong></div>
                <div className="summary-item highlight"><span>Total Revenue</span><strong>RWF {totalAmount.toLocaleString()}</strong></div>
              </div>
            )}
            {data.length === 0 ? (
              <div className="empty-state"><p>No records found for the selected period</p></div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Plate Number</th><th>Parking</th><th>Entry Time</th>
                        {activeTab === 'outgoing' && <><th>Exit Time</th><th>Amount (RWF)</th></>}
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(entry => (
                        <tr key={entry._id}>
                          <td><span className="plate">{entry.plateNumber}</span></td>
                          <td>{entry.parking?.name || entry.parkingCode}</td>
                          <td>{new Date(entry.entryDateTime).toLocaleString()}</td>
                          {activeTab === 'outgoing' && (
                            <>
                              <td>{entry.exitDateTime ? new Date(entry.exitDateTime).toLocaleString() : '—'}</td>
                              <td>RWF {entry.chargedAmount?.toLocaleString()}</td>
                            </>
                          )}
                          <td><span className={`status-badge ${entry.status}`}>{entry.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination pagination={pagination} onPageChange={p => fetchReport(p)} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
