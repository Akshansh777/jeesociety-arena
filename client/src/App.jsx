import React, { useState, useEffect } from 'react';
import { 
  Play, X, User, Trophy, Clock, Target, CheckCircle, XCircle, 
  ArrowUpRight, Calendar, Zap, Shield, FileText, BarChart2, ArrowRight 
} from 'lucide-react';
import QuizArena from './QuizArena';
import AdminPanel from './AdminPanel';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const AVATARS = [
  '/avatars/1.png', '/avatars/2.png', '/avatars/3.png', '/avatars/4.png',
  '/avatars/5.png', '/avatars/6.png', '/avatars/7.png', '/avatars/8.png'
];

export default function App() {
  // 1. HIDDEN ADMIN ROUTE
  if (window.location.pathname === '/admin-x7k9p') {
    return <AdminPanel />;
  }

  // --- STATE ---
  const [config, setConfig] = useState({ isQuizLive: false, dropTime: 0, questions: [] });
  const [showModal, setShowModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false); // NEW STATE
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [finalTime, setFinalTime] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  // --- REAL-TIME TIMER LOGIC ---
  const [isLeaderboardUnlocked, setIsLeaderboardUnlocked] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('Loading...');
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Server offline"));
  }, []);

  useEffect(() => {
    if (!config.dropTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = config.dropTime - now;

      if (distance <= 0) {
        clearInterval(timer);
        setIsLeaderboardUnlocked(true);
        setTimeLeftStr('LIVE NOW');
        fetch(import.meta.env.VITE_API_URL + '/api/leaderboard')
          .then(res => res.json())
          .then(data => setLeaderboardData(data));
      } else {
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeftStr(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config.dropTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderMath = (text) => {
    if (!text) return null;
    const parts = text.split('$');
    return parts.map((part, index) => {
      if (index % 2 === 1) return <InlineMath key={index} math={part} />;
      return <span key={index}>{part}</span>;
    });
  };

  const getPerformanceMessage = () => {
    if (totalQuestions === 0) return { title: "Completed!", sub: "Great effort." };
    const percentage = (finalScore / totalQuestions) * 100;
    
    if (percentage === 100) return { title: "Flawless Victory! 🏆", sub: "Absolute mastery of the concepts." };
    if (percentage >= 80) return { title: "Excellent Work! 🔥", sub: "You're in the top percentile. Keep pushing." };
    if (percentage >= 50) return { title: "Solid Effort! 👍", sub: "Good foundation, but room to optimize." };
    return { title: "Keep Learning! 📚", sub: "Every mistake is a stepping stone. Review the solutions." };
  };

  // --- VIEWS ---

  // VIEW 1: RESULTS & LEADERBOARD (Imported from Version 2)
  if (quizFinished) {
    const perfMsg = getPerformanceMessage();
    return (
      <div className="min-h-screen bg-jee-bg flex flex-col items-center py-12 relative overflow-y-auto px-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 max-w-2xl w-full shadow-xl text-center mb-8">
          
          {/* Custom Avatar Render */}
          <div className="mb-8 flex flex-col items-center">
            <img src={selectedAvatar} alt="Your Avatar" className="w-28 h-28 mb-4 rounded-full border-4 border-jee-gold shadow-xl object-cover bg-gray-100" />
            <h2 className="text-3xl font-extrabold text-jee-maroon">{perfMsg.title}</h2>
            <p className="text-jee-brown/70 font-medium mt-2">{perfMsg.sub}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-jee-brown/10 p-6 rounded-2xl shadow-sm">
              <Target className="text-jee-green mx-auto mb-2" size={32} />
              <p className="text-sm font-bold text-jee-brown/60">Score</p>
              <p className="text-4xl font-extrabold text-jee-maroon">{finalScore}<span className="text-xl text-jee-brown/40">/{totalQuestions}</span></p>
            </div>
            <div className="bg-white border border-jee-brown/10 p-6 rounded-2xl shadow-sm">
              <Clock className="text-jee-gold mx-auto mb-2" size={32} />
              <p className="text-sm font-bold text-jee-brown/60">Time</p>
              <p className="text-4xl font-extrabold text-jee-maroon">{formatTime(finalTime)}</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border transition-all mb-8 ${isLeaderboardUnlocked ? 'bg-jee-green/10 border-jee-green' : 'bg-jee-maroon/5 border-jee-maroon/10'}`}>
            <Trophy className={`mx-auto mb-3 ${isLeaderboardUnlocked ? 'text-jee-green scale-110' : 'text-jee-gold animate-bounce'}`} size={32} />
            <h3 className="text-lg font-bold text-jee-brown mb-1">
              {isLeaderboardUnlocked ? 'The Results Are In!' : 'Leaderboard compiling...'}
            </h3>
            {!isLeaderboardUnlocked && (
              <p className="text-jee-brown/70 font-medium text-sm">Unlocks at 10 PM. Time left: <span className="font-bold text-jee-maroon">{timeLeftStr}</span></p>
            )}
          </div>

          {/* Performance Breakdown */}
          <div className="text-left border-t border-jee-brown/10 pt-8">
            <h3 className="text-xl font-bold text-jee-maroon mb-6 flex items-center gap-2">📝 Performance Breakdown</h3>
            <div className="space-y-4">
              {config.questions.map((q, idx) => {
                const userChoiceIdx = userAnswers[idx];
                const isCorrect = q.type === 'pyq' && userChoiceIdx === q.correctOption;
                const isPoll = q.type === 'poll';
                
                return (
                  <div key={idx} className={`p-5 rounded-2xl border ${isPoll ? 'bg-gray-50 border-gray-200' : isCorrect ? 'bg-jee-green/5 border-jee-green/30' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="text-sm font-semibold text-jee-brown">
                        <span className="text-jee-gold mr-2 font-bold">Q{idx + 1}.</span> 
                        {renderMath(q.text)}
                      </div>
                      {!isPoll && (isCorrect ? <CheckCircle className="text-jee-green shrink-0" size={24} /> : <XCircle className="text-red-500 shrink-0" size={24} />)}
                    </div>
                    
                    <div className="space-y-2 text-sm mt-4">
                      {isPoll ? (
                        <div className="flex items-center gap-2 text-jee-brown">
                          <span className="font-bold text-gray-500">Your Vote:</span>
                          <span>{userChoiceIdx !== undefined && q.options[userChoiceIdx] ? renderMath(q.options[userChoiceIdx]) : 'Skipped'}</span>
                        </div>
                      ) : (
                        <>
                          <div className={`flex items-center gap-2 ${isCorrect ? 'text-jee-green font-bold' : 'text-red-600 font-bold'}`}>
                            <span>Your Answer:</span>
                            {/* SAFETY CHECK: Only render InlineMath if the option exists and isn't empty */}
                            <span>{userChoiceIdx !== undefined && q.options[userChoiceIdx] ? <InlineMath math={q.options[userChoiceIdx]} /> : 'Skipped'}</span>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center gap-2 text-jee-green font-bold bg-white p-2 rounded-lg border border-jee-green/20 mt-2">
                              <span>Correct Answer:</span>
                              <span>{q.options[q.correctOption] ? <InlineMath math={q.options[q.correctOption]} /> : 'N/A'}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isLeaderboardUnlocked && (
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 border border-jee-gold/30">
            <h2 className="text-2xl font-bold text-jee-maroon mb-6 text-center">Global Leaderboard</h2>
            <div className="space-y-3">
              {leaderboardData.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-jee-bg rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-jee-gold w-8">#{index + 1}</span>
                    <img src={player.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-jee-gold object-cover bg-white shrink-0" />
                    <span className="text-lg font-bold text-jee-brown">{player.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-jee-maroon">{player.score} pts</p>
                    <p className="text-sm text-jee-brown/60">{formatTime(player.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // VIEW 2: THE QUIZ ARENA (Unchanged)
  if (quizStarted) {
    return (
      <QuizArena 
        questions={config.questions}
        playerName={playerName} 
        avatar={selectedAvatar} 
        onFinish={async (answers, time, score, scorable) => {
          try {
            await fetch(import.meta.env.VITE_API_URL + '/api/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: playerName, avatar: selectedAvatar, score, time })
            });
          } catch (e) { console.error("Submit failed"); }

          setUserAnswers(answers); 
          setFinalTime(time);
          setFinalScore(score);
          setTotalQuestions(scorable);
          setQuizStarted(false); 
          setQuizFinished(true);
        }} 
      />
    );
  }

  // VIEW 3: THE HIGH-END LANDING PAGE (Unchanged from Version 1)
  return (
    <div className="min-h-screen bg-[#FFFBF7] overflow-x-hidden flex flex-col font-sans">
      
      {/* Top Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20 relative">
        <div className="text-3xl font-black text-jee-maroon tracking-tight">JEEsociety</div>
        <div className="hidden md:flex items-center gap-8 font-semibold text-jee-brown/80">
          <a href="#" className="hover:text-jee-maroon transition-colors">Home</a>
          <a href="#" className="hover:text-jee-maroon transition-colors">Arena</a>
          <a href="#" className="hover:text-jee-maroon transition-colors">Leaderboard</a>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-jee-maroon text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-jee-maroon/90 transition-all shadow-lg"
        >
          Enter Arena <span className="bg-white text-jee-maroon rounded-full p-1"><ArrowUpRight size={14} strokeWidth={3}/></span>
        </button>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center relative z-10 mt-8 md:mt-0">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Copy */}
          <div className="space-y-8">
            
            {/* Live Status Pill */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide ${config.isQuizLive ? 'bg-jee-maroon/10 text-jee-maroon' : 'bg-gray-200 text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full ${config.isQuizLive ? 'bg-jee-green animate-pulse' : 'bg-gray-400'}`}></span>
              {config.isQuizLive ? 'QUIZ IS LIVE' : 'CURRENTLY CLOSED'}
            </div>

            <h1 className="text-6xl md:text-[5rem] font-black text-jee-maroon leading-[1.05] tracking-tight">
              The Weekly <br/>
              <span className="bg-gradient-to-r from-jee-gold via-[#F3E5AB] to-jee-gold text-transparent bg-clip-text drop-shadow-sm">JEE Showdown.</span>
            </h1>
            
            <p className="text-xl text-jee-brown/70 max-w-md font-medium leading-relaxed">
              Master-level PYQs. 15 Minutes. Compete live with the community and climb the leaderboard.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-6 pt-4">
              <button 
                onClick={() => setShowModal(true)}
                disabled={!config.isQuizLive}
                className={`group relative flex items-center gap-4 px-8 py-4 rounded-full font-bold text-xl transition-all ${
                  config.isQuizLive 
                    ? 'bg-[#3A0B12] text-white hover:scale-105 animate-pulse-glow cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Enter Arena <span className="bg-white text-[#3A0B12] rounded-full p-1"><ArrowUpRight size={18} strokeWidth={3}/></span>
              </button>
              
              <button 
                onClick={() => setShowHowItWorks(true)}
                className="font-bold text-jee-brown hover:text-jee-maroon transition-colors underline decoration-2 underline-offset-4"
              >
                How it works?
              </button>
            </div>

            {/* Middle Feature Row (Bento style) */}
            <div className="flex flex-wrap gap-4 pt-8">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/40 shadow-sm">
                <div className="bg-jee-maroon/10 p-2 rounded-lg"><Calendar className="text-jee-maroon" size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-jee-brown leading-tight">Every Sunday</p>
                  <p className="text-xs text-jee-brown/60 font-medium">5 PM to 10 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/40 shadow-sm">
                <div className="bg-jee-maroon/10 p-2 rounded-lg"><Zap className="text-jee-maroon" size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-jee-brown leading-tight">Mega Quiz</p>
                  <p className="text-xs text-jee-brown/60 font-medium">High Stakes. Big Rights.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/40 shadow-sm">
                <div className="bg-jee-maroon/10 p-2 rounded-lg"><Shield className="text-jee-maroon" size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-jee-brown leading-tight">Zero-Friction Entry</p>
                  <p className="text-xs text-jee-brown/60 font-medium">No accounts needed.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Video Circular/Dome Mask */}
          <div className="relative w-full aspect-square flex justify-center items-center">
            {/* The giant circular mask */}
            <div className="relative w-[90%] h-[90%] rounded-full overflow-hidden shadow-2xl border-[8px] border-white/40 animate-subtle-float">
              <video className="absolute inset-0 w-full h-full object-cover scale-105" autoPlay loop muted playsInline>
                <source src="/hero-animation.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4A0E17]/40 to-transparent mix-blend-overlay"></div>
            </div>
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-jee-maroon/10 rounded-full blur-[100px] -z-10"></div>
          </div>
          
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 pb-8 mt-12 z-10">
        <div className="bg-[#3A0B12] rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl">
          
          <div className="flex items-center gap-4 text-white">
            <FileText size={36} className="text-jee-gold opacity-80" />
            <div>
              <h4 className="font-bold text-lg leading-tight">Real JEE PYQs</h4>
              <p className="text-sm text-white/60 mt-1 font-medium max-w-[180px]">Carefully curated previous year questions.</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-white/10"></div>

          <div className="flex items-center gap-4 text-white">
            <Clock size={36} className="text-jee-gold opacity-80" />
            <div>
              <h4 className="font-bold text-lg leading-tight">15 Min Challenges</h4>
              <p className="text-sm text-white/60 mt-1 font-medium max-w-[180px]">Quick. Focused. Competitive. Every minute counts.</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-white/10"></div>

          <div className="flex items-center gap-4 text-white">
            <BarChart2 size={36} className="text-jee-gold opacity-80" />
            <div>
              <h4 className="font-bold text-lg leading-tight">Live Leaderboard</h4>
              <p className="text-sm text-white/60 mt-1 font-medium max-w-[180px]">See how you rank in real-time against the best.</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-white/10"></div>

          <div className="flex items-center gap-4 text-white">
            <Target size={36} className="text-jee-gold opacity-80" />
            <div>
              <h4 className="font-bold text-lg leading-tight">Track & Improve</h4>
              <p className="text-sm text-white/60 mt-1 font-medium max-w-[180px]">Detailed insights to help you learn and grow.</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* How it Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHowItWorks(false)}></div>
          <div className="relative w-full max-w-4xl bg-[#FFFBF7] rounded-3xl p-10 shadow-2xl border border-white/50">
            <button onClick={() => setShowHowItWorks(false)} className="absolute top-6 right-6 p-2 text-jee-brown hover:bg-black/5 rounded-full transition-colors">
              <X size={28} />
            </button>
            <h2 className="text-4xl font-black text-jee-maroon mb-10 text-center">The Arena Flow</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Step 1 */}
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-jee-brown/5 text-center relative w-full">
                <div className="w-12 h-12 bg-jee-maroon text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
                <h3 className="font-bold text-jee-brown text-lg">Drop In</h3>
                <p className="text-sm text-jee-brown/60 mt-2">Pick an avatar and enter a name. No signups required.</p>
              </div>
              <ArrowRight className="text-jee-gold hidden md:block" size={32} />
              
              {/* Step 2 */}
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-jee-brown/5 text-center relative w-full">
                <div className="w-12 h-12 bg-jee-maroon text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
                <h3 className="font-bold text-jee-brown text-lg">Crack 5 PYQs</h3>
                <p className="text-sm text-jee-brown/60 mt-2">Beat the 15-minute clock. No negative marking today.</p>
              </div>
              <ArrowRight className="text-jee-gold hidden md:block" size={32} />

              {/* Step 3 */}
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-jee-brown/5 text-center relative w-full">
                <div className="w-12 h-12 bg-jee-maroon text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
                <h3 className="font-bold text-jee-brown text-lg">Lock Score</h3>
                <p className="text-sm text-jee-brown/60 mt-2">Get instant analytics and detailed LaTeX solutions.</p>
              </div>
              <ArrowRight className="text-jee-gold hidden md:block" size={32} />

              {/* Step 4 */}
              <div className="flex-1 bg-[#3A0B12] text-white p-6 rounded-2xl shadow-xl text-center relative w-full">
                <div className="w-12 h-12 bg-jee-gold text-[#3A0B12] rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">4</div>
                <h3 className="font-bold text-jee-gold text-lg">10 PM Drop</h3>
                <p className="text-sm text-white/70 mt-2">The global leaderboard unlocks. Claim your bragging rights.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-jee-brown hover:bg-black/5 rounded-full">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black text-jee-maroon mb-6 text-center">Setup Profile</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-jee-brown mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    maxLength={15}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-jee-brown/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-jee-gold text-jee-brown font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-jee-brown mb-3">Select Avatar</label>
                
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x custom-scrollbar">
                  {AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative shrink-0 rounded-full transition-all duration-300 snap-center ${
                        selectedAvatar === avatar 
                          ? 'ring-4 ring-jee-gold scale-110 shadow-lg z-10' 
                          : 'ring-2 ring-transparent hover:scale-105 opacity-60 hover:opacity-100 shadow-sm'
                      }`}
                    >
                      <img 
                        src={avatar} 
                        alt={`Avatar option ${idx + 1}`} 
                        className="w-16 h-16 rounded-full object-cover bg-gray-100"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = `https://ui-avatars.com/api/?name=${idx+1}&background=4A0E17&color=fff&rounded=true`;
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#FFFBF7] p-4 rounded-xl border border-jee-brown/5">
                <ul className="text-sm text-jee-brown space-y-2 mb-4 font-bold">
                  <li>⏳ Time Limit: 15 Minutes</li>
                  <li>🎯 {config.questions.length > 0 ? config.questions.length : 'Live'} Questions</li>
                  <li>🚀 No negative marking</li>
                </ul>
                <button 
                  onClick={() => {
                    if(playerName.trim() && config.questions.length > 0) setQuizStarted(true);
                  }}
                  disabled={!playerName.trim() || config.questions.length === 0}
                  className="w-full bg-[#3A0B12] text-white py-4 rounded-xl font-bold text-lg hover:bg-jee-maroon disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Play size={20} fill="currentColor" />
                  {config.questions.length === 0 ? 'Awaiting Questions...' : 'Start Timer & Begin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}