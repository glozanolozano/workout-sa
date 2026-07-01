import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PROGRAM, getWeekNumber } from '../data/program'
import TabBar from '../components/TabBar'

export default function ProgressScreen() {
  const [sessionsByWeek, setSessionsByWeek] = useState({})
  const [retests, setRetests] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRetest, setEditingRetest] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [today] = useState(new Date().toISOString().split('T')[0])
  
  const currentWeek = getWeekNumber(today)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    const { data: sessions } = await supabase
      .from('sessions')
      .select('week_number, is_completed')
    
    const grouped = {}
    for (let w = 1; w <= 6; w++) grouped[w] = { total: 6, completed: 0 }
    ;(sessions || []).forEach((s) => {
      if (s.is_completed && grouped[s.week_number]) {
        grouped[s.week_number].completed++
      }
    })
    setSessionsByWeek(grouped)
    
    const { data: retestsData } = await supabase
      .from('retests')
      .select('*')
      .order('sort_order', { ascending: true })
    
    setRetests(retestsData || [])
    setLoading(false)
  }

  async function saveRetest(id) {
    await supabase
      .from('retests')
      .update({
        result: editValue,
        completed_at: editValue ? new Date().toISOString() : null,
      })
      .eq('id', id)
    
    setEditingRetest(null)
    setEditValue('')
    loadData()
  }

  function startEdit(retest) {
    setEditingRetest(retest.id)
    setEditValue(retest.result || '')
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Progreso</h1>
          <div className="text-sm text-muted mt-1">
            6 semanas · 3 jul – 14 ago
          </div>
        </div>

        {/* Weekly progress rows */}
        <div className="mt-2">
          {Array.from({ length: 6 }, (_, i) => {
            const weekNum = i + 1
            const info = PROGRAM.weekProgression[weekNum]
            const stats = sessionsByWeek[weekNum] || { total: 6, completed: 0 }
            const pct = (stats.completed / stats.total) * 100
            const isCurrent = weekNum === currentWeek
            const isPast = weekNum < currentWeek
            const opacity = isCurrent || isPast ? '' : 'opacity-50'
            
            return (
              <div key={weekNum} className={`py-4 border-b border-line ${opacity}`}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="text-base font-medium">
                      Semana {weekNum}
                      {weekNum === 4 && ' · Pico'}
                      {weekNum === 5 && ' · Descarga'}
                    </div>
                    <div className="text-xs text-muted">{info.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base tabular">
                      {stats.completed} / {stats.total}
                    </div>
                    {isCurrent && (
                      <div className="text-[11px] text-muted">en progreso</div>
                    )}
                  </div>
                </div>
                <div className="w-full h-0.5 bg-line rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="h-full bg-sage transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Retests embedded */}
        <div className="mt-8">
          <div className="text-[11px] tracking-widest uppercase text-muted">
            Re-tests · Semana 6
          </div>
          <div className="mt-4">
            {retests.map((retest) => (
              <div key={retest.id} className="py-3.5 border-b border-line last:border-b-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{retest.metric_label}</div>
                    <div className="text-xs text-muted mt-0.5">
                      Target: {retest.target}
                    </div>
                  </div>
                  {editingRetest === retest.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 py-1.5 px-2 bg-transparent border border-fg rounded text-fg text-sm text-right"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRetest(retest.id)}
                        className="text-xs text-sage font-medium no-select"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(retest)}
                      className={`text-lg no-select ${
                        retest.result ? 'text-sage' : 'text-muted'
                      }`}
                    >
                      {retest.result || '—'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3.5 border border-line rounded-md text-xs text-muted leading-relaxed">
            Estos targets son los que te propusiste para junio 2026. Al final del
            programa en San Antonio, registra tus números reales aquí.
          </div>
        </div>

        <div className="h-6" />
      </div>

      <TabBar />
    </div>
  )
}
