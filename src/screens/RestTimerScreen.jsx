import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RestTimerScreen() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const location = useLocation()
  
  const [timer, setTimer] = useState(null)
  const [remainingSec, setRemainingSec] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveTimer()
  }, [])

  // Timer basado en timestamp - sobrevive cierres de app
  useEffect(() => {
    if (!timer) return

    const startedAt = new Date(timer.started_at).getTime()
    const durationMs = timer.duration_seconds * 1000

    const tick = () => {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000))
      setRemainingSec(remaining)
      
      // Auto-return when timer completes
      if (remaining === 0) {
        finishTimer()
      }
    }

    tick()
    const id = setInterval(tick, 250) // 4x per second for smooth display
    return () => clearInterval(id)
  }, [timer])

  async function loadActiveTimer() {
    setLoading(true)
    
    // Buscar timer activo para esta sesión
    const timerId = location.state?.timerId
    
    let query = supabase
      .from('active_timers')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .eq('timer_type', 'rest')
      .order('started_at', { ascending: false })
      .limit(1)
    
    if (timerId) {
      query = supabase
        .from('active_timers')
        .select('*')
        .eq('id', timerId)
    }
    
    const { data } = await query
    
    if (!data || data.length === 0) {
      navigate(`/session/${sessionId}`)
      return
    }
    
    setTimer(data[0])
    setLoading(false)
  }

  async function finishTimer() {
    if (!timer) return
    
    await supabase
      .from('active_timers')
      .update({ is_active: false })
      .eq('id', timer.id)
    
    navigate(`/session/${sessionId}`)
  }

  async function addTime(seconds) {
    if (!timer) return
    
    const newDuration = timer.duration_seconds + seconds
    
    await supabase
      .from('active_timers')
      .update({ duration_seconds: newDuration })
      .eq('id', timer.id)
    
    setTimer({ ...timer, duration_seconds: newDuration })
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading || !timer) {
    return (
      <div className="h-screen flex items-center justify-center text-muted text-sm">
        Cargando...
      </div>
    )
  }

  const progressPct = timer.duration_seconds > 0
    ? ((timer.duration_seconds - remainingSec) / timer.duration_seconds) * 100
    : 0

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg px-8 safe-top safe-bottom">
      <div className="text-[11px] tracking-widest uppercase text-muted">
        Descanso
      </div>
      
      <div
        className="text-[96px] font-extralight tracking-tighter my-6 leading-none tabular"
        style={{ letterSpacing: '-0.05em' }}
      >
        {formatTime(remainingSec)}
      </div>
      
      {timer.label && (
        <div className="text-sm text-muted mb-16">
          {timer.label}
        </div>
      )}
      
      {/* Progress bar */}
      <div className="w-full h-0.5 bg-line rounded-full mb-12 overflow-hidden">
        <div
          className="h-full bg-fg transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      
      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={() => addTime(15)}
          className="flex-1 py-4 bg-transparent border border-line-strong text-fg rounded-lg text-[15px] font-medium tracking-wide no-select"
        >
          + 15s
        </button>
        <button
          onClick={finishTimer}
          className="flex-1 py-4 bg-fg text-bg rounded-lg text-[15px] font-medium tracking-wide no-select"
        >
          Skip
        </button>
      </div>
      
      <div className="mt-8 text-[11px] text-muted text-center">
        El timer sigue corriendo aunque cierres la app
      </div>
    </div>
  )
}
