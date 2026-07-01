import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { PROGRAM, getSessionForDate, getWeekNumber, getDayOfWeek } from '../data/program'
import TabBar from '../components/TabBar'

export default function TodayScreen() {
  const navigate = useNavigate()
  const [today] = useState(new Date().toISOString().split('T')[0])
  const [session, setSession] = useState(null)
  const [ashtangaDone, setAshtangaDone] = useState(false)
  const [loading, setLoading] = useState(true)

  const dayOfWeek = getDayOfWeek(today)
  const weekNumber = getWeekNumber(today)
  const dayTemplate = getSessionForDate(today)
  const weekInfo = PROGRAM.weekProgression[weekNumber]

  useEffect(() => {
    loadOrCreateSession()
  }, [])

  async function loadOrCreateSession() {
    setLoading(true)
    
    // Buscar sesión existente para hoy
    const { data: existing } = await supabase
      .from('sessions')
      .select('*')
      .eq('date', today)
      .maybeSingle()

    if (existing) {
      setSession(existing)
      setAshtangaDone(existing.ashtanga_completed)
    } else {
      // Crear sesión nueva
      const { data: created } = await supabase
        .from('sessions')
        .insert({
          date: today,
          day_of_week: dayOfWeek,
          week_number: weekNumber,
          session_type: dayTemplate.type,
          session_name: dayTemplate.name,
        })
        .select()
        .single()
      
      setSession(created)
    }
    
    setLoading(false)
  }

  async function toggleAshtanga() {
    const newValue = !ashtangaDone
    setAshtangaDone(newValue)
    await supabase
      .from('sessions')
      .update({ ashtanga_completed: newValue })
      .eq('id', session.id)
  }

  function startSession() {
    supabase
      .from('sessions')
      .update({ started_at: new Date().toISOString() })
      .eq('id', session.id)
      .then(() => {
        if (dayTemplate.type === 'zone2') {
          navigate(`/session/${session.id}/zone2`)
        } else {
          navigate(`/session/${session.id}`)
        }
      })
  }

  if (loading || !session) {
    return (
      <div className="h-screen flex items-center justify-center text-muted text-sm">
        Cargando...
      </div>
    )
  }

  const dayLabel = format(new Date(today + 'T00:00:00'), "EEEE · d 'de' MMMM", { locale: es })
  const dayNumber = Math.floor(
    (new Date(today + 'T00:00:00') - new Date(PROGRAM.startDate + 'T00:00:00')) / (1000 * 60 * 60 * 24)
  ) + 1

  const isRestDay = dayTemplate.type === 'rest'

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[11px] tracking-widest uppercase text-muted">
              {dayLabel}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mt-2">
              Día {dayNumber}
            </h1>
            <div className="text-sm text-muted mt-1">
              Semana {weekNumber} de 6 · {weekInfo.label}
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-7 h-7 rounded-full border border-line-strong flex items-center justify-center text-muted no-select"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
            </svg>
          </button>
        </div>

        {/* Ashtanga card */}
        <div className="border border-line rounded-lg p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
              Ashtanga
            </h3>
            <span className="text-xs text-muted">
              {dayTemplate.ashtangaMin} min{isRestDay ? ' · restaurativo' : dayTemplate.ashtangaMin === 25 ? ' · corto' : ' · completo'}
            </span>
          </div>
          <button
            onClick={toggleAshtanga}
            className="flex items-center gap-3.5 py-2 w-full no-select"
          >
            <div
              className={`w-[22px] h-[22px] rounded flex items-center justify-center flex-shrink-0 ${
                ashtangaDone ? 'bg-sage border-sage' : 'border border-muted'
              }`}
            >
              {ashtangaDone && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-[15px]">Práctica completada</span>
          </button>
        </div>

        {/* Main session card */}
        {isRestDay ? (
          <div className="text-center py-16">
            <div className="text-sm text-muted leading-relaxed">
              Hoy es día de descanso.<br /><br />
              Yoga restaurativo suave o nada.<br />
              Sin culpa.
            </div>
          </div>
        ) : (
          <>
            <div className="border border-line-strong rounded-lg p-5">
              <div className="text-[11px] tracking-widest uppercase text-muted">
                Sesión principal
              </div>
              <h2 className="text-xl font-medium tracking-tight mt-2">
                {dayTemplate.name}
              </h2>
              <div className="text-[13px] text-muted mt-1">
                {dayTemplate.subtitle} · {dayTemplate.durationMin} min
              </div>

              <div className="mt-5 pt-5 border-t border-line flex flex-col gap-2.5">
                {dayTemplate.blocks.map((block, i) => (
                  <div key={i} className="text-[13px] text-muted">
                    {block.isStar && <span className="text-fg">★</span>}{block.isStar && '  '}
                    {block.exercises.map((ex, j) => (
                      <span key={j}>
                        {j > 0 && ' · '}
                        {ex.name}
                        {ex.sets && ` · ${ex.sets}×${ex.targetReps || ex.targetHoldSeconds + 's'}`}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={startSession}
                className="block w-full py-4 bg-fg text-bg rounded-lg text-[15px] font-medium tracking-wide no-select"
              >
                {session.started_at ? 'Continuar sesión' : 'Iniciar sesión'}
              </button>
            </div>
          </>
        )}

        <div className="h-6" />
      </div>

      <TabBar />
    </div>
  )
}
