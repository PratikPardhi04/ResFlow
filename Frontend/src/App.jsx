import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import ChatPage from './pages/ChatPage';
import JDMatchPage from './pages/JDMatchPage';
import CoverLetterPage from './pages/CoverLetterPage';
import JobSearchPage from './pages/JobSearchPage';

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/resume/:id" element={<ResumeDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/match" element={<JDMatchPage />} />
        <Route path="/cover-letter" element={<CoverLetterPage />} />
        <Route path="/jobs" element={<JobSearchPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
