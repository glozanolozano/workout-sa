import { Routes, Route } from 'react-router-dom'
import TodayScreen from './screens/TodayScreen'
import SessionScreen from './screens/SessionScreen'
import RestTimerScreen from './screens/RestTimerScreen'
import CardioScreen from './screens/CardioScreen'
import Zone2Screen from './screens/Zone2Screen'
import NotesScreen from './screens/NotesScreen'
import WeekScreen from './screens/WeekScreen'
import ProgressScreen from './screens/ProgressScreen'
import SettingsScreen from './screens/SettingsScreen'

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <Routes>
        <Route path="/" element={<TodayScreen />} />
        <Route path="/session/:sessionId" element={<SessionScreen />} />
        <Route path="/session/:sessionId/rest" element={<RestTimerScreen />} />
        <Route path="/session/:sessionId/cardio" element={<CardioScreen />} />
        <Route path="/session/:sessionId/zone2" element={<Zone2Screen />} />
        <Route path="/session/:sessionId/notes" element={<NotesScreen />} />
        <Route path="/week" element={<WeekScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </div>
  )
}
