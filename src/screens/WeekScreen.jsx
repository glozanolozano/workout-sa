import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PROGRAM, getWeekNumber, getDayOfWeek } from '../data/program'
import TabBar from '../components/TabBar'

export default function WeekScreen() {
  const [weekSessions, setWeekSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [today] = useState(new Date().toISOString().split('T')[0])
  
  const currentWeek = getWeekNumber(today)
  const currentDay = getDayOfWeek(today)
  const weekInfo = PROGRAM.weekProgression[currentWeek]

  useEffect(() => {
    loadWeekSessions()
  }, [])

  async function loadWeekSessions() {
    setLoading(true)
    
    // Calcular fechas de la semana actual
    const startOfProgram = new Date(PROGRAM.startDate + 'T00:00:00')
    const weekStartDate = new Date(startOfProgram)
    weekStartDate.setDate(startOfProgram.getDate() + (currentWeek - 1) * 7)
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartDate)
      d.setDate(weekStartDate.getDate() + i)
      return d.toISOString().split('T')[0]
    })
    
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .in('date', weekDates)
    
    setWeekSessions(data || [])
    setLoading(false)
  }

  function getSessionForDay(dayIdx) {
    const startOfProgram = new Date(PROGRAM.startDate + 'T00:00:00')
    const dayDate = new Date(startOfProgram)
    dayDate.setDate(startOfProgram.getDate() + (currentWeek - 1) * 7 + dayIdx)
    const dateStr = dayDate.toISOString().split('T')[0]
    return weekSessions.find((s) => s.date === dateStr)
  }

  function getDateRange() {
    const startOfProgram = new Date(PROGRAM.startDate + 'T00:00:00')
    const start = new Date(startOfProgram)
    start.setDate(startOfProgram.getDate() + (currentWeek - 1) * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    
    const fmt = (d) => `${d.getDate()} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][d.getMonth()]}`
    return `${fmt(start)} – ${fmt(end)}`
  }

  const ashtangaCount = weekSessions.filter((s) => s.ashtanga_completed).length

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Semana {currentWeek}
          </h1>
          <div className="text-sm text-muted mt-1">
            {getDateRange()} · {weekInfo.label}
          </div>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-1.5 mt-4">
          {Array.from({ length: 7 }, (_, i) => {
            const dayNum = i + 1
            const dayShort = PROGRAM.dayNamesShort[dayNum]
            const dayTemplate = PROGRAM.sessions[dayNum]
            const isToday = dayNum === currentDay
            const isRest = dayTemplate.type === 'rest'
            const session = getSessionForDay(i)
            const isDone = session?.is_completed

            let cellClasses = 'aspect-square border rounded-md p-2 flex flex-col justify-between text-[10px]'
            if (isDone) cellClasses += ' border-sage'
            else if (isToday) cellClasses += ' border-fg'
            else cellClasses += ' border-line'
            if (isRest) cellClasses += ' opacity-50'

            const cellStyle = isDone ? { background: 'rgba(168,184,154,0.1)' } : {}

            return (
              <div key={i} className={cellClasses} style={cellStyle}>
                <div className={isToday ? 'text-fg' : 'text-muted'}>{dayShort}</div>
                <div>
                  <div className="text-[9px] text-muted leading-tight">
                    {dayTemplate.name.split(' ')[0]}
                  </div>
                  {isDone && (
                    <div className="text-sage text-sm mt-0.5">✓</div>
                  )}
                  {isToday && !isDone && (
                    <div className="text-[9px] text-fg mt-0.5">hoy</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail list */}
        <div className="mt-6">
          <div className="text-[11px] tracking-widest uppercase text-muted mb-3">
            Detalle
          </div>
          <div>
            {Array.from({ length: 7 }, (_, i) => {
              const dayNum = i + 1
              const dayTemplate = PROGRAM.sessions[dayNum]
              const session = getSessionForDay(i)
              const isDone = session?.is_completed
              const isSkipped = session?.is_skipped
              
              let duration = null
              if (session?.started_at && session?.completed_at) {
                const start = new Date(session.started_at).getTime()
                const end = new Date(session.completed_at).getTime()
                const sec = Math.floor((end - start) / 1000)
                duration = `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
              }
              
              return (
                <div
                  key={i}
                  className="flex items-center gap-3.5 py-4 border-b border-line"
                >
                  <div
                    className={`w-[22px] h-[22px] rounded flex items-center justify-center flex-shrink-0 ${
                      isDone ? 'bg-sage border-sage' : 'border border-muted'
                    }`}
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      {PROGRAM.dayNames[dayNum]} · {dayTemplate.name}
                    </div>
                    {isSkipped && (
                      <div className="text-[11px] text-rust">Saltado</div>
                    )}
                    {session?.ashtanga_completed && (
                      <div className="text-[11px] text-muted">Ashtanga ✓</div>
                    )}
                  </div>
                  {duration && (
                    <span className="text-[11px] text-muted tabular">{duration}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Ashtanga counter */}
        <div className="mt-4 p-3.5 border border-line rounded-md text-xs text-muted">
          <strong className="text-fg font-medium">Ashtanga semanal:</strong> {ashtangaCount}/7 días
        </div>

        <div className="h-6" />
      </div>

      <TabBar />
    </div>
  )
}
