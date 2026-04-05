import React, { useState, useRef, useEffect } from 'react'
import ChatBubble from './components/ChatBubble.jsx'
import VoiceButton from './components/VoiceButton.jsx'
import NudgePanel from './components/NudgePanel.jsx'

const PERSONAS = {
  ramesh: {
    name: 'Ramesh Kumar',
    tag: 'Auto Driver',
    location: 'Delhi',
    income: '₹18,000',
    balance: '4,750',
    balanceTrend: '-12%',
    cardClass: 'persona-ramesh',
    spending: [
      { label: 'Fuel', amount: '4,200', icon: '⛽', pct: 34 },
      { label: 'Khana', amount: '3,100', icon: '🍱', pct: 25 },
      { label: 'EMI', amount: '3,200', icon: '🏦', pct: 26 },
      { label: 'Misc', amount: '1,800', icon: '📦', pct: 15 },
    ],
    loan: 'Vehicle EMI · ₹3,200/mo',
    savingsGoal: 'Bachon ki padhai',
    greeting: 'Kya haal hai, Ramesh bhai?',
    initMsg: 'Namaste Ramesh bhai! Main SAHAI hoon — aapka apna financial dost. Aaj kya help chahiye?',
  },
  priya: {
    name: 'Priya Devi',
    tag: 'ASHA Worker',
    location: 'Uttar Pradesh',
    income: '₹12,000',
    balance: '2,300',
    balanceTrend: '+5%',
    cardClass: 'persona-priya',
    spending: [
      { label: 'Grocery', amount: '3,500', icon: '🛒', pct: 56 },
      { label: 'Transport', amount: '800', icon: '🚌', pct: 13 },
      { label: 'Health', amount: '600', icon: '💊', pct: 10 },
      { label: 'Misc', amount: '1,200', icon: '📦', pct: 21 },
    ],
    loan: null,
    savingsGoal: 'Ghar repair',
    greeting: 'Pranam Priya didi!',
    initMsg: 'Pranam Priya didi! Main SAHAI hoon. Aaj aapki kya madad kar sakta hoon?',
  },
  suresh: {
    name: 'Suresh Yadav',
    tag: 'Kirana Shop Owner',
    location: 'Jaipur',
    income: '₹35,000',
    balance: '12,400',
    balanceTrend: '+8%',
    cardClass: 'persona-suresh',
    spending: [
      { label: 'Stock', amount: '18,000', icon: '📦', pct: 62 },
      { label: 'Rent', amount: '5,000', icon: '🏪', pct: 17 },
      { label: 'Staff', amount: '4,000', icon: '👷', pct: 14 },
      { label: 'Misc', amount: '2,500', icon: '🔧', pct: 7 },
    ],
    loan: 'Business loan · ₹2,00,000 due',
    savingsGoal: 'Dukan expansion',
    greeting: 'Kem cho Suresh bhai!',
    initMsg: 'Kem cho Suresh bhai! Main SAHAI hoon. Business ya savings — kya poochna hai?',
  },
}

