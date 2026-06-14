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
const VERSION = 'a.4.0'

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

export default function App() {
  const [name, setName] = useState('')
  const [activeName, setActiveName] = useState(null) // non-null => game screen
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

  function start() {
    const value = input.trimEnd().replace(/^\s+/, '') // keep inner spaces, trim ends
    const len = Array.from(value).length
    if (len < MIN_LEN || len > MAX_LEN) {
      setError(`Please enter between ${MIN_LEN} and ${MAX_LEN} characters.`)
      return
    }
    setError('')
    setName(value)
    setActiveName(value)
  }

  function reset() {
    setActiveName(null)
    setName('')
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

  return (
    <div className="app">
      <div className="watermark" aria-hidden="true">
        <WatermarkSigil size={640} />
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
          <p className="tagline">Unmake a name. Make an anagram.</p>
        </header>

        {activeName === null ? (
          <form className="intro" onSubmit={onSubmit}>
            <label className="intro__label" htmlFor="name-input">
              Enter a name
            </label>
            <input
              id="name-input"
              className="intro__input"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoFocus
              placeholder="e.g. Ada Lovelace"
              value={input}
              onChange={onChange}
            />
            {error && <p className="status status--err">{error}</p>}
            <button type="submit" className="btn btn--primary">
              Start
            </button>
          </form>
        ) : (
          <LetterGame key={activeName} name={activeName} onReset={reset} ensureLogin={ensureLogin} />
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
