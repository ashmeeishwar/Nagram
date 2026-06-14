import { useEffect, useState } from 'react'
import { fetchAnagrams, deleteAnagram, isSupabaseConfigured } from '../supabaseClient'

export default function SavedList({ open, onClose }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!open) return
    if (!isSupabaseConfigured) {
      setStatus('error')
      setError('Supabase isn’t configured — see README.')
      return
    }
    let active = true
    setStatus('loading')
    fetchAnagrams()
      .then((data) => {
        if (!active) return
        setItems(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message || 'Could not load saved anagrams.')
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [open])

  async function copy(item) {
    try {
      await navigator.clipboard.writeText(item.anagram)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500)
    } catch {
      setError('Copy failed — your browser blocked clipboard access.')
    }
  }

  async function remove(item) {
    setDeletingId(item.id)
    try {
      await deleteAnagram(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (err) {
      setError(err?.message || 'Could not delete.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Saved anagrams">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__card modal__card--list">
        <div className="modal__head">
          <h2 className="modal__title">Saved anagrams</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {status === 'loading' && <p className="status">Loading…</p>}
        {status === 'error' && <p className="status status--err">{error}</p>}
        {status === 'ready' && items.length === 0 && (
          <p className="status status--note">Nothing saved yet.</p>
        )}

        {status === 'ready' && items.length > 0 && (
          <ul className="saved">
            {items.map((item) => (
              <li key={item.id} className="saved__item">
                <div className="saved__text">
                  <span className="saved__anagram">{item.anagram}</span>
                  <span className="saved__source">from “{item.original_name}”</span>
                </div>
                <div className="saved__actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => copy(item)}
                    aria-label="Copy anagram"
                  >
                    {copiedId === item.id ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => remove(item)}
                    disabled={deletingId === item.id}
                    aria-label="Delete anagram"
                  >
                    {deletingId === item.id ? '…' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {status === 'ready' && error && <p className="status status--err">{error}</p>}
      </div>
    </div>
  )
}
