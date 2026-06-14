import { useState } from 'react'
import LogoSigil from './components/LogoSigil'
import WatermarkSigil from './components/WatermarkSigil'
import LetterGame from './components/LetterGame'

const MIN_LEN = 3
const MAX_LEN = 300

// Manual dev version marker — bump this by hand before each push so you can
// tell at a glance when a new build is live. Scheme: a=alpha, b=beta, v=release.
const VERSION = 'a.3.0'

export default function App() {
  const [name, setName] = useState('')
  const [activeName, setActiveName] = useState(null) // non-null => game screen
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

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
          <LetterGame key={activeName} name={activeName} onReset={reset} />
        )}
      </main>

      <footer className="footer">
        <span>ना · ग · र · म</span>
      </footer>
    </div>
  )
}
