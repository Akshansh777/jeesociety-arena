import React, { useState } from 'react';
import { Save, Plus } from 'lucide-react';

export default function AdminPanel() {
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('Saving config will wipe current leaderboard.');

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
          // Sets drop time to 10 PM today
          newDropTime: new Date().setHours(22, 0, 0, 0) 
        })
      });
      setStatus('✅ Success! Arena is live with new questions.');
    } catch (err) {
      setStatus('❌ Failed to connect to server.');
    }
  };

  return (
    <div className="min-h-screen bg-jee-brown text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-jee-gold mb-8">HQ: Arena Control</h1>
        
        <div className="mb-8">
          <button onClick={addQuestion} className="bg-jee-maroon px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-jee-maroon/80 transition">
            <Plus size={20} /> Add Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white/10 p-6 rounded-xl border border-white/20">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" placeholder="Subject (e.g. Physics)" 
                  className="bg-black/20 p-3 rounded text-white"
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].subject = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <select 
                  className="bg-black/20 p-3 rounded text-white"
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
                className="w-full bg-black/20 p-3 rounded text-white mb-4 h-24"
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].text = e.target.value;
                  setQuestions(updated);
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input 
                      type="radio" name={`correct-${q.id}`}
                      onChange={() => {
                        const updated = [...questions];
                        updated[qIndex].correctOption = oIndex;
                        setQuestions(updated);
                      }}
                    />
                    <input 
                      type="text" placeholder={`Option ${oIndex + 1}`}
                      className="w-full bg-black/20 p-2 rounded text-white"
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
            <p className="text-sm text-jee-gold mb-4">{status}</p>
            <button onClick={handleSave} className="bg-jee-green text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition">
              <Save size={20} /> Deploy to JEEsociety
            </button>
          </div>
        )}
      </div>
    </div>
  );
}