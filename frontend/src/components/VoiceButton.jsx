import React, { useState, useRef, useCallback } from 'react'

export default function VoiceButton({ onAudio, disabled }) {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = useCallback(async () => {
    if (disabled || recording) return
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser mic not supported')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // pick the best supported format
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', '']
        .find(t => t === '' || MediaRecorder.isTypeSupported(t)) || ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        if (blob.size > 500) {
          onAudio(blob)
        } else {
          setError('Recording too short, try again')
        }
      }

      recorder.onerror = (e) => {
        setError('Recording failed: ' + e.error?.message)
        stream.getTracks().forEach((t) => t.stop())
        setRecording(false)
        clearInterval(timerRef.current)
      }

      recorder.start(100) // collect chunks every 100ms
      mediaRecorderRef.current = recorder
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Mic permission denied — browser settings check karo')
      } else if (err.name === 'NotFoundError') {
        setError('Koi mic nahi mila device pe')
      } else {
        setError('Mic error: ' + err.message)
      }
    }
  }, [disabled, recording, onAudio])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
      setSeconds(0)
    }
  }, [recording])

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 select-none
          ${recording
            ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
            : 'bg-saffron hover:bg-saffron-light shadow-lg shadow-saffron/30'
          }
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        `}
      >
        {/* pulse rings when recording */}
        {recording && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            <span className="absolute -inset-2 rounded-full border border-red-400/30 animate-ping" style={{animationDuration:'1.5s'}} />
          </>
        )}
        {recording ? (
          <svg className="w-4 h-4 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 15.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93z"/>
          </svg>
        )}
      </button>

      <span className="text-[10px] text-center leading-tight" style={{color: recording ? '#ef4444' : '#6b7280'}}>
        {recording ? `${seconds}s — rok lo` : 'voice'}
      </span>

      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-700 text-red-200 text-xs px-3 py-2 rounded-lg w-64 text-center z-50">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-white">✕</button>
        </div>
      )}
    </div>
  )
}
