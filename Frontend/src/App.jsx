import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeScore from './pages/ResumeScore';
import Coach from './pages/Coach';
import Jobs from './pages/Jobs';
import CoverLetter from './pages/CoverLetter';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground font-body">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume/new" element={<ResumeUpload />} />
              <Route path="/resume/:id" element={<ResumeScore />} />
              <Route path="/coach/:sessionId" element={<Coach />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/cover-letter" element={<CoverLetter />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
