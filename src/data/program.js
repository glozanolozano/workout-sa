// Programa de entrenamiento San Antonio
// 3 julio - 14 agosto 2026
// 6 semanas · Ashtanga modulado + 45 min sesión

export const PROGRAM = {
  startDate: '2026-07-03',
  endDate: '2026-08-14',
  babyDueDate: '2026-08-03',
  totalWeeks: 6,

  // Día 1 = Lunes, Día 7 = Domingo
  sessions: {
    1: {
      type: 'push_calisthenics',
      name: 'Empuje',
      subtitle: 'Calistenia',
      durationMin: 45,
      ashtangaMin: 25, // yoga corto (día de empuje pesado)
      blocks: [
        {
          id: 'star',
          label: 'Movimiento principal',
          isStar: true,
          restSeconds: 120,
          exercises: [
            {
              name: 'Pike push-up pies elevados',
              sets: 5,
              targetReps: 7,
              targetWeightLb: 0,
              notes: 'RPE 7-8 primeros 3 sets, RPE 8-9 últimos 2. Progresión: handstand push-up contra pared cuando 5×8 sale limpio.',
            },
          ],
        },
        {
          id: 'main',
          label: 'Principal',
          restSeconds: 90,
          exercises: [
            {
              name: 'Dips estrictos',
              sets: 4,
              targetReps: 8,
              targetWeightLb: 0,
              notes: 'Target junio: 10 limpios. Trabajar en 6-8 reps por set te lleva ahí.',
            },
          ],
        },
        {
          id: 'accessory',
          label: 'Accesorio',
          restSeconds: 75,
          exercises: [
            {
              name: 'Push-up excéntrico lento',
              sets: 3,
              targetReps: 10,
              targetWeightLb: 0,
              notes: '4 segundos en la bajada.',
            },
          ],
        },
        {
          id: 'core',
          label: 'Core',
          restSeconds: 45,
          rounds: 2,
          exercises: [
            {
              name: 'Hollow body hold',
              sets: 2,
              targetHoldSeconds: 30,
            },
            {
              name: 'L-sit tuck en barra',
              sets: 2,
              targetHoldSeconds: 30,
            },
          ],
        },
      ],
    },

    2: {
      type: 'kb_explosive',
      name: 'KB Explosivo',
      subtitle: 'Kettlebell · Potencia',
      durationMin: 45,
      ashtangaMin: 45,
      blocks: [
        {
          id: 'star',
          label: 'Movimiento principal',
          isStar: true,
          restSeconds: 60,
          exercises: [
            {
              name: 'KB Swing a dos manos',
              sets: 6,
              targetReps: 15,
              targetWeightLb: 45,
              notes: 'Target junio: 3×15 @ 45 lb. Trabajar 6 sets sobreentrega el goal. Explosión de cadera, glúteos al tope.',
            },
          ],
        },
        {
          id: 'main',
          label: 'Principal',
          restSeconds: 90,
          exercises: [
            {
              name: 'KB Clean bilateral',
              sets: 4,
              targetReps: 5,
              targetWeightLb: 35,
              notes: 'Por lado. Semana 3+: introducir snatch si el clean está impecable.',
            },
          ],
        },
        {
          id: 'accessory',
          label: 'Accesorio piernas',
          restSeconds: 75,
          exercises: [
            {
              name: 'KB Front squat',
              sets: 4,
              targetReps: 6,
              targetWeightLb: 45,
              notes: 'Con doble KB o uno solo en posición rack.',
            },
          ],
        },
        {
          id: 'finisher',
          label: 'Finalizador',
          restSeconds: 60,
          rounds: 3,
          exercises: [
            {
              name: 'Farmer carry',
              sets: 3,
              targetHoldSeconds: 30,
              targetWeightLb: 50,
              notes: '30m por lado con peso significativo.',
            },
          ],
        },
      ],
    },

    3: {
      type: 'pull_calisthenics',
      name: 'Jalón',
      subtitle: 'Calistenia',
      durationMin: 45,
      ashtangaMin: 45,
      blocks: [
        {
          id: 'star',
          label: 'Movimiento principal',
          isStar: true,
          restSeconds: 90,
          exercises: [
            {
              name: 'Dominadas estrictas',
              sets: 6,
              targetReps: 3,
              targetWeightLb: 0,
              notes: 'Grease the groove: 6 sets distribuidos, lejos del fallo. Target junio: 3-5 estrictas en un set. Cuando 6×5 limpias → lastrar 2.5 kg.',
            },
          ],
        },
        {
          id: 'main',
          label: 'Principal',
          restSeconds: 90,
          exercises: [
            {
              name: 'Chin-ups',
              sets: 4,
              targetReps: 7,
              targetWeightLb: 0,
              notes: 'Agarre supino.',
            },
          ],
        },
        {
          id: 'accessory',
          label: 'Accesorio',
          restSeconds: 75,
          exercises: [
            {
              name: 'Remo invertido en barra baja',
              sets: 3,
              targetReps: 10,
              targetWeightLb: 0,
              notes: 'Con pausa 1s en contracción.',
            },
          ],
        },
        {
          id: 'core',
          label: 'Salud de hombro',
          restSeconds: 45,
          rounds: 2,
          exercises: [
            {
              name: 'Face pull en banda',
              sets: 2,
              targetReps: 15,
            },
            {
              name: 'Scapular pull-up',
              sets: 2,
              targetReps: 10,
            },
          ],
        },
      ],
    },

    4: {
      type: 'legs_calisthenics',
      name: 'Piernas',
      subtitle: 'Calistenia',
      durationMin: 45,
      ashtangaMin: 45,
      blocks: [
        {
          id: 'star',
          label: 'Movimiento principal',
          isStar: true,
          restSeconds: 90,
          exercises: [
            {
              name: 'Sentadilla búlgara con mancuernas',
              sets: 5,
              targetReps: 8,
              targetWeightLb: 30,
              notes: 'Por lado. Pie trasero en banco. Progresión: aumentar peso cuando 5×10 sale limpio.',
            },
          ],
        },
        {
          id: 'main',
          label: 'Bisagra',
          restSeconds: 90,
          exercises: [
            {
              name: 'Romanian deadlift con mancuernas',
              sets: 4,
              targetReps: 10,
              targetWeightLb: 50,
              notes: 'Las más pesadas disponibles.',
            },
          ],
        },
        {
          id: 'accessory',
          label: 'Glúteo',
          restSeconds: 75,
          exercises: [
            {
              name: 'Hip thrust con pie en banco',
              sets: 3,
              targetReps: 12,
              targetWeightLb: 25,
              notes: 'Mochila o KB en cadera.',
            },
          ],
        },
        {
          id: 'core',
          label: 'Unilateral',
          restSeconds: 45,
          rounds: 2,
          exercises: [
            {
              name: 'Nordic curl negativo',
              sets: 2,
              targetReps: 5,
              notes: 'Controlado.',
            },
            {
              name: 'KB Goblet squat con pausa 2s',
              sets: 2,
              targetReps: 10,
              targetWeightLb: 35,
            },
          ],
        },
      ],
    },

    5: {
      type: 'kb_technical_vo2',
      name: 'KB Técnico + VO2max',
      subtitle: 'Kettlebell + Cardio',
      durationMin: 45,
      ashtangaMin: 25, // yoga corto (día de empuje pesado)
      blocks: [
        {
          id: 'star',
          label: 'Movimiento principal',
          isStar: true,
          restSeconds: 75,
          exercises: [
            {
              name: 'KB Turkish Get-up',
              sets: 5,
              targetReps: 2,
              targetWeightLb: 25,
              notes: 'Por lado. Lento, control absoluto. Target junio: 2/lado @ 25-30 lb.',
            },
          ],
        },
        {
          id: 'main',
          label: 'Principal',
          restSeconds: 75,
          exercises: [
            {
              name: 'KB Press militar unilateral',
              sets: 4,
              targetReps: 6,
              targetWeightLb: 30,
              notes: 'Por lado.',
            },
          ],
        },
        {
          id: 'accessory',
          label: 'Carry',
          restSeconds: 60,
          rounds: 3,
          exercises: [
            {
              name: 'Farmer carry pesado',
              sets: 3,
              targetHoldSeconds: 30,
              targetWeightLb: 55,
              notes: '30m por lado.',
            },
          ],
        },
        {
          id: 'vo2max',
          label: 'VO2max Peloton',
          restSeconds: 0,
          isCardio: true,
          protocol: {
            intervals: 4,
            workSeconds: 180,
            restSeconds: 120,
          },
          exercises: [
            {
              name: 'Peloton 4×3',
              notes: '4 intervalos de 3 min @ 85-95% FC máx · 2 min recuperación activa. Si WHOOP amarillo: eliminar.',
            },
          ],
        },
      ],
    },

    6: {
      type: 'zone2',
      name: 'Zona 2 Peloton',
      subtitle: 'Cardio aeróbico',
      durationMin: 45,
      ashtangaMin: 45,
      blocks: [
        {
          id: 'zone2',
          label: 'Zona 2',
          isCardio: true,
          protocol: {
            totalSeconds: 2700, // 45 min
            targetHrLow: 130,
            targetHrHigh: 145,
          },
          exercises: [
            {
              name: 'Peloton 45 min',
              notes: '60-70% FC máx (~130-145 ppm). Resistencia moderada, cadencia constante. Conversación posible pero demandante.',
            },
          ],
        },
      ],
    },

    7: {
      type: 'rest',
      name: 'Descanso',
      subtitle: 'Recuperación total',
      durationMin: 0,
      ashtangaMin: 20, // opcional, restaurativo
      isRest: true,
      blocks: [],
    },
  },

  // Progresión de las 6 semanas
  weekProgression: {
    1: {
      label: 'Adaptación',
      notes: 'Plan base. Pesos conservadores. Forma perfecta. Establecer línea base de reps.',
    },
    2: {
      label: 'Carga',
      notes: '+1 rep en cada set donde se pueda. Verificar dominadas 6×3 limpias.',
    },
    3: {
      label: 'Intensificación',
      notes: 'Límite superior de cada rango. Snatch si el clean está impecable. Si dominadas 6×5 limpias → lastrar 2.5 kg.',
    },
    4: {
      label: 'Pico de carga',
      notes: 'RPE 8-9 en los ★. Última semana antes de la bebé. Push real.',
    },
    5: {
      label: 'Descarga',
      notes: 'Llega la bebé (3 ago). Eliminar accesorio + core. Solo ★ + movimiento principal. Yoga 4 veces (no diario). Pesos al 70%.',
    },
    6: {
      label: 'Sostenimiento',
      notes: 'Mantener carga moderada. Re-test contra targets junio el viernes.',
    },
  },

  // Nombres de días de la semana en español
  dayNames: {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  },

  dayNamesShort: {
    1: 'L',
    2: 'M',
    3: 'X',
    4: 'J',
    5: 'V',
    6: 'S',
    7: 'D',
  },
}

// Helper: calcular semana del programa a partir de una fecha
export function getWeekNumber(dateStr) {
  const start = new Date(PROGRAM.startDate + 'T00:00:00')
  const current = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24))
  const week = Math.floor(diffDays / 7) + 1
  return Math.min(Math.max(week, 1), PROGRAM.totalWeeks)
}

// Helper: día de la semana (1=Lun, 7=Dom)
export function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const jsDay = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  return jsDay === 0 ? 7 : jsDay
}

// Helper: obtener la sesión para una fecha específica
export function getSessionForDate(dateStr) {
  const dayOfWeek = getDayOfWeek(dateStr)
  return PROGRAM.sessions[dayOfWeek]
}
