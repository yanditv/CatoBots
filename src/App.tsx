import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import Dashboard from './pages/Dashboard'
import RefereeControl from './pages/RefereeControl'
import Registration from './pages/Registration'

export interface Robot {
  id: string;
  name: string;
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
  category: string;
}

let socket: Socket;

function App() {
  const [matchState, setMatchState] = useState<MatchState | null>(null);

  useEffect(() => {
    // Determine the socket URL based on current window location
    const hostname = window.location.hostname;
    socket = io(`http://${hostname}:3001`);

    socket.on('match_state', (state: MatchState) => {
      setMatchState(state);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendControl = (action: string, payload?: any) => {
    socket.emit('control_match', action, payload);
  };

  if (!matchState) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-brand/30">
      <Routes>
        <Route path="/" element={<Dashboard match={matchState} />} />
        <Route path="/referee" element={<RefereeControl match={matchState} onControl={sendControl} />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
    </div>
  )
}

export default App
