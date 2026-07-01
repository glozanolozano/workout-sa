import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PROGRAM, getSessionForDate } from '../data/program'

export default function SessionScreen() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  
  const [session, setSession] = useState(null)
  const [dayTemplate, setDayTemplate] = useState(null)
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [elapsedSec, setElapsedSec] = useState(0)
  
  // Estado del set actual siendo editado
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0)
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [inputReps, setInputReps] = useState('')
  const [inputWeight, setInputWeight] = useState('')

  useEffect(() => {
    loadSession()
  }, [sessionId])

  // Timer total de la sesión (basado en timestamp, sobrevive cierres)
  useEffect(() => {
    if (!session?.started_at) return
    const startedAt = new Date(session.started_at).getTime()
    const tick = () => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [session?.started_at])

  async function loadSession() {
    setLoading(true)
    
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    
    if (!sessionData) {
      navigate('/')
      return
    }
    
    setSession(sessionData)
    setDayTemplate(getSessionForDate(sessionData.date))

    const { data: setsData } = await supabase
      .from('sets_completed')
      .select('*')
      .eq('session_id', sessionId)
      .order('completed_at', { ascending: true })
    
    setSets(setsData || [])
    setLoading(false)
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Obtener sets ya registrados para un ejercicio
  function getSetsForExercise(blockId, exerciseName) {
    return sets.filter(
      (s) => s.block === blockId && s.exercise_name === exerciseName
    )
  }

  async function completeSet(block, exercise, roundNum) {
    const repsValue = inputReps === '' ? null : parseInt(inputReps)
    const weightValue = inputWeight === '' ? 0 : parseFloat(inputWeight)

    // Verificar si es récord personal
    const { data: history } = await supabase
      .from('sets_completed')
      .select('actual_reps, actual_weight_lb')
      .eq('exercise_name', exercise.name)
      .order('actual_reps', { ascending: false })
      .limit(1)
    
    const prevBest = history?.[0]?.actual_reps || 0
    const isPR = repsValue !== null && repsValue > prevBest && prevBest > 0

    const { data: newSet } = await supabase
      .from('sets_completed')
      .insert({
        session_id: sessionId,
        exercise_name: exercise.name,
        block: block.id,
        round_number: roundNum,
        target_reps: exercise.targetReps,
        actual_reps: repsValue,
        target_weight_lb: exercise.targetWeightLb || 0,
        actual_weight_lb: weightValue,
        target_hold_seconds: exercise.targetHoldSeconds,
        is_personal_record: isPR,
      })
      .select()
      .single()

    setSets([...sets, newSet])
    setInputReps('')
    setInputWeight('')

    // Crear timer de descanso y navegar
    if (block.restSeconds > 0) {
      const { data: timer } = await supabase
        .from('active_timers')
        .insert({
          session_id: sessionId,
          timer_type: 'rest',
          duration_seconds: block.restSeconds,
          label: `Set ${roundNum} · ${exercise.name}`,
        })
        .select()
        .single()
      
      navigate(`/session/${sessionId}/rest`, { state: { timerId: timer.id } })
    }
  }

  async function finishSession() {
    await supabase
      .from('sessions')
      .update({
        completed_at: new Date().toISOString(),
        is_completed: true,
      })
      .eq('id', sessionId)
    
    navigate(`/session/${sessionId}/notes`)
  }

  if (loading || !session || !dayTemplate) {
    return (
      <div className="h-screen flex items-center justify-center text-muted text-sm">
        Cargando...
      </div>
    )
  }

  // Renderizar un ejercicio con Plan vs Real lado a lado
  function renderExercise(block, exercise) {
    const doneSets = getSetsForExercise(block.id, exercise.name)
    const totalSets = exercise.sets || block.rounds || 1
    const nextSetNum = doneSets.length + 1
    const isDone = doneSets.length >= totalSets

    return (
      <div key={exercise.name} className="py-3 border-b border-line last:border-b-0">
        <div className="text-[15px] font-medium mb-1">{exercise.name}</div>
        <div className="text-[13px] text-muted">
          {totalSets} × {exercise.targetReps || (exercise.targetHoldSeconds + 's')}
          {exercise.targetWeightLb ? ` @ ${exercise.targetWeightLb} lb` : ''}
        </div>
        {exercise.notes && (
          <div className="text-[12px] text-muted italic mt-1.5 leading-relaxed">
            {exercise.notes}
          </div>
        )}

        {/* Header de columnas */}
        <div className="grid grid-cols-[32px_1fr_1fr_28px] gap-2 items-center mt-4 px-1">
          <div className="text-[10px] tracking-widest uppercase text-muted">Set</div>
          <div className="text-[10px] tracking-widest uppercase text-muted text-center">Reps</div>
          <div className="text-[10px] tracking-widest uppercase text-muted text-center">Lb</div>
          <div />
        </div>

        {/* Filas de sets */}
        {Array.from({ length: totalSets }, (_, i) => {
          const setNum = i + 1
          const done = doneSets[i]
          const isActive = !done && setNum === nextSetNum
          const isPending = !done && !isActive

          if (done) {
            const belowPlan = done.actual_reps !== null && done.actual_reps < done.target_reps
            const color = belowPlan ? 'text-amber' : 'text-sage'
            return (
              <div
                key={setNum}
                className="grid grid-cols-[32px_1fr_1fr_28px] gap-2 items-center px-1 py-2 border-b border-line"
              >
                <div className="text-sm text-muted">{setNum}</div>
                <div className="text-center">
                  <div className="text-[9px] text-muted mb-0.5">plan {exercise.targetReps}</div>
                  <div className={`text-base font-medium ${color}`}>{done.actual_reps ?? '—'}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-muted mb-0.5">plan {exercise.targetWeightLb || 0}</div>
                  <div className="text-base font-medium text-sage">{done.actual_weight_lb ?? 0}</div>
                </div>
                <div className="text-center">
                  {done.is_personal_record ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8B89A" strokeWidth="2">
                      <path d="M12 2L12 22M5 9l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8B89A" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            )
          }

          if (isActive) {
            return (
              <div
                key={setNum}
                className="grid grid-cols-[32px_1fr_1fr_28px] gap-2 items-center px-1 py-3 border-b border-line rounded"
                style={{ background: 'rgba(245,245,240,0.03)' }}
              >
                <div className="text-sm text-fg font-medium">{setNum}</div>
                <div className="text-center">
                  <div className="text-[9px] text-muted mb-1">plan {exercise.targetReps ?? '—'}</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={inputReps}
                    onChange={(e) => setInputReps(e.target.value)}
                    placeholder={String(exercise.targetReps ?? '')}
                    className="w-full py-1.5 bg-transparent border border-fg rounded text-fg font-medium text-center text-base"
                  />
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-muted mb-1">plan {exercise.targetWeightLb || 0}</div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    placeholder={String(exercise.targetWeightLb || 0)}
                    className="w-full py-1.5 bg-transparent border border-fg rounded text-fg font-medium text-center text-base"
                  />
                </div>
                <div />
              </div>
            )
          }

          // Pending
          return (
            <div
              key={setNum}
              className="grid grid-cols-[32px_1fr_1fr_28px] gap-2 items-center px-1 py-2 border-b border-line opacity-40"
            >
              <div className="text-sm text-muted">{setNum}</div>
              <div className="text-center">
                <div className="text-[9px] text-muted mb-0.5">plan {exercise.targetReps ?? '—'}</div>
                <div className="text-base text-muted">—</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-muted mb-0.5">plan {exercise.targetWeightLb || 0}</div>
                <div className="text-base text-muted">—</div>
              </div>
              <div />
            </div>
          )
        })}

        {/* Botón de registrar */}
        {!isDone && (
          <div className="mt-4">
            <button
              onClick={() => completeSet(block, exercise, nextSetNum)}
              className="block w-full py-3.5 bg-fg text-bg rounded-lg text-sm font-medium tracking-wide no-select"
            >
              Registrar set {nextSetNum}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[11px] tracking-widest uppercase text-muted">
              Sesión activa
            </div>
            <h2 className="text-xl font-medium tracking-tight mt-1">
              {dayTemplate.name}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[11px] tracking-widest uppercase text-muted">Total</div>
            <div className="text-[22px] font-medium tracking-tight">
              {formatTime(elapsedSec)}
            </div>
          </div>
        </div>

        {/* Bloques */}
        {dayTemplate.blocks.map((block, blockIdx) => {
          // Skip cardio blocks (handled separately)
          if (block.isCardio) {
            return (
              <div key={block.id} className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
                    {block.label}
                  </h3>
                </div>
                <button
                  onClick={() => navigate(`/session/${sessionId}/cardio`)}
                  className="block w-full py-4 bg-fg text-bg rounded-lg text-[15px] font-medium tracking-wide no-select"
                >
                  Iniciar VO2max 4×3
                </button>
              </div>
            )
          }

          return (
            <div key={block.id} className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-baseline gap-2.5">
                  {block.isStar && <span className="text-2xl font-light">★</span>}
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted">
                    {block.label}
                  </h3>
                </div>
                {block.restSeconds > 0 && (
                  <span className="text-[11px] text-muted">
                    Descanso {block.restSeconds}s
                  </span>
                )}
              </div>
              {block.exercises.map((exercise) => renderExercise(block, exercise))}
            </div>
          )
        })}

        {/* Botón finalizar */}
        <div className="mt-8">
          <button
            onClick={finishSession}
            className="block w-full py-4 bg-transparent border border-line-strong text-fg rounded-lg text-[15px] font-medium tracking-wide no-select"
          >
            Finalizar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
