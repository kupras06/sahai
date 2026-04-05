import React, { useState } from 'react'

const NUDGES = {
  ramesh: 'Ramesh bhai, aaj chaar so rupaye se zyada mat kharchna. Mahine ke paanch din bache hain.',
  priya:  'Priya didi, aaj do so rupaye side mein rakh do. Bachat zaroori hai!',
  suresh: 'Suresh bhai, aaj business ka hisaab check karo. SAHAI yaad dila raha hai.',
}

export default function NudgePanel({ persona }) {
  const [status, setStatus] = useState(null) // null | sending | sent | error
  const [detail, setDetail] = useState(null)

  const send = async () => {
    setStatus('sending')
    setDetail(null)
    try {
      const r = await fetch(`/api/nudge/${persona}`)
      const d = await r.json()
      if (d.status === 'sent') {
        setStatus('sent')
      } else if (d.status === 'error') {
        setStatus('error')
        setDetail({ reason: d.reason })
      } else {
        setStatus('preview')
        setDetail({ reason: d.reason || 'TEST_RECIPIENT set nahi hai' })
      }
    } catch {
      setStatus('error')
      setDetail({ reason: 'Network error — backend se connect nahi hua' })
    }
  }

  return (
    <div className="nudge-panel p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>WhatsApp Nudge</p>
        <button
          onClick={send}
          disabled={status === 'sending'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white disabled:opacity-50 cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', fontSize: 12, fontWeight: 600 }}
        >
          <span>📤</span>
          {status === 'sending' ? 'Bhej raha...' : 'Bhejo'}
        </button>
      </div>

      {/* WA preview */}
      <div className="wa-preview p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ fontSize: 14 }}>🟢</span>
          <span style={{ fontSize: 11, color: '#25D366', fontWeight: 600 }}>WhatsApp Preview</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
          {NUDGES[persona]}
        </p>
      </div>

      {/* Status messages */}
      <div className="mt-2.5 space-y-1">
        {status === 'sent' && (
          <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: '8px 12px' }}>
            <p style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>✓ WhatsApp pe bhej diya!</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{NUDGES[persona]}</p>
          </div>
        )}
        {status === 'preview' && (
          <p style={{ fontSize: 11, color: '#fbbf24' }}>
            ⚠ {detail?.reason}
          </p>
        )}
        {status === 'error' && (
          <div style={{ fontSize: 11 }}>
            <p style={{ color: '#f87171' }}>✗ Error: {detail?.reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}
