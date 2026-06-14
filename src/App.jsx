import { useState } from 'react'
import LogoSigil from './components/LogoSigil'
import WatermarkSigil from './components/WatermarkSigil'
import LetterGame from './components/LetterGame'

const MIN_LEN = 3
const MAX_LEN = 100

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
          <h1 className="wordmark">Nagram</h1>
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
              maxLength={MAX_LEN}
              placeholder="e.g. Ada Lovelace"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
