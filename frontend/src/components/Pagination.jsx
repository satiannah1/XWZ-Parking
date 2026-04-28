import React from 'react'
import './Pagination.css'

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null
  const { page, pages, total, limit } = pagination
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const getPages = () => {
    const arr = []
    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) arr.push(i)
    return arr
  }

  return (
    <div className="pagination-wrapper">
      <span className="pagination-info">Showing {start}–{end} of {total}</span>
      <div className="pagination">
        <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
        {getPages()[0] > 1 && <><button className="page-btn" onClick={() => onPageChange(1)}>1</button>{getPages()[0] > 2 && <span className="page-ellipsis">…</span>}</>}
        {getPages().map(p => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        {getPages().at(-1) < pages && <><span className="page-ellipsis">…</span><button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button></>}
        <button className="page-btn" disabled={page === pages} onClick={() => onPageChange(page + 1)}>›</button>
      </div>
    </div>
  )
}
