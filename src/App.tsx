import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import OldForm from './pages/Form/OldForm'
import WizardForm from './pages/WizardForm/WizardForm'
import LandingPage from './pages/Landing/LandingPage'
import Dashboard from './pages/Dashboard'
import RefereeControl from './pages/RefereeControl'
import Registration from './pages/Registration'
import Login from './pages/Login'
import AdminPanel from './pages/Admin/AdminPanel'
import Brackets from './pages/Brackets'
import { AuthProvider, useAuth } from './context/AuthContext'

export interface Robot {
  id: string;
  name: string;
  weightClass: string;
  institution: string;
}

export interface MatchState {
  id: string;
  robotA: Robot | null;
  robotB: Robot | null;
  scoreA: number;
  scoreB: number;
  penaltiesA: string[];
  penaltiesB: string[];
  timeLeft: number;
  isActive: boolean;
  isFinished: boolean;
  round: string;
  category: string;
  showInDashboard: boolean;
  winnerId: string | null;
  refereeId: string | null;
}

let socket: Socket;

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return children;
};

function AppContent() {
  const [matches, setMatches] = useState<MatchState[]>([]);

  useEffect(() => {
    // Connect to backend with dynamic host
    socket = io(`http://${window.location.hostname}:3001`);

    socket.on('all_matches', (allMatches: MatchState[]) => {
      setMatches(allMatches);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendControl = (matchId: string, action: string, payload?: any) => {
    socket.emit('control_match', { matchId, action, payload });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-brand/30">
      <Routes>
        {/* Public Form */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<WizardForm />} />
        <Route path="/old-form" element={<OldForm />} />

        {/* Public Scoreboard */}
        <Route path="/dashboard" element={<Dashboard matches={matches} />} />
        <Route path="/keys" element={<Brackets />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Referee (Controlled) */}
        <Route path="/referee" element={
          <ProtectedRoute role="REFEREE">
            <RefereeControl matches={matches} onControl={sendControl} />
          </ProtectedRoute>
        } />

        {/* Admin (CRUDs) */}
        <Route path="/admin" element={
          <ProtectedRoute role="ADMIN">
            <AdminPanel />
          </ProtectedRoute>
        } />

        {/* Registration is now likely an Admin function, but keeping for now or moved to Admin */}
        <Route path="/register" element={<Registration />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
