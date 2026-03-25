import { useState } from 'react'
import './App.css'
import CoinDivination from './components/CoinDivination'

function App() {
  const [question, setQuestion] = useState('')

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">🔮 易经占卜</h1>
        <p className="app-subtitle">心诚则灵 · 三枚铜钱起卦</p>
        <p className="app-slogan">不诚不占 · 不义不占 · 不疑不占</p>
      </header>

      {/* 心中所问 */}
      <section className="question-section">
        <label className="question-label" htmlFor="question-input">
          心中所问
        </label>
        <textarea
          id="question-input"
          className="question-input"
          rows={2}
          placeholder="静心凝神，写下你想问的事情……"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </section>

      <CoinDivination question={question} />

      <footer className="app-footer">
        <a
          href="https://github.com/Wozhizxy/iching-simulator"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        {' · '}
        <span>MIT License</span>
      </footer>
    </main>
  )
}

export default App
