import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const PROTOCOL = {
  intervals: 4,
  workSeconds: 180,
  restSeconds: 120,
}

export default function CardioScreen() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  
  const [timer, setTimer] = useState(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrCreateTimer()
  }, [])

  // Timer basado en timestamp - sobrevive cierres
  useEffect(() => {
    if (!timer) return
    const startedAt = new Date(timer.started_at).getTime()
    const tick = () => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000))
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
      .eq('timer_type', 'vo2max')
      .eq('is_active', true)
      .maybeSingle()
    
    if (existing) {
      setTimer(existing)
    } else {
      const { data: created } = await supabase
        .from('active_timers')
        .insert({
          session_id: sessionId,
          timer_type: 'vo2max',
          duration_seconds: (PROTOCOL.workSeconds + PROTOCOL.restSeconds) * PROTOCOL.intervals,
          label: 'VO2max 4x3',
        })
        .select()
        .single()
      
      setTimer(created)
    }
    
    setLoading(false)
  }

  async function stopTimer() {
    if (!timer) return
    await supabase
      .from('active_timers')
      .update({ is_active: false })
      .eq('id', timer.id)
    navigate(`/session/${sessionId}/notes`)
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Calcular en qué intervalo estamos y si es trabajo o descanso
  function getCurrentPhase() {
    const cycleSeconds = PROTOCOL.workSeconds + PROTOCOL.restSeconds
    const intervalIdx = Math.floor(elapsedSec / cycleSeconds)
    const secInCycle = elapsedSec % cycleSeconds
    
    if (intervalIdx >= PROTOCOL.intervals) {
      return { phase: 'done', intervalNum: PROTOCOL.intervals, timeInPhase: 0, remainingInPhase: 0 }
    }
    
    const isWork = secInCycle < PROTOCOL.workSeconds
    const timeInPhase = isWork ? secInCycle : secInCycle - PROTOCOL.workSeconds
    const phaseDuration = isWork ? PROTOCOL.workSeconds : PROTOCOL.restSeconds
    const remainingInPhase = phaseDuration - timeInPhase
    
    return {
      phase: isWork ? 'work' : 'rest',
      intervalNum: intervalIdx + 1,
      timeInPhase,
      remainingInPhase,
    }
  }

  if (loading || !timer) {
    return (
      <div className="h-screen flex items-center justify-center text-muted text-sm">
        Cargando...
      </div>
    )
  }

  const current = getCurrentPhase()
  const isDone = current.phase === 'done'

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[11px] tracking-widest uppercase text-muted">
              Cardio
            </div>
            <h2 className="text-xl font-medium tracking-tight mt-1">
              VO2max 4×3
            </h2>
          </div>
          <div className="text-[11px] text-muted">
            Total · {formatTime(elapsedSec)}
          </div>
        </div>

        {isDone ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-[11px] tracking-widest uppercase text-sage mb-4">
              Completado
            </div>
            <div className="text-5xl font-light tracking-tight mb-2">
              {formatTime(elapsedSec)}
            </div>
            <div className="text-sm text-muted mb-16">
              4 intervalos completados
            </div>
            <button
              onClick={stopTimer}
              className="w-full py-4 bg-fg text-bg rounded-lg text-[15px] font-medium tracking-wide no-select"
            >
              Finalizar
            </button>
          </div>
        ) : (
          <>
            {/* Big timer display */}
            <div className="text-center py-8">
              <div className="text-sm text-muted tracking-widest uppercase">
                Intervalo {current.intervalNum} de {PROTOCOL.intervals}
              </div>
              <div
                className={`mt-3 text-base tracking-widest uppercase font-medium ${
                  current.phase === 'work' ? 'text-sage' : 'text-amber'
                }`}
              >
                {current.phase === 'work' ? 'Trabajo' : 'Recuperación'}
              </div>
              <div
                className="text-[96px] font-extralight tracking-tighter mt-6 leading-none tabular"
                style={{ letterSpacing: '-0.05em' }}
              >
                {formatTime(current.remainingInPhase)}
              </div>
              <div className="text-[13px] text-muted mt-4">
                {current.phase === 'work' ? '85-95% FC máx' : 'Recuperación activa'}
              </div>
            </div>

            {/* Interval progress dots */}
            <div className="my-4">
              <div className="flex gap-2">
                {Array.from({ length: PROTOCOL.intervals }, (_, i) => {
                  const isDoneInterval = i + 1 < current.intervalNum
                  const isCurrentInterval = i + 1 === current.intervalNum
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${
                        isDoneInterval
                          ? 'bg-sage'
                          : isCurrentInterval
                          ? 'bg-sage opacity-50'
                          : 'bg-line'
                      }`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted">
                {Array.from({ length: PROTOCOL.intervals }, (_, i) => {
                  const num = i + 1
                  const isDoneInterval = num < current.intervalNum
                  const isCurrentInterval = num === current.intervalNum
                  return (
                    <span key={i}>
                      {num}{isDoneInterval ? ' ✓' : isCurrentInterval ? ' ▸' : ''}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="h-px bg-line my-6" />

            <div className="text-[13px] text-muted text-center leading-relaxed">
              {current.phase === 'work' ? (
                <>
                  Después de este intervalo:<br />
                  <strong className="text-fg font-medium">
                    {formatTime(PROTOCOL.restSeconds)} recuperación activa
                  </strong>
                </>
              ) : (
                <>
                  Siguiente:<br />
                  <strong className="text-fg font-medium">
                    Intervalo {current.intervalNum + 1} · {formatTime(PROTOCOL.workSeconds)} trabajo
                  </strong>
                </>
              )}
            </div>

            {/* Stop button */}
            <div className="mt-auto pt-6">
              <button
                onClick={stopTimer}
                className="w-full py-4 bg-rust text-bg rounded-lg text-[15px] font-medium tracking-wide no-select"
              >
                Detener
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
