import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SLEEP_OPTIONS = [
  { value: 4, label: '<5' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8+' },
]

const ENERGY_OPTIONS = [1, 2, 3, 4, 5]

export default function NotesScreen() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  
  const [session, setSession] = useState(null)
  const [sleepHours, setSleepHours] = useState(null)
  const [energy, setEnergy] = useState(null)
  const [complaints, setComplaints] = useState('')
  const [notes, setNotes] = useState('')
  const [prSets, setPrSets] = useState([])
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
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
    
    // Calcular duración
    if (sessionData.started_at && sessionData.completed_at) {
      const start = new Date(sessionData.started_at).getTime()
      const end = new Date(sessionData.completed_at).getTime()
      setDuration(Math.floor((end - start) / 1000))
    }
    
    // Cargar notas existentes si hay
    const { data: notesData } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle()
    
    if (notesData) {
      setSleepHours(notesData.sleep_hours)
      setEnergy(notesData.energy)
      setComplaints(notesData.complaints || '')
      setNotes(notesData.notes || '')
    }
    
    // Cargar récords personales de esta sesión
    const { data: prs } = await supabase
      .from('sets_completed')
      .select('exercise_name, actual_reps, actual_weight_lb')
      .eq('session_id', sessionId)
      .eq('is_personal_record', true)
    
    setPrSets(prs || [])
    setLoading(false)
  }

  async function save() {
    // Upsert de las notas
    const { data: existing } = await supabase
      .from('session_notes')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()
    
    if (existing) {
      await supabase
        .from('session_notes')
        .update({
          sleep_hours: sleepHours,
          energy,
          complaints,
          notes,
        })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('session_notes')
        .insert({
          session_id: sessionId,
          sleep_hours: sleepHours,
          energy,
          complaints,
          notes,
        })
    }
    
    navigate('/')
  }

  function skip() {
    navigate('/')
  }

  function formatDuration(sec) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading || !session) {
    return (
      <div className="h-screen flex items-center justify-center text-muted text-sm">
        Cargando...
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-6">
        {/* Header */}
        <div className="mb-6">
          <div className="text-[11px] tracking-widest uppercase text-muted">
            Sesión terminada · {formatDuration(duration)}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            Cómo te fue
          </h1>
          <div className="text-[13px] text-muted mt-1">
            {session.session_name}
          </div>
        </div>

        {/* Sleep */}
        <div className="mt-4">
          <div className="text-[11px] tracking-widest uppercase text-muted mb-3">
            Sueño anoche
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SLEEP_OPTIONS.map((opt) => {
              const isSelected = sleepHours === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSleepHours(opt.value)}
                  className={`py-3.5 rounded-md text-center text-base no-select tabular ${
                    isSelected
                      ? 'border border-fg text-fg font-medium'
                      : 'border border-line-strong text-muted'
                  }`}
                  style={isSelected ? { background: 'rgba(245,245,240,0.06)' } : {}}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          <div className="text-[11px] text-muted mt-2 text-center">horas</div>
        </div>

        {/* Energy */}
        <div className="mt-7">
          <div className="text-[11px] tracking-widest uppercase text-muted mb-3">
            Energía durante la sesión
          </div>
          <div className="grid grid-cols-5 gap-2">
            {ENERGY_OPTIONS.map((val) => {
              const isSelected = energy === val
              return (
                <button
                  key={val}
                  onClick={() => setEnergy(val)}
                  className={`py-3.5 rounded-md text-center text-base no-select tabular ${
                    isSelected
                      ? 'border border-fg text-fg font-medium'
                      : 'border border-line-strong text-muted'
                  }`}
                  style={isSelected ? { background: 'rgba(245,245,240,0.06)' } : {}}
                >
                  {val}
                </button>
              )
            })}
          </div>
          <div className="flex justify-between text-[11px] text-muted mt-2">
            <span>floja</span>
            <span>excelente</span>
          </div>
        </div>

        {/* Complaints */}
        <div className="mt-7">
          <div className="text-[11px] tracking-widest uppercase text-muted mb-3">
            Molestias o dolor{' '}
            <span className="normal-case tracking-normal text-muted text-[10px]">
              opcional
            </span>
          </div>
          <textarea
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
            placeholder="Lumbar floja, hombro derecho hizo clic..."
            className="w-full p-3.5 bg-transparent border border-line-strong rounded-md text-fg text-sm resize-none leading-relaxed"
            style={{ minHeight: '60px', fontFamily: 'inherit' }}
          />
        </div>

        {/* General notes */}
        <div className="mt-5">
          <div className="text-[11px] tracking-widest uppercase text-muted mb-3">
            Notas generales{' '}
            <span className="normal-case tracking-normal text-muted text-[10px]">
              opcional
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Calor brutal, bajé volumen en set 4, etc."
            className="w-full p-3.5 bg-transparent border border-line-strong rounded-md text-fg text-sm resize-none leading-relaxed"
            style={{ minHeight: '80px', fontFamily: 'inherit' }}
          />
        </div>

        {/* PR indicator */}
        {prSets.length > 0 && (
          <div className="mt-6 p-3.5 border border-sage rounded-md" style={{ background: 'rgba(168,184,154,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8B89A" strokeWidth="2">
                <path d="M12 2L12 22M5 9l7-7 7 7" />
              </svg>
              <span className="text-[11px] text-sage tracking-widest uppercase font-medium">
                Récord personal
              </span>
            </div>
            {prSets.map((pr, i) => (
              <div key={i} className="text-[13px] text-fg">
                {pr.exercise_name} · {pr.actual_reps} reps
                {pr.actual_weight_lb > 0 && ` @ ${pr.actual_weight_lb} lb`}
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-7">
          <button
            onClick={save}
            className="block w-full py-4 bg-fg text-bg rounded-lg text-[15px] font-medium tracking-wide no-select"
          >
            Guardar y terminar
          </button>
        </div>
        <div className="mt-3 mb-6">
          <button
            onClick={skip}
            className="block w-full py-4 bg-transparent border border-line-strong text-fg rounded-lg text-[15px] font-medium tracking-wide no-select"
          >
            Saltar notas
          </button>
        </div>
      </div>
    </div>
  )
}
