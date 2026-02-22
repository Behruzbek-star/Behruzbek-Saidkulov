import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScoresPage } from './pages/ScoresPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="study" element={<StudyPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="scores" element={<ScoresPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