export default function App() {
  const [personaKey, setPersonaKey] = useState('ramesh')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const persona = PERSONAS[personaKey]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setMessages([{ role: 'assistant', content: persona.initMsg, audio_base64: null }])
    setShowNudge(false)
    setShowStats(false)
  }, [personaKey])

  const sendMessage = async (text, audioBlob = null) => {
    if (!text && !audioBlob) return
    setLoading(true)

    const userMsg = { role: 'user', content: text || '🎤 Awaaz bheja...', audio_base64: null }
    setMessages(prev => [...prev, userMsg])

    try {
      const fd = new FormData()
      fd.append('persona', personaKey)
      if (audioBlob) {
        fd.append('audio', audioBlob, 'recording.webm')
      } else {
        fd.append('message', text)
      }

      const res = await fetch('/api/chat', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Maafi karo, kuch gadbad ho gayi: ${data.error}`,
          audio_base64: null,
        }])
      } else {
        if (audioBlob && data.user_text) {
          setMessages(prev => {
            const u = [...prev]
            u[u.length - 1] = { role: 'user', content: data.user_text }
            return u
          })
        }
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response_text,
          audio_base64: data.audio_base64 || null,
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Network error — backend chal raha hai na? (localhost:8000)',
        audio_base64: null,
      }])
    } finally {
      setLoading(false)
      setInputText('')
      inputRef.current?.focus()
    }
  }

  const handleSend = () => inputText.trim() && sendMessage(inputText.trim())
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const totalSpend = persona.spending.reduce((s, x) => s + parseInt(x.amount.replace(',', '')), 0)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }} className="flex justify-center">
      <div className="mesh-bg" />

      {/* Phone frame */}
      <div className="w-full max-w-[390px] min-h-screen flex flex-col relative z-10">

        {/* ── Status bar ── */}
        <div className="flex-shrink-0 px-5 pt-3 pb-1 flex items-center justify-between">
          <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            SAHAI
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>Live</span>
          </div>
        </div>

        {/* ── Persona Card ── */}
        <div className="flex-shrink-0 px-4 pb-3">
          {/* header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="sahai-avatar w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 14, color: '#fff' }}>S</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                  SAHAI
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>Aapka Financial Dost</p>
              </div>
            </div>
            <select
              value={personaKey}
              onChange={e => setPersonaKey(e.target.value)}
              className="persona-select text-xs rounded-xl px-3 py-2"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <option value="ramesh">Ramesh</option>
              <option value="priya">Priya</option>
              <option value="suresh">Suresh</option>
            </select>
          </div>

          {/* main persona card */}
          <div className={`${persona.cardClass} rounded-2xl p-4 relative overflow-hidden`}
               style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {/* subtle top-right glow */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20"
                 style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)' }} />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
                  {persona.name}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                  {persona.tag} · {persona.location}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>
                  Income: {persona.income}/mo
                </p>
                {persona.loan && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                       style={{ background: 'rgba(0,0,0,0.25)', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                    ⚠️ {persona.loan}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</p>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff' }}>
                  ₹{persona.balance}
                </p>
                <p style={{ fontSize: 10, color: persona.balanceTrend.startsWith('+') ? '#4ade80' : '#f87171' }}>
                  {persona.balanceTrend} this month
                </p>
              </div>
            </div>

            {/* spending stats toggle */}
            <button
              onClick={() => setShowStats(v => !v)}
              className="mt-3 w-full flex items-center justify-between relative z-10"
              style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '6px 10px' }}
            >
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                Is mahine kharcha: ₹{totalSpend.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{showStats ? '▲' : '▼'}</span>
            </button>

            {showStats && (
              <div className="grid grid-cols-4 gap-2 mt-2 relative z-10">
                {persona.spending.map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-0.5"
                       style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '8px 4px' }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>₹{s.amount}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                    {/* mini bar */}
                    <div style={{ width: '80%', height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.1)', marginTop: 2 }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: 99, background: 'rgba(255,255,255,0.5)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nudge row */}
          <button
            onClick={() => setShowNudge(v => !v)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors"
            style={{ background: showNudge ? 'rgba(255,107,0,0.1)' : 'transparent',
                     border: '1px solid rgba(255,107,0,0.15)', fontSize: 12,
                     color: 'rgba(255,107,0,0.8)' }}
          >
            <span>📱</span>
            <span>{showNudge ? 'Nudge panel band karo' : 'WhatsApp Nudge bhejo'}</span>
          </button>
          {showNudge && <NudgePanel persona={personaKey} />}
        </div>

        {/* ── divider ── */}
        <div style={{ height: 1, background: 'var(--border)', flexShrink: 0, marginBottom: 4 }} />

        {/* ── Chat area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
          {messages.map((msg, i) => (
            <div key={i} className="msg-enter">
              <ChatBubble message={msg} />
            </div>
          ))}

          {/* typing indicator */}
          {loading && (
            <div className="flex items-end gap-2 mb-4 msg-enter">
              <div className="sahai-avatar w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 11, color: '#fff' }}>S</span>
              </div>
              <div className="sahai-bubble rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center" style={{ height: 16 }}>
                  {[0, 150, 300].map((d, i) => (
                    <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--saffron)', animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 px-4 py-3 pb-6"
             style={{ background: 'rgba(8,8,12,0.9)', backdropFilter: 'blur(16px)',
                      borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`${persona.greeting} Kuch pucho...`}
              disabled={loading}
              className="chat-input flex-1 rounded-2xl px-4 py-3 text-sm disabled:opacity-50"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || loading}
              className="send-btn w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            <VoiceButton onAudio={blob => sendMessage(null, blob)} disabled={loading} />
          </div>
          <p className="text-center mt-2" style={{ fontSize: 10, color: 'var(--muted)' }}>
            Hinglish mein type karo ya mic se bolo
          </p>
        </div>
      </div>
    </div>
  )
}
