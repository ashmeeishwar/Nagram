import { useMemo, useRef, useState } from 'react'
import { saveAnagram, isSupabaseConfigured } from '../supabaseClient'

const SPACE = '␣'

export default function LetterGame({ name, onReset }) {
  // One fixed slot per *letter* (spaces are handled by the dedicated space
  // button, not by per-character slots). Positions never reorder.
  const slots = useMemo(
    () =>
      Array.from(name)
        .filter((char) => char !== ' ')
        .map((char, id) => ({ char, id })),
    [name]
  )

  // Line 2 contents, in tap order. Each token is either a booked letter
  // ({ kind: 'letter', id, char }) or an inserted space ({ kind: 'space' }).
  const [booked, setBooked] = useState([])
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState('')
  const spaceUid = useRef(0)

  const locked = saveState === 'saving' || saveState === 'saved'

  const bookedLetterIds = useMemo(
    () => new Set(booked.filter((t) => t.kind === 'letter').map((t) => t.id)),
    [booked]
  )
  const anagram = useMemo(
    () => booked.map((t) => (t.kind === 'space' ? ' ' : t.char)).join(''),
    [booked]
  )
  // Save depends only on the letters — leftover/unused spaces never block it.
  const allLettersBooked = slots.length > 0 && bookedLetterIds.size === slots.length

  function bookLetter(slot) {
    if (locked || bookedLetterIds.has(slot.id)) return
    setBooked((prev) => [...prev, { kind: 'letter', id: slot.id, char: slot.char, key: `L${slot.id}` }])
  }

  function addSpace() {
    if (locked) return
    setBooked((prev) => [...prev, { kind: 'space', key: `S${spaceUid.current++}` }])
  }

  function removeToken(key) {
    if (locked) return
    setBooked((prev) => prev.filter((t) => t.key !== key))
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

      {/* Line 1 — available letters in fixed positions + an infinite space key */}
      <section className="line line--available" aria-label="Available letters">
        {slots.map((slot) => {
          const isBooked = bookedLetterIds.has(slot.id)
          return (
            <button
              key={slot.id}
              type="button"
              className={`slot ${isBooked ? 'slot--placeholder' : 'slot--available'}`}
              onClick={() => bookLetter(slot)}
              disabled={isBooked || locked}
              aria-label={isBooked ? `${slot.char} (booked)` : `Book letter ${slot.char}`}
            >
              {slot.char}
            </button>
          )
        })}
        <button
          type="button"
          className="slot slot--space-add"
          onClick={addSpace}
          disabled={locked}
          aria-label="Add a space"
          title="Add a space"
        >
          {SPACE}
        </button>
      </section>

      {/* Line 2 — booked letters and spaces, packed left in tap order */}
      <section className="line line--booked" aria-label="Your anagram">
        {booked.length === 0 ? (
          <span className="line__hint">Tap letters above to build your anagram</span>
        ) : (
          booked.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`slot slot--booked ${t.kind === 'space' ? 'slot--booked-space' : ''}`}
              onClick={() => removeToken(t.key)}
              disabled={locked}
              aria-label={t.kind === 'space' ? 'Remove space' : `Return letter ${t.char}`}
            >
              {t.kind === 'space' ? SPACE : t.char}
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
            {allLettersBooked && (
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
        {allLettersBooked && !isSupabaseConfigured && saveState !== 'saved' && (
          <p className="status status--note">
            Supabase isn’t configured — saving is disabled. See README.
          </p>
        )}
      </div>
    </div>
  )
}
