import { useMemo, useState } from 'react'
import { saveAnagram, isSupabaseConfigured } from '../supabaseClient'

// Render a single character, showing spaces as a visible placeholder symbol.
function displayChar(ch) {
  return ch === ' ' ? '␣' : ch
}

export default function LetterGame({ name, onReset }) {
  // One fixed slot per character, in original order. Index never changes.
  const slots = useMemo(
    () => Array.from(name).map((char, index) => ({ char, index })),
    [name]
  )

  // Indices of booked letters, in tap order (Line 2, packed left).
  const [booked, setBooked] = useState([])
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState('')

  const bookedSet = useMemo(() => new Set(booked), [booked])
  const anagram = useMemo(
    () => booked.map((i) => slots[i].char).join(''),
    [booked, slots]
  )
  const allBooked = slots.length > 0 && booked.length === slots.length

  function book(index) {
    if (saveState === 'saving') return
    setBooked((prev) => (prev.includes(index) ? prev : [...prev, index]))
  }

  function unbook(index) {
    if (saveState === 'saving' || saveState === 'saved') return
    setBooked((prev) => prev.filter((i) => i !== index))
  }

  async function handleSave() {
    setSaveState('saving')
    setErrorMsg('')
    try {
      await saveAnagram(name, anagram)
      setSaveState('saved')
    } catch (err) {
      setSaveState('error')
      setErrorMsg(err?.message || 'Could not save. Please try again.')
    }
  }

  return (
    <div className="game">
      <p className="game__source">
        <span className="game__source-label">Name</span>
        <span className="game__source-name">{name}</span>
      </p>

      {/* Line 1 — available letters in fixed original positions */}
      <section className="line line--available" aria-label="Available letters">
        {slots.map((slot) => {
          const isBooked = bookedSet.has(slot.index)
          return (
            <button
              key={slot.index}
              type="button"
              className={`slot ${isBooked ? 'slot--placeholder' : 'slot--available'}`}
              onClick={() => !isBooked && book(slot.index)}
              disabled={isBooked || saveState === 'saving' || saveState === 'saved'}
              aria-label={
                isBooked
                  ? `${displayChar(slot.char)} (booked)`
                  : `Book letter ${displayChar(slot.char)}`
              }
            >
              {displayChar(slot.char)}
            </button>
          )
        })}
      </section>

      {/* Line 2 — booked letters, packed left in tap order */}
      <section className="line line--booked" aria-label="Your anagram">
        {booked.length === 0 ? (
          <span className="line__hint">Tap letters above to build your anagram</span>
        ) : (
          booked.map((index) => (
            <button
              key={index}
              type="button"
              className="slot slot--booked"
              onClick={() => unbook(index)}
              disabled={saveState === 'saving' || saveState === 'saved'}
              aria-label={`Return letter ${displayChar(slots[index].char)}`}
            >
              {displayChar(slots[index].char)}
            </button>
          ))
        )}
      </section>

      {/* Actions */}
      <div className="actions">
        {saveState === 'saved' ? (
          <>
            <p className="status status--ok">Saved!</p>
            <button type="button" className="btn btn--primary" onClick={onReset}>
              New
            </button>
          </>
        ) : (
          <>
            {allBooked && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSave}
                disabled={saveState === 'saving'}
              >
                {saveState === 'saving' ? 'Saving…' : 'Save'}
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onReset}>
              Reset
            </button>
          </>
        )}

        {saveState === 'error' && <p className="status status--err">{errorMsg}</p>}
        {allBooked && !isSupabaseConfigured && saveState !== 'saved' && (
          <p className="status status--note">
            Supabase isn’t configured — saving is disabled. See README.
          </p>
        )}
      </div>
    </div>
  )
}
