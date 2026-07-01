import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PROGRAM } from '../data/program'

export default function SettingsScreen() {
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function exportData() {
    setExporting(true)
    
    // Cargar todo
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: true })
    
    const { data: sets } = await supabase
      .from('sets_completed')
      .select('*')
    
    const { data: notes } = await supabase
      .from('session_notes')
      .select('*')
    
    const { data: retests } = await supabase
      .from('retests')
      .select('*')
      .order('sort_order', { ascending: true })
    
    // Construir formato comprimido versión B
    const dayCodes = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 7: 'sun' }
    const typeCodes = {
      push_calisthenics: 'push',
      kb_explosive: 'kb_exp',
      pull_calisthenics: 'pull',
      legs_calisthenics: 'legs',
      kb_technical_vo2: 'kb_tech',
      zone2: 'zone2',
      rest: 'rest',
    }
    
    const compressedSessions = (sessions || []).map((session) => {
      const sessionSets = (sets || []).filter((s) => s.session_id === session.id)
      const sessionNote = (notes || []).find((n) => n.session_id === session.id)
      
      // Agrupar sets por ejercicio
      const exercisesMap = {}
      sessionSets.forEach((s) => {
        if (!exercisesMap[s.exercise_name]) {
          exercisesMap[s.exercise_name] = {
            name: s.exercise_name,
            block: s.block,
            plan: `${s.target_reps ? s.target_reps : s.target_hold_seconds + 's'}${s.target_weight_lb > 0 ? ` @ ${s.target_weight_lb}lb` : ''}`,
            actual: [],
            actual_weights: [],
            hasPR: false,
          }
        }
        exercisesMap[s.exercise_name].actual.push(s.actual_reps ?? s.actual_hold_seconds)
        if (s.actual_weight_lb > 0) {
          exercisesMap[s.exercise_name].actual_weights.push(s.actual_weight_lb)
        }
        if (s.is_personal_record) exercisesMap[s.exercise_name].hasPR = true
      })
      
      const exercises = Object.values(exercisesMap).map((ex) => {
        const obj = {
          name: ex.name,
          block: ex.block,
          plan: ex.plan,
          actual: ex.actual,
        }
        if (ex.actual_weights.length > 0) obj.weights = ex.actual_weights
        if (ex.hasPR) obj.pr = true
        return obj
      })
      
      let durationMin = null
      if (session.started_at && session.completed_at) {
        durationMin = Math.round(
          (new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000
        )
      }
      
      const compressed = {
        date: session.date,
        day: dayCodes[session.day_of_week],
        session: typeCodes[session.session_type],
        week: session.week_number,
        completed: session.is_completed,
        ashtanga: session.ashtanga_completed,
      }
      
      if (durationMin !== null) compressed.duration_min = durationMin
      if (sessionNote?.sleep_hours != null) compressed.sleep_h = sessionNote.sleep_hours
      if (sessionNote?.energy != null) compressed.energy = sessionNote.energy
      if (sessionNote?.complaints) compressed.complaints = sessionNote.complaints
      if (sessionNote?.notes) compressed.notes = sessionNote.notes
      if (exercises.length > 0) compressed.exercises = exercises
      if (session.is_skipped) {
        compressed.skipped = true
        if (session.skip_reason) compressed.skip_reason = session.skip_reason
      }
      
      return compressed
    })
    
    const exportObj = {
      program: {
        name: 'workout-sa',
        start_date: PROGRAM.startDate,
        end_date: PROGRAM.endDate,
        baby_due_date: PROGRAM.babyDueDate,
        weeks_total: PROGRAM.totalWeeks,
        structure: {
          monday: 'push (Empuje)',
          tuesday: 'kb_exp (KB Explosivo)',
          wednesday: 'pull (Jalón)',
          thursday: 'legs (Piernas)',
          friday: 'kb_tech + vo2max',
          saturday: 'zone2 cardio',
          sunday: 'rest',
        },
        week_progression: PROGRAM.weekProgression,
      },
      sessions: compressedSessions,
      retests_final: (retests || []).map((r) => ({
        metric: r.metric_key,
        label: r.metric_label,
        target: r.target,
        result: r.result,
      })),
      exported_at: new Date().toISOString(),
    }
    
    // Descargar como archivo
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-sa-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setExporting(false)
  }

  async function resetProgram() {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    
    await supabase.from('sets_completed').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('session_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('active_timers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('retests').update({ result: null, completed_at: null }).neq('id', '00000000-0000-0000-0000-000000000000')
    
    setConfirmReset(false)
    navigate('/')
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Ajustes</h1>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted no-select"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-2">
          <div className="py-4 border-b border-line">
            <div className="text-[11px] tracking-widest uppercase text-muted">
              Programa
            </div>
            <div className="mt-2">
              <div className="text-sm">Inicio: 3 julio 2026</div>
              <div className="text-sm text-muted mt-1">Fin: 14 agosto 2026</div>
            </div>
          </div>

          <div className="py-4 border-b border-line">
            <div className="text-[11px] tracking-widest uppercase text-muted">
              Llegada de la bebé
            </div>
            <div className="mt-2">
              <div className="text-sm">3 agosto 2026</div>
              <div className="text-xs text-muted mt-1">
                Inicio de semana 5 · descarga programada
              </div>
            </div>
          </div>

          <div className="py-4 border-b border-line">
            <div className="text-[11px] tracking-widest uppercase text-muted">
              Datos
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={exportData}
                disabled={exporting}
                className="block w-full py-3 bg-transparent border border-line-strong text-fg rounded-lg text-[13px] font-medium no-select disabled:opacity-50"
              >
                {exporting ? 'Exportando...' : 'Exportar como JSON'}
              </button>
              <button
                onClick={resetProgram}
                className={`block w-full py-3 bg-transparent border rounded-lg text-[13px] font-medium no-select ${
                  confirmReset ? 'border-rust text-rust' : 'border-line-strong text-fg'
                }`}
              >
                {confirmReset ? '¿Estás seguro? Toca de nuevo para confirmar' : 'Reset del programa'}
              </button>
            </div>
          </div>

          <div className="py-4 border-b border-line">
            <div className="text-[11px] tracking-widest uppercase text-muted">
              Versión
            </div>
            <div className="mt-2 text-[13px] text-muted">workout-sa v1.0</div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  )
}
