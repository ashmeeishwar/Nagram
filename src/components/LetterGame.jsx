import { useMemo, useRef, useState } from 'react'
import { saveAnagram, isSupabaseConfigured } from '../supabaseClient'

const SPACE = '␣'

// Collapse any run of consecutive spaces down to a single space, so removing a
// letter that sat between two spaces can never leave a double space behind.
function collapseSpaces(tokens) {
  const out = []
  for (const t of tokens) {
    if (t.kind === 'space' && out.length && out[out.length - 1].kind === 'space') continue
    out.push(t)
  }
  return out
}

export default function LetterGame({ name, onReset, ensureLogin }) {
  // One fixed slot per *letter* (spaces are handled by the single dedicated
  // space button, not by per-character slots). Positions never reorder.
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
  const [notice, setNotice] = useState('')
  const spaceUid = useRef(0)
  const noticeTimer = useRef(null)

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

  function flash(msg) {
    setNotice(msg)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 3000)
  }

  function bookLetter(slot) {
    if (locked || bookedLetterIds.has(slot.id)) return
    setNotice('')
    setBooked((prev) => [...prev, { kind: 'letter', id: slot.id, char: slot.char, key: `L${slot.id}` }])
  }

  function addSpace() {
    if (locked) return
    const last = booked[booked.length - 1]
    if (!last) {
      flash('Add a letter before adding a space.')
      return
    }
    if (last.kind === 'space') {
      flash('You cannot add multiple spaces in a row.')
      return
    }
    setNotice('')
    setBooked((prev) => [...prev, { kind: 'space', key: `S${spaceUid.current++}` }])
  }

  function removeToken(key) {
    if (locked) return
    setNotice('')
    setBooked((prev) => collapseSpaces(prev.filter((t) => t.key !== key)))
  }

  async function handleSave() {
    // Drop any trailing space before saving and let the user know.
    let tokens = booked
    if (tokens.length && tokens[tokens.length - 1].kind === 'space') {
      while (tokens.length && tokens[tokens.length - 1].kind === 'space') {
        tokens = tokens.slice(0, -1)
      }
      setBooked(tokens)
      flash('Last space removed.')
    }
    const finalAnagram = tokens.map((t) => (t.kind === 'space' ? ' ' : t.char)).join('')

    // Simulated Google sign-in gate (always succeeds in this placeholder).
    const account = await ensureLogin()
    if (!account) return // user cancelled the sign-in

    setSaveState('saving')
    setErrorMsg('')
    try {
      await saveAnagram(name, finalAnagram)
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

      {/* Line 1 — available letters in fixed positions + one infinite space key */}
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

      {notice && <p className="status status--warn">{notice}</p>}

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
