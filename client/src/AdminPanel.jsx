import React, { useState } from 'react';
import { Save, Plus, Lock, ArrowRight } from 'lucide-react';

export default function AdminPanel() {
  // --- SECURITY STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- DASHBOARD STATE ---
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('Saving config will wipe current leaderboard.');

  // The secret passcode (Change this!)
  const ADMIN_SECRET = 'JEE2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Access Denied. Invalid clearance.');
      setPassword('');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      subject: 'Maths',
      text: '',
      formula: '',
      options: ['', '', '', ''],
      correctOption: 0,
      type: 'pyq'
    }]);
  };

  const handleSave = async () => {
    setStatus('Saving...');
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions,
          liveStatus: true,
          newDropTime: new Date().setHours(22, 0, 0, 0) 
        })
      });
      setStatus('✅ Success! Arena is live with new questions.');
    } catch (err) {
      setStatus('❌ Failed to connect to server.');
    }
  };

  // --- VIEW 1: THE LOCK SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-jee-bg flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-jee-maroon text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black text-jee-maroon mb-2">Restricted</h2>
          <p className="text-jee-brown/60 font-medium mb-8">Enter clearance code to access Arena HQ.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full px-4 py-3 bg-[#FFFBF7] border-2 border-jee-brown/10 rounded-xl focus:outline-none focus:border-jee-maroon text-center font-bold tracking-widest text-jee-brown"
            />
            {authError && <p className="text-red-500 text-sm font-bold">{authError}</p>}
            <button 
              type="submit"
              className="w-full bg-jee-maroon text-white py-3 rounded-xl font-bold hover:bg-jee-maroon/90 transition flex items-center justify-center gap-2"
            >
              Unlock <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 2: THE DASHBOARD (Only visible if authenticated) ---
  return (
    <div className="min-h-screen bg-[#3A0B12] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-jee-gold mb-8">HQ: Arena Control</h1>
        
        <div className="mb-8">
          <button onClick={addQuestion} className="bg-jee-maroon px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-jee-maroon/80 transition font-bold">
            <Plus size={20} /> Add Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-xl">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" placeholder="Subject (e.g. Physics)" 
                  className="bg-black/30 p-3 rounded text-white focus:outline-none focus:ring-1 focus:ring-jee-gold"
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].subject = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <select 
                  className="bg-black/30 p-3 rounded text-white focus:outline-none"
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].type = e.target.value;
                    setQuestions(updated);
                  }}
                >
                  <option value="pyq">PYQ (Scored)</option>
                  <option value="poll">Poll (Voting)</option>
                </select>
              </div>
              
              <textarea 
                placeholder="Question Text..."
                className="w-full bg-black/30 p-3 rounded text-white mb-4 h-24 focus:outline-none focus:ring-1 focus:ring-jee-gold"
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].text = e.target.value;
                  setQuestions(updated);
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-white/5">
                    <input 
                      type="radio" 
                      name={`correct-${q.id}`}
                      className="w-4 h-4 cursor-pointer accent-jee-gold"
                      onChange={() => {
                        const updated = [...questions];
                        updated[qIndex].correctOption = oIndex;
                        setQuestions(updated);
                      }}
                    />
                    <input 
                      type="text" placeholder={`Option ${oIndex + 1}`}
                      className="w-full bg-transparent p-1 text-white focus:outline-none"
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].options[oIndex] = e.target.value;
                        setQuestions(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {questions.length > 0 && (
          <div className="mt-8 p-6 bg-black/30 rounded-xl border border-jee-gold/30">
            <p className="text-sm text-jee-gold mb-4 font-bold">{status}</p>
            <button onClick={handleSave} className="bg-jee-green text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition">
              <Save size={20} /> Deploy to JEEsociety
            </button>
          </div>
        )}
      </div>
    </div>
  );
}