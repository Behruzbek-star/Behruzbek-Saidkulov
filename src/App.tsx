import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { ScoresPage } from './pages/ScoresPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudyPage } from './pages/StudyPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/scores" element={<ScoresPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
