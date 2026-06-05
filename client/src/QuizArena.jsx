import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, CheckCircle } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

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

  // This function cleanly splits regular text from $LaTeX$ math
  const renderTextWithMath = (text) => {
    if (!text) return null;
    const parts = text.split('$');
    return parts.map((part, index) => {
      // Every odd index is inside the $ $ tags
      if (index % 2 === 1 && part.trim() !== '') return <InlineMath key={index} math={part} />;
      // Every even index is regular text
      return <span key={index} className="whitespace-normal">{part}</span>;
    });
  };

  if (!currentQ) return <div className="p-10 text-center text-2xl font-bold">Loading Arena...</div>;

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-jee-brown/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-jee-maroon object-cover shadow-sm bg-gray-100 shrink-0" />
            <div>
              <p className="text-xs font-bold text-jee-brown/50 uppercase tracking-wider">Contender</p>
              <p className="text-lg font-bold text-jee-maroon leading-tight">{playerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-jee-maroon text-white px-4 py-2 rounded-lg font-mono text-xl shadow-inner shrink-0">
            <Timer size={20} className="text-jee-gold" />
            {formatTime(timeElapsed)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col">
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

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/50 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="bg-jee-gold/20 text-jee-brown px-3 py-1 rounded-full text-sm font-bold">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-bold text-jee-maroon uppercase tracking-widest text-right">
              {currentQ.subject}
            </span>
          </div>

          <div className="text-lg sm:text-xl text-jee-brown font-medium leading-relaxed mb-8 break-words whitespace-normal">
            {renderTextWithMath(currentQ.text)}
            
            {currentQ.formula && (
              <div className="my-6 p-4 bg-[#FFFBF7] rounded-xl overflow-x-auto text-center text-xl sm:text-2xl shadow-inner border border-jee-brown/5">
                <BlockMath math={currentQ.formula} />
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  /* Added h-auto, min-h-[5rem], whitespace-normal, and break-words to fix leaking and allow expansion */
                  className={`p-4 sm:p-6 rounded-2xl border-2 text-left transition-all text-base sm:text-lg h-auto min-h-[5rem] whitespace-normal break-words w-full flex items-center ${
                    isSelected 
                      ? 'border-jee-maroon bg-jee-maroon/5 shadow-md scale-[1.02]' 
                      : 'border-jee-brown/10 hover:border-jee-gold/50 hover:bg-white'
                  }`}
                >
                  <span className="w-full">
                    {currentQ.type === 'poll' ? opt : renderTextWithMath(opt || '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-jee-maroon text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-jee-maroon/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
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
