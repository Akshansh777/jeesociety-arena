import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, CheckCircle } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// Dummy Data: 5 Weekly Questions (Mix of Math, Physics, Chem, and a Poll)
const WEEKLY_QUESTIONS = [
  {
    id: 1,
    subject: 'Maths',
    text: "Evaluate the definite integral:",
    formula: "\\int_{0}^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx",
    options: ["\\pi/2", "\\pi/4", "\\pi", "0"],
    correctOption: 1, // Index 1 is \pi/4
    type: 'pyq'
  },
  {
    id: 2,
    subject: 'Physics',
    text: "A particle of mass $m$ is moving in a circular path of constant radius $r$ such that its centripetal acceleration $a_c$ is varying with time $t$ as $a_c = k^2 r t^2$, where $k$ is a constant. The power delivered to the particle by the forces acting on it is:",
    options: ["2\\pi m k^2 r^2 t", "m k^2 r^2 t", "\\frac{1}{3} m k^3 r^2 t", "0"],
    correctOption: 1, // Index 1 is m k^2 r^2 t
    type: 'pyq'
  },
  {
    id: 3,
    subject: 'Community Poll',
    text: "Which topic should we cover for next week's Mega Quiz?",
    options: ["Thermodynamics", "Coordinate Geometry", "Organic Chemistry", "Optics"],
    type: 'poll' // Polls have no correct answer, so they don't impact the score
  }
];

export default function QuizArena({ questions, playerName, avatar, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectOption = (optIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      let score = 0;
      let totalScorable = 0;
      
      questions.forEach((q, idx) => {
        if (q.type === 'pyq') {
          totalScorable++;
          if (selectedAnswers[idx] === q.correctOption) {
            score++;
          }
        }
      });
      
      onFinish(selectedAnswers, timeElapsed, score, totalScorable);
    }
  };

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;

  const renderTextWithMath = (text) => {
    if (!text) return null;
    const parts = text.split('$');
    return parts.map((part, index) => {
      if (index % 2 === 1) return <InlineMath key={index} math={part} />;
      return <span key={index}>{part}</span>;
    });
  };

  // Safety check if no questions are loaded yet
  if (!currentQ) return <div className="p-10 text-center text-2xl font-bold">Loading Arena...</div>;

  return (
    <div className="min-h-screen bg-jee-beige flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-jee-brown/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-jee-maroon object-cover shadow-sm bg-white shrink-0" />
            <div>
              <p className="text-xs font-bold text-jee-brown/50 uppercase tracking-wider">Contender</p>
              <p className="text-lg font-bold text-jee-maroon">{playerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-jee-maroon text-white px-4 py-2 rounded-lg font-mono text-xl shadow-inner">
            <Timer size={20} className="text-jee-gold" />
            {formatTime(timeElapsed)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col">
        <div className="flex gap-2 mb-8">
          {questions.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 flex-1 rounded-full transition-all ${
                idx === currentIndex ? 'bg-jee-maroon scale-y-125' :
                selectedAnswers[idx] !== undefined ? 'bg-jee-green/80' : 'bg-jee-brown/10'
              }`}
            />
          ))}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/50 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="bg-jee-gold/20 text-jee-brown px-3 py-1 rounded-full text-sm font-bold">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-bold text-jee-maroon uppercase tracking-widest">
              {currentQ.subject}
            </span>
          </div>

          <div className="text-xl text-jee-brown font-medium leading-relaxed mb-8">
            {renderTextWithMath(currentQ.text)}
            {currentQ.formula && (
              <div className="my-6 p-4 bg-jee-beige/50 rounded-xl overflow-x-auto text-center text-2xl">
                <BlockMath math={currentQ.formula} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all text-lg ${
                    isSelected 
                      ? 'border-jee-maroon bg-jee-maroon/5 shadow-md scale-[1.02]' 
                      : 'border-jee-brown/10 hover:border-jee-gold/50 hover:bg-white'
                  }`}
                >
                  {currentQ.type === 'poll' ? opt : <InlineMath math={opt || ''} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className="flex items-center gap-2 bg-jee-maroon text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-jee-maroon/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLastQuestion ? (
              <>Submit Exam <CheckCircle size={20} /></>
            ) : (
              <>Next Question <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}