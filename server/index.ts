import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

interface Robot {
  id: string;
  name: string;
  institution: string;
}

interface MatchState {
  id: string;
  robotA: Robot | null;
  robotB: Robot | null;
  scoreA: number;
  scoreB: number;
  penaltiesA: string[];
  penaltiesB: string[];
  timeLeft: number; // in seconds
  isActive: boolean;
  category: string;
}

let activeMatch: MatchState = {
  id: '1',
  robotA: { id: 'r1', name: 'Alpha Bot', institution: 'MIT' },
  robotB: { id: 'r2', name: 'Zeta Knight', institution: 'Stanford' },
  scoreA: 0,
  scoreB: 0,
  penaltiesA: [],
  penaltiesB: [],
  timeLeft: 180, // 3 minutes
  isActive: false,
  category: 'Heavyweight'
};

// Timer logic
let timerInterval: NodeJS.Timeout | null = null;

const startTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (activeMatch.timeLeft > 0 && activeMatch.isActive) {
      activeMatch.timeLeft -= 1;
      io.emit('match_state', activeMatch);
    } else {
      stopTimer();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial state
  socket.emit('match_state', activeMatch);

  socket.on('control_match', (action: string, payload?: any) => {
    switch (action) {
      case 'START':
        activeMatch.isActive = true;
        startTimer();
        break;
      case 'PAUSE':
        activeMatch.isActive = false;
        stopTimer();
        break;
      case 'RESET':
        activeMatch.scoreA = 0;
        activeMatch.scoreB = 0;
        activeMatch.penaltiesA = [];
        activeMatch.penaltiesB = [];
        activeMatch.timeLeft = 180;
        activeMatch.isActive = false;
        stopTimer();
        break;
      case 'ADD_SCORE_A':
        activeMatch.scoreA += payload || 1;
        break;
      case 'ADD_SCORE_B':
        activeMatch.scoreB += payload || 1;
        break;
      case 'ADD_PENALTY_A':
        activeMatch.penaltiesA.push(payload || 'Warning');
        break;
      case 'ADD_PENALTY_B':
        activeMatch.penaltiesB.push(payload || 'Warning');
        break;
      case 'ADD_TIME':
        activeMatch.timeLeft += payload || 30;
        break;
    }
    io.emit('match_state', activeMatch);
    console.log(`Action: ${action} processed. New state sent.`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on all interfaces at port ${PORT}`);
});
