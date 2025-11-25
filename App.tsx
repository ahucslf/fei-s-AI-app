import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Play, Square, Sparkles, Trophy, Plus } from 'lucide-react';
import { Button } from './components/Button';
import { SettingsModal } from './components/SettingsModal';
import { HistoryPanel } from './components/HistoryPanel';
import { AppState, HistoryItem } from './types';

// Default Data for demo purposes
const DEMO_CANDIDATES = [
  '李明', '王芳', '张伟', '刘洋', '陈静',
  '杨秀英', '黄涛', '周杰', '吴刚', '徐丽',
  '孙强', '马超', '朱琳', '胡伟', '郭敏',
  '何磊', '林娜', '罗杰', '高山', '郑勇'
];

const DEMO_RIGGED = [
  '张伟', // 1st winner
  '陈静', // 2nd winner
  '马超' // 3rd winner
];

interface ScoreAnimation {
  id: number;
  value: number;
  x: number;
  y: number;
}

const App: React.FC = () => {
  // --- State ---
  const [candidates, setCandidates] = useState<string[]>(DEMO_CANDIDATES);
  const [riggedSequence, setRiggedSequence] = useState<string[]>(DEMO_RIGGED);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [nextRiggedIndex, setNextRiggedIndex] = useState(0);
  
  // Score State
  const [scores, setScores] = useState<Record<string, number>>({});
  const [scoreAnimations, setScoreAnimations] = useState<ScoreAnimation[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [displayedName, setDisplayedName] = useState<string>("准备就绪");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showWinnerEffect, setShowWinnerEffect] = useState(false);

  // --- Refs ---
  const intervalRef = useRef<number | null>(null);
  
  // --- Logic ---

  const getRandomCandidate = useCallback(() => {
    if (candidates.length === 0) return "???";
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }, [candidates]);

  const startRolling = () => {
    if (candidates.length === 0) {
      alert("请在设置中添加名单！");
      return;
    }

    setIsRunning(true);
    setShowWinnerEffect(false);
    
    // Fast rolling effect
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayedName(getRandomCandidate());
    }, 50); // 50ms = very fast roll
  };

  const stopRolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // DETERMINE THE WINNER
    let winnerName = "";
    let isRigged = false;

    if (nextRiggedIndex < riggedSequence.length) {
      winnerName = riggedSequence[nextRiggedIndex];
      setNextRiggedIndex(prev => prev + 1);
      isRigged = true;
    } else {
      // Logic: Prioritize people who haven't been picked recently, or just pure random
      // For now, let's keep it purely random from the pool to avoid predictability
      winnerName = getRandomCandidate();
    }

    setDisplayedName(winnerName);
    setIsRunning(false);
    setShowWinnerEffect(true);

    // Trigger confetti
    if (typeof (window as any).confetti === 'function') {
      (window as any).confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#818cf8', '#c084fc', '#f472b6', '#fbbf24'],
        zIndex: 100
      });
    }

    // Add to history
    const newHistoryItem: HistoryItem = {
      id: crypto.randomUUID(),
      name: winnerName,
      timestamp: new Date(),
      isRigged
    };
    setHistory(prev => [newHistoryItem, ...prev]);
  };

  const toggleRoll = () => {
    if (isRunning) {
      stopRolling();
    } else {
      startRolling();
    }
  };

  const handleSaveSettings = (newCandidates: string[], newRigged: string[]) => {
    setCandidates(newCandidates);
    setRiggedSequence(newRigged);
    setNextRiggedIndex(0);
    setHistory([]);
    setDisplayedName("准备就绪");
    // We don't reset scores here automatically so you can change settings mid-class without losing points
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleAddScore = (points: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isRunning || displayedName === "准备就绪" || displayedName === "???") return;

    // Update score
    setScores(prev => ({
      ...prev,
      [displayedName]: (prev[displayedName] || 0) + points
    }));

    // Trigger animation
    // Get button position for animation origin
    const rect = event.currentTarget.getBoundingClientRect();
    const newAnim: ScoreAnimation = {
      id: Date.now(),
      value: points,
      x: rect.left + rect.width / 2,
      y: rect.top
    };
    
    setScoreAnimations(prev => [...prev, newAnim]);

    // Cleanup animation after 1s
    setTimeout(() => {
      setScoreAnimations(prev => prev.filter(a => a.id !== newAnim.id));
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Sorted Leaderboard Data
  const sortedScores = Object.entries(scores)
    .sort((a, b) => (b[1] as number) - (a[1] as number));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating Score Animations */}
      {scoreAnimations.map(anim => (
        <div 
          key={anim.id}
          className="fixed z-50 pointer-events-none text-2xl font-bold text-yellow-400 animate-float-up"
          style={{ left: anim.x, top: anim.y }}
        >
          +{anim.value}
        </div>
      ))}

      {/* Navbar / Header */}
      <header className="w-full p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-200">飞的课堂</h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          title="设置"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl flex flex-col md:flex-row gap-6 p-4 z-10 mb-6">
        
        {/* Left Column: Picker & Controls */}
        <div className="flex-1 flex flex-col items-center gap-8">
          
          {/* The Display Box */}
          <div className="relative w-full group max-w-2xl mt-4">
            {/* Glowing border effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isRunning ? 'opacity-75 blur-md' : ''}`}></div>
            
            <div className="relative w-full aspect-[2.5/1] bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              
              {/* Grid background inside display */}
              <div className="absolute inset-0 opacity-10" 
                style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
              </div>

              <div className="relative z-10 px-4 text-center w-full">
                <h2 className={`
                  font-black tracking-tight text-slate-100 
                  transition-all duration-75
                  ${displayedName.length > 3 ? 'text-5xl md:text-7xl' : 'text-6xl md:text-8xl'}
                  ${isRunning ? 'blur-[1px] scale-95 opacity-80' : 'scale-100 opacity-100'}
                  ${showWinnerEffect ? 'animate-pop text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : ''}
                `}>
                  {displayedName}
                </h2>
                
                {/* Score badge for current user */}
                {!isRunning && displayedName !== "准备就绪" && displayedName !== "???" && (
                   <div className="mt-4 inline-flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <Trophy className="w-3 h-3 text-yellow-500" />
                     <span className="text-sm font-mono text-yellow-500">
                       当前积分: {scores[displayedName] || 0}
                     </span>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Scoring Controls */}
          <div className="flex gap-4 w-full max-w-2xl justify-center">
             <Button 
               variant="secondary" 
               className="flex-1 bg-blue-900/30 border-blue-500/30 text-blue-200 hover:bg-blue-800/50 hover:border-blue-500/50 transition-all"
               disabled={isRunning || displayedName === "准备就绪"}
               onClick={(e) => handleAddScore(1, e)}
             >
               <Plus className="w-4 h-4 mr-1" /> 1分
             </Button>
             <Button 
               variant="secondary" 
               className="flex-1 bg-indigo-900/30 border-indigo-500/30 text-indigo-200 hover:bg-indigo-800/50 hover:border-indigo-500/50 transition-all"
               disabled={isRunning || displayedName === "准备就绪"}
               onClick={(e) => handleAddScore(2, e)}
             >
               <Plus className="w-4 h-4 mr-1" /> 2分
             </Button>
             <Button 
               variant="secondary" 
               className="flex-1 bg-purple-900/30 border-purple-500/30 text-purple-200 hover:bg-purple-800/50 hover:border-purple-500/50 transition-all"
               disabled={isRunning || displayedName === "准备就绪"}
               onClick={(e) => handleAddScore(4, e)}
             >
               <Plus className="w-4 h-4 mr-1" /> 4分
             </Button>
          </div>

          {/* Main Action Button */}
          <Button 
            variant={isRunning ? 'danger' : 'primary'} 
            size="xl" 
            onClick={toggleRoll}
            className="w-full max-w-sm shadow-2xl ring-4 ring-slate-900 text-2xl py-6 active:scale-95 transition-transform"
          >
            {isRunning ? (
              <span className="flex items-center gap-3">
                <Square className="w-6 h-6 fill-current" /> 停止
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Play className="w-6 h-6 fill-current" /> 开始点名
              </span>
            )}
          </Button>

          {/* Rank Board (Replacing History in Main View, moved History to side) */}
          <div className="w-full max-w-2xl bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col overflow-hidden max-h-[300px]">
             <div className="flex items-center justify-between p-4 bg-slate-800/60 border-b border-slate-700">
                <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  积分排行榜
                </h3>
                <span className="text-xs text-slate-500">实时更新</span>
             </div>
             <div className="overflow-y-auto p-2">
               {sortedScores.length === 0 ? (
                 <div className="text-center py-8 text-slate-500 text-sm">暂无积分数据</div>
               ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                   {sortedScores.map(([name, score], idx) => (
                     <div key={name} className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <span className={`
                            w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold
                            ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                              idx === 1 ? 'bg-slate-300/20 text-slate-300' :
                              idx === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-slate-800 text-slate-600'}
                          `}>
                            {idx + 1}
                          </span>
                          <span className="text-sm text-slate-200 truncate max-w-[80px]">{name}</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-indigo-400">{score}</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="w-full md:w-80 h-[300px] md:h-auto shrink-0">
           <HistoryPanel history={history} onClear={handleClearHistory} />
        </div>

      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        initialCandidates={candidates}
        initialRigged={riggedSequence}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;