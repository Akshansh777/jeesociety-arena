import React, { useState, useEffect } from 'react';
import { Save, Plus, Lock, ArrowRight, Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('Fetch successful. Ready to edit.');

  const ADMIN_SECRET = 'JEE2026';

  useEffect(() => {
    if (isAuthenticated) {
      setStatus('Loading current arena config...');
      fetch(import.meta.env.VITE_API_URL + '/api/config')
        .then(res => res.json())
        .then(data => {
          if (data.questions) setQuestions(data.questions);
          setStatus('Arena data synced. Ready to edit.');
        })
        .catch(err => setStatus('⚠️ Failed to connect to server.'));
    }
  }, [isAuthenticated]);

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

  const removeQuestion = (indexToRemove) => {
    setQuestions(questions.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    setStatus('Deploying to servers...');
    try {
      await fetch(import.meta.env.VITE_API_URL + '/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions,
          // If questions exist, set live to true automatically
          liveStatus: questions.length > 0 
        })
      });
      setStatus('✅ Success! Arena is live with updated questions.');
    } catch (err) {
      setStatus('❌ Failed to connect to server.');
    }
  };

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

  return (
    <div className="min-h-screen bg-[#3A0B12] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-jee-gold">HQ: Arena Control</h1>
          <button onClick={addQuestion} className="bg-jee-green px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-jee-green/80 transition font-bold text-white shadow-lg">
            <Plus size={20} /> Add New Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={q.id || qIndex} className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-xl relative">
              <button 
                onClick={() => removeQuestion(qIndex)}
                className="absolute top-4 right-4 text-white/40 hover:text-red-400 transition"
                title="Delete Question"
              >
                <Trash2 size={20} />
              </button>

              <div className="grid grid-cols-2 gap-4 mb-4 pr-8">
                <input 
                  type="text" placeholder="Subject (e.g. Physics)" 
                  value={q.subject || ''}
                  className="bg-black/30 p-3 rounded text-white focus:outline-none focus:ring-1 focus:ring-jee-gold"
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].subject = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <select 
                  value={q.type || 'pyq'}
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
                placeholder="Question Text (You can use $LaTeX$ here)"
                value={q.text || ''}
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
                      name={`correct-${q.id || qIndex}`}
                      checked={q.correctOption === oIndex}
                      className="w-4 h-4 cursor-pointer accent-jee-gold"
                      onChange={() => {
                        const updated = [...questions];
                        updated[qIndex].correctOption = oIndex;
                        setQuestions(updated);
                      }}
                    />
                    <input 
                      type="text" placeholder={`Option ${oIndex + 1}`}
                      value={opt || ''}
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
          {questions.length === 0 && (
            <div className="text-center text-white/50 py-10 border-2 border-dashed border-white/20 rounded-xl">
              No questions found. Click "Add New Question" to start building the arena.
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-black/30 rounded-xl border border-jee-gold/30 flex items-center justify-between">
          <p className="text-sm text-jee-gold font-bold">{status}</p>
          <button 
            onClick={handleSave} 
            className="bg-jee-maroon text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition"
          >
            <Save size={20} /> {questions.length === 0 ? 'Clear Arena Data' : 'Deploy to JEEsociety'}
          </button>
        </div>
      </div>
    </div>
  );
}