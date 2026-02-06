import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, AlertTriangle } from 'lucide-react'
import type { MatchState } from '../App'

interface DashboardProps {
  match: MatchState;
}

const Dashboard = ({ match }: DashboardProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      </div>

      {/* Header Info */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12 relative z-10"
      >
        <span className="px-5 py-2 rounded-full bg-brand/10 border border-brand/30 text-brand text-sm font-bold tracking-widest uppercase mb-4 inline-block">
          {match.category} Competition
        </span>
        <h1 className="text-4xl font-black tracking-tighter text-white/90">LIVE SCOREBOARD</h1>
      </motion.div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl relative z-10">
        
        {/* Robot A */}
        <motion.div 
          layout
          className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-brand/20 flex items-center justify-center mb-6 border border-brand/30">
            <Trophy className="w-12 h-12 text-brand" />
          </div>
          <h2 className="text-3xl font-bold mb-1">{match.robotA?.name || '---'}</h2>
          <p className="text-neutral-500 font-medium uppercase tracking-widest text-sm mb-8">{match.robotA?.institution || '---'}</p>
          
          <AnimatePresence mode='wait'>
            <motion.div 
              key={match.scoreA}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[12rem] leading-none font-black text-white tabular-nums tracking-tighter"
            >
              {match.scoreA}
            </motion.div>
          </AnimatePresence>

          {/* Penalties A */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {match.penaltiesA.map((p, i) => (
              <motion.div 
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                key={i} 
                className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-red-500 text-xs font-bold"
              >
                <AlertTriangle className="inline-block w-3 h-3 mr-1" /> {p}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Center: Timer & Status */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="bg-neutral-800/50 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 w-full flex flex-col items-center">
            <Clock className={`w-8 h-8 mb-4 ${match.isActive ? 'text-brand animate-pulse' : 'text-neutral-600'}`} />
            <div className={`text-8xl font-black tabular-nums transition-colors ${match.timeLeft < 30 ? 'text-red-500' : 'text-white'}`}>
              {formatTime(match.timeLeft)}
            </div>
            <div className="mt-4 px-4 py-1 rounded-full bg-white/5 text-xs font-bold uppercase tracking-widest text-neutral-400">
              {match.isActive ? 'Match in Progress' : 'Paused'}
            </div>
          </div>
          
          <div className="text-[10rem] font-bold text-neutral-800/20 leading-none select-none">
            VS
          </div>
        </div>

        {/* Robot B */}
        <motion.div 
          layout
          className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
            <Trophy className="w-12 h-12 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold mb-1">{match.robotB?.name || '---'}</h2>
          <p className="text-neutral-500 font-medium uppercase tracking-widest text-sm mb-8">{match.robotB?.institution || '---'}</p>
          
          <AnimatePresence mode='wait'>
            <motion.div 
              key={match.scoreB}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[12rem] leading-none font-black text-white tabular-nums tracking-tighter"
            >
              {match.scoreB}
            </motion.div>
          </AnimatePresence>

          {/* Penalties B */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {match.penaltiesB.map((p, i) => (
              <motion.div 
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                key={i} 
                className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-red-500 text-xs font-bold"
              >
                <AlertTriangle className="inline-block w-3 h-3 mr-1" /> {p}
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
