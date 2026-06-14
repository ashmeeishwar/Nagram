import { useEffect, useRef, useState } from 'react'
import LogoSigil from './components/LogoSigil'
import WatermarkSigil from './components/WatermarkSigil'
import LetterGame from './components/LetterGame'
import ThemeToggle from './components/ThemeToggle'
import GoogleLoginModal from './components/GoogleLoginModal'
import SavedList from './components/SavedList'

const MIN_LEN = 3
const MAX_LEN = 300

// Manual dev version marker — bump this by hand before each push so you can
// tell at a glance when a new build is live. Scheme: a=alpha, b=beta, v=release.
const VERSION = 'a.5.0'

const THEME_KEY = 'nagram-theme'
const USER_KEY = 'nagram-user'

function initialTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function initialUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

// Reduce any text to a series of unique letters/digits — no duplicates (case
// insensitive), no spaces or punctuation. The raw material for a sigil.
function toUniqueLetters(text) {
  const seen = new Set()
  const out = []
  for (const ch of Array.from(text)) {
    if (!/[\p{L}\p{N}]/u.test(ch)) continue
    const key = ch.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(ch)
  }
  return out.join('')
}

export default function App() {
  const [mode, setMode] = useState('anagram') // anagram | unique
  const [game, setGame] = useState(null) // { letters, text, label } | null
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const [theme, setTheme] = useState(initialTheme)
  const [savedOpen, setSavedOpen] = useState(false)

  // Placeholder Google auth (always succeeds). Stored locally for the session.
  const [user, setUser] = useState(initialUser)
  const [loginOpen, setLoginOpen] = useState(false)
  const loginResolver = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  function ensureLogin() {
    if (user) return Promise.resolve(user)
    return new Promise((resolve) => {
      loginResolver.current = resolve
      setLoginOpen(true)
    })
  }

  function completeLogin() {
    // Simulated Google account — replace with real OAuth later.
    const fake = { name: 'Nagram User', email: 'demo@nagram.app' }
    setUser(fake)
    localStorage.setItem(USER_KEY, JSON.stringify(fake))
    setLoginOpen(false)
    loginResolver.current?.(fake)
    loginResolver.current = null
  }

  function cancelLogin() {
    setLoginOpen(false)
    loginResolver.current?.(null)
    loginResolver.current = null
  }

  function signOut() {
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }

  function switchMode(next) {
    if (next === mode) return
    setMode(next)
    setError('')
  }

  function start() {
    const value = input.trim()
    if (mode === 'unique') {
      const letters = toUniqueLetters(value)
      if (Array.from(letters).length < 2) {
        setError('Enter a will statement with at least 2 distinct letters.')
        return
      }
      setError('')
      setGame({ letters, text: value, label: 'Will statement' })
      return
    }
    const len = Array.from(value).length
    if (len < MIN_LEN || len > MAX_LEN) {
      setError(`Please enter between ${MIN_LEN} and ${MAX_LEN} characters.`)
      return
    }
    setError('')
    setGame({ letters: value, text: value, label: 'Name' })
  }

  function reset() {
    setGame(null)
    setInput('')
    setError('')
  }

  function onChange(e) {
    const value = e.target.value
    // Clamp to MAX_LEN at type/paste time and warn when input is truncated.
    if (Array.from(value).length > MAX_LEN) {
      setInput(Array.from(value).slice(0, MAX_LEN).join(''))
      setError(`Maximum name length is ${MAX_LEN} characters.`)
    } else {
      setInput(value)
      setError('')
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    start()
  }

  const isUnique = mode === 'unique'

  return (
    <div className="app">
      <div className="watermark" aria-hidden="true">
        <WatermarkSigil />
      </div>

      <div className="topbar">
        <button type="button" className="icon-btn" onClick={() => setSavedOpen(true)}>
          Saved
        </button>
        <div className="topbar__right">
          {user && (
            <span className="account" title={user.email}>
              <span className="account__avatar">{user.name.charAt(0)}</span>
              <button type="button" className="account__signout" onClick={signOut}>
                Sign out
              </button>
            </span>
          )}
          <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
        </div>
      </div>

      <main className="column">
        <header className="masthead">
          <LogoSigil size={150} />
          <h1 className="wordmark">
            Nagram
            <sup className="version">{VERSION}</sup>
          </h1>
          <p className="tagline">Unmake a name. Make a Nagram.</p>
        </header>

        {game === null ? (
          <div className="intro-wrap">
            <div className="modeswitch" role="tablist" aria-label="Mode">
              <button
                type="button"
                role="tab"
                aria-selected={!isUnique}
                className={`modeswitch__btn ${!isUnique ? 'is-active' : ''}`}
                onClick={() => switchMode('anagram')}
              >
                Anagram
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isUnique}
                className={`modeswitch__btn ${isUnique ? 'is-active' : ''}`}
                onClick={() => switchMode('unique')}
              >
                Unique letters
              </button>
            </div>

            <form className="intro" onSubmit={onSubmit}>
              <label className="intro__label" htmlFor="name-input">
                {isUnique ? 'Will statement' : 'Enter a name'}
              </label>
              <input
                id="name-input"
                className="intro__input"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoFocus
                placeholder={isUnique ? 'e.g. I am calm and focused' : 'e.g. Ada Lovelace'}
                value={input}
                onChange={onChange}
              />
              {error && <p className="status status--err">{error}</p>}
              <button type="submit" className="btn btn--primary">
                {isUnique ? 'Reduce to letters' : 'Start'}
              </button>
            </form>
          </div>
        ) : (
          <LetterGame
            key={game.letters}
            name={game.letters}
            sourceText={game.text}
            sourceLabel={game.label}
            onReset={reset}
            ensureLogin={ensureLogin}
          />
        )}
      </main>

      <footer className="footer">
        <span>ना · ग · र · म</span>
      </footer>

      <GoogleLoginModal open={loginOpen} onContinue={completeLogin} onCancel={cancelLogin} />
      <SavedList open={savedOpen} onClose={() => setSavedOpen(false)} />
    </div>
  )
}
