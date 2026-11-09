import React, { useState } from 'react';
import { assistantApi } from '../../services/api';
import { Bot, Send, Sparkles, User, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  dataPoints?: any;
  suggestions?: string[];
  timestamp: string;
}

export const StudentAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Greetings. I am LIBRΛ Intelligence Assistant. I am directly connected to the campus 120-seat 3D Digital Twin, IoT sensor stream, and XGBoost predictive models. How can I facilitate your research session today?",
      suggestions: [
        'Which floor is least crowded right now?',
        'How crowded will the library be at 3 PM?',
        'Which books are currently available?',
        'When is the best time to visit today?',
        'Which section is suitable for group study?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await assistantApi.chat(q);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: response.answer,
        dataPoints: response.data_points,
        suggestions: response.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Error communicating with the library intelligence server. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col glass-panel rounded-2xl border border-cyan/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-midnight/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet/20 border border-violet/40 text-violet flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base text-softwhite">
                LIBRΛ Autonomous Assistant
              </h2>
              <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/30">
                LIVE API INTEGRATION
              </span>
            </div>
            <p className="text-xs font-mono text-subtlegrey">
              Ground truth database queries • Continuous inference
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-cyan/20 text-cyan border border-cyan/30'
                  : 'bg-violet/20 text-violet border border-violet/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan/15 text-softwhite border border-cyan/30 font-sans'
                  : 'bg-navy/80 text-softwhite border border-white/10 font-sans'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Structured Facts / Data Points Cards */}
              {msg.dataPoints && (
                <div className="mt-3 p-3 rounded-xl bg-midnight/80 border border-cyan/20 font-mono text-[11px] text-cyan space-y-1">
                  <div className="text-[10px] uppercase text-subtlegrey">
                    VERIFIED SYSTEM METRICS:
                  </div>
                  {Object.entries(msg.dataPoints).map(([key, val]) => {
                    if (typeof val === 'object') return null;
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-subtlegrey capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-softwhite font-bold">{String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Clickable Follow-up Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-subtlegrey block">
                    QUICK ACTIONS / FOLLOW-UPS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-navy/60 hover:bg-cyan/15 text-cyan border border-cyan/30 transition-all text-left"
                      >
                        {s} →
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 text-[10px] font-mono text-subtlegrey text-right">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan">
            <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
            <span>Consulting real-time models & campus database...</span>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="p-4 border-t border-white/10 bg-midnight/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about floor occupancy, 3 PM forecast, available books, or group spaces..."
            className="flex-1 px-4 py-3 rounded-xl bg-navy/80 border border-white/10 focus:border-cyan text-xs font-mono text-softwhite focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl font-mono text-xs font-bold bg-cyan text-midnight hover:bg-ice hover:shadow-cyan-glow transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>TRANSMIT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
