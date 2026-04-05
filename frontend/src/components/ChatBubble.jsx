import React, { useEffect, useRef, useState } from 'react'

export default function ChatBubble({ message }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [urlObj, setUrlObj] = useState(null)

  useEffect(() => {
    if (message.role === 'assistant' && message.audio_base64) {
      const blob = b64ToBlob(message.audio_base64, 'audio/wav')
      const url = URL.createObjectURL(blob)
      setUrlObj(url)
      // auto-play
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play().catch(() => {})
      }
      return () => URL.revokeObjectURL(url)
    }
  }, [message])

  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 items-end gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full sahai-avatar flex items-center justify-center text-xs font-black text-white flex-shrink-0 mb-1">
          S
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'user-bubble text-white rounded-br-sm'
              : 'sahai-bubble text-gray-100 rounded-bl-sm'
          }`}
        >
          <p style={{ lineHeight: '1.6' }}>{message.content}</p>
        </div>

        {message.role === 'assistant' && message.audio_base64 && (
          <div className="audio-pill flex items-center gap-2 px-3 py-1.5 rounded-full">
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (playing) {
                    audioRef.current.pause()
                  } else {
                    audioRef.current.play()
                  }
                }
              }}
              className="text-saffron hover:text-saffron-light transition-colors"
            >
              {playing ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <div className="flex gap-0.5 items-center h-4">
              {[3, 5, 7, 4, 6, 3, 5].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full transition-all ${playing ? 'bg-saffron wave-bar' : 'bg-saffron/40'}`}
                  style={{ height: `${h * (playing ? 1 : 0.6)}px`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">Awaaz</span>
            <audio
              ref={audioRef}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0 mb-1">
          U
        </div>
      )}
    </div>
  )
}

function b64ToBlob(b64, mimeType) {
  const byteChars = atob(b64)
  const byteNums = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i)
  }
  return new Blob([new Uint8Array(byteNums)], { type: mimeType })
}
