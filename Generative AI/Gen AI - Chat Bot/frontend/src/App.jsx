import { useEffect, useRef, useState } from 'react'
import MessageContent from './components/MessageContent.jsx'
import './App.css'

const starters = [
  { icon: '✳', text: 'Help me brainstorm a fun weekend project' },
  { icon: '⌁', text: 'Explain something tricky in simple words' },
  { icon: '↗', text: 'Write a kind, thoughtful message for me' },
]

function App() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const messagesRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const panel = messagesRef.current
    if (panel) panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  async function sendMessage(text = draft) {
    const content = text.trim()
    if (!content || busy) return
    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setDraft('')
    setError('')
    setBusy(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not reach the assistant.')
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again in a moment.')
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  function resetChat() {
    setMessages([])
    setError('')
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); resetChat() }} aria-label="Mellow home">
          <span className="brand-mark">✳</span><span>mellow</span>
        </a>
        <div className="topbar-note"><span className="online-dot" /> your little corner of the internet</div>
        <button className="new-chat" onClick={resetChat}><span>＋</span> New chat</button>
      </header>

      <section className={`chat-area ${messages.length ? 'has-messages' : ''}`}>
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="sun-doodle" aria-hidden="true"><span>✺</span><i>✦</i><b>✧</b></div>
            <div className="eyebrow"><span>✳</span> a little help, a lot of heart</div>
            <h1>Good things start<br />with a <em>“what if?”</em></h1>
            <p className="welcome-copy">A curious mind is a lovely thing. What’s on yours today?</p>
            <div className="suggestions" aria-label="Try asking">
              {starters.map((item) => (
                <button key={item.text} className="suggestion" onClick={() => sendMessage(item.text)}>
                  <span className="suggestion-icon">{item.icon}</span><span>{item.text}</span><span className="suggestion-arrow">↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages" ref={messagesRef} aria-live="polite">
            {messages.map((message, index) => (
              <article key={`${index}-${message.role}`} className={`message ${message.role}`}>
                {message.role === 'assistant' && <span className="assistant-mark">✳</span>}
                <div className="message-bubble">
                  {message.role === 'assistant' ? <MessageContent content={message.content} /> : message.content}
                </div>
              </article>
            ))}
            {busy && <article className="message assistant"><span className="assistant-mark">✳</span><div className="message-bubble typing"><i /><i /><i /></div></article>}
          </div>
        )}

        <div className="composer-wrap">
          {error && <div className="error-note" role="alert">{error}</div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }}
              placeholder="Ask me anything..."
              aria-label="Your message"
              rows={1}
              disabled={busy}
            />
            <div className="composer-footer"><span>Curiosity looks good on you <span className="tiny-sparkle">✦</span></span>
              <button className="send-button" type="submit" disabled={!draft.trim() || busy} aria-label="Send message">↗</button>
            </div>
          </form>
          <p className="disclaimer">A friendly AI sidekick. Double-check the important stuff, just in case.</p>
        </div>
      </section>

      <footer className="page-footer"><span>made for curious little humans <span>♡</span></span><span>take a breath. you’re doing great.</span></footer>
    </main>
  )
}

export default App
