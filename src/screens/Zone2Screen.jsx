import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TOTAL_SECONDS = 2700 // 45 min

export default function Zone2Screen() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  
  const [timer, setTimer] = useState(null)
  const [remainingSec, setRemainingSec] = useState(TOTAL_SECONDS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrCreateTimer()
  }, [])

  useEffect(() => {
    if (!timer) return
    const startedAt = new Date(timer.started_at).getTime()
    const durationMs = TOTAL_SECONDS * 1000
    
    const tick = () => {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000))
      setRemainingSec(remaining)
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [timer])

  async function loadOrCreateTimer() {
    setLoading(true)
    
    const { data: existing } = await supabase
      .from('active_timers')
      .select('*')
      .eq('session_id', sessionId)
      .eq('timer_type', 'zone2')
      .eq('is_active', true)
      .maybeSingle()
    
    if (existing) {
      setTimer(existing)
    } else {
      const { data: created } = await supabase
        .from('active_timers')
        .insert({
          session_id: sessionId,
          timer_type: 'zone2',
          duration_seconds: TOTAL_SECONDS,
          label: 'Zona 2 Peloton',
        })
        .select()
        .single()
      
      setTimer(created)
    }
    
    setLoading(false)
  }

  async function finish() {
    if (!timer) return
    await supabase
      .from('active_timers')
      .update({ is_active: false })
      .eq('id', timer.id)
    
    await supabase
      .from('sessions')
      .update({
        completed_at: new Date().toISOString(),
        is_completed: true,
      })
      .eq('id', sessionId)
    
    navigate(`/session/${sessionId}/notes`)
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

  const progressPct = ((TOTAL_SECONDS - remainingSec) / TOTAL_SECONDS) * 100
  const totalMin = Math.floor(TOTAL_SECONDS / 60)

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-6 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="text-[11px] tracking-widest uppercase text-muted">
            Sábado · Cardio
          </div>
          <h2 className="text-xl font-medium tracking-tight mt-1">
            Zona 2 Peloton
          </h2>
        </div>

        {/* Big timer */}
        <div className="text-center py-12">
          <div className="text-[11px] tracking-widest uppercase text-muted">
            Restante
          </div>
          <div
            className="text-[96px] font-extralight tracking-tighter mt-4 leading-none tabular"
            style={{ letterSpacing: '-0.05em' }}
          >
            {formatTime(remainingSec)}
          </div>
          <div className="text-[13px] text-muted mt-4">
            de {totalMin}:00
          </div>
        </div>

        {/* Progress bar */}
        <div className="my-4 mb-8">
          <div className="w-full h-1 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-sage transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Target HR card */}
        <div className="border border-line rounded-lg p-5">
          <div className="text-[11px] tracking-widest uppercase text-muted mb-3">
            Zona objetivo
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-5xl font-light tracking-tight tabular">130</span>
            <span className="text-muted">—</span>
            <span className="text-5xl font-light tracking-tight tabular">145</span>
          </div>
          <div className="text-xs text-muted mt-2 text-center">
            PPM · 60-70% FC máx
          </div>
        </div>

        <div className="mt-8 text-[13px] text-muted leading-relaxed text-center">
          Conversación posible pero demandante.<br />
          Cadencia constante.
        </div>

        {/* Finish button */}
        <div className="mt-auto pt-6">
          <button
            onClick={finish}
            className="w-full py-4 bg-fg text-bg rounded-lg text-[15px] font-medium tracking-wide no-select"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  )
}
