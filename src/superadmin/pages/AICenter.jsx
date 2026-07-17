import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, User, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const SYSTEM_API = `${API_BASE_URL}/api/superadmin/system`;

// Minimal markdown renderer: bold, bullet lists, numbered lists
const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1 my-1">
          {items.map((item, j) => <li key={j}>{parseBold(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Bullet list
    if (/^[\*\-]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[\*\-]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[\*\-]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-1">
          {items.map((item, j) => <li key={j}>{parseBold(item)}</li>)}
        </ul>
      );
      continue;
    }

    elements.push(<p key={i} className="my-0.5">{parseBold(line)}</p>);
    i++;
  }

  return elements;
};

const parseBold = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
};

const suggestChips = [
  'Analyze donation trends',
  'Best location for next campaign event?',
  'Volunteer outreach allocation plan',
  'Draft a fundraising notice',
];

const AICenter = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm SAVITRAM FOUNDATION's Smart Assistant. I can help you analyze donation statistics, plan events, manage volunteers, or draft notices. What would you like to explore today?"
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, submitting]);

  const handleQuery = async (inputPrompt) => {
    const queryStr = (inputPrompt || prompt).trim();
    if (!queryStr) return;

    setChat(prev => [...prev, { sender: 'user', text: queryStr }]);
    setPrompt('');
    setSubmitting(true);

    try {
      const res = await fetch(`${SYSTEM_API}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt: queryStr })
      });
      const data = await res.json();
      if (data.success) {
        setChat(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        toast.error(data.message || 'AI processing error');
      }
    } catch {
      toast.error('Network error contacting AI Center');
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-80px)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Bot className="text-[#1B5E20]" size={26} />
              AI Center
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Powered by Groq · llama-3.3-70b · NGO Operations Assistant
            </p>
          </div>
          <button
            onClick={() => setChat([{ sender: 'ai', text: "Hello! I'm SAVITRAM FOUNDATION's Smart Assistant. How can I help you today?" }])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-xl transition-colors cursor-pointer bg-white"
          >
            <Trash2 size={13} /> Clear Chat
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col overflow-hidden">

          {/* Chat header bar */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Sparkles className="text-green-600 animate-pulse" size={15} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-800">NGO Operation Helper</span>
              <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                Online · Savitram-NLP v3.0
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {chat.map((msg, idx) => {
              const isAi = msg.sender === 'ai';
              return (
                <div key={idx} className={`flex items-start gap-3 ${!isAi ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isAi ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isAi ? <Bot size={15} /> : <User size={15} />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed max-w-2xl ${
                    isAi
                      ? 'bg-gray-50 border border-gray-100 text-gray-700'
                      : 'bg-[#1B5E20] text-white'
                  }`}>
                    {isAi ? renderMarkdown(msg.text) : msg.text}
                  </div>
                </div>
              );
            })}

            {submitting && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl shrink-0 bg-green-50 text-green-700">
                  <Loader2 size={15} className="animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-400 font-semibold italic">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0 space-y-3">
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2">
              {suggestChips.map(chip => (
                <button
                  key={chip}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleQuery(chip)}
                  className="px-3 py-1.5 text-[10px] font-bold border border-gray-200 hover:border-green-400 hover:text-green-700 text-gray-500 rounded-xl bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input box */}
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-2xl bg-gray-50 focus-within:border-green-400 transition-colors">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about donations, events, volunteers, finance..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={submitting}
                className="flex-1 bg-transparent outline-none text-xs font-semibold text-gray-700 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => handleQuery()}
                disabled={submitting || !prompt.trim()}
                className="p-2 bg-[#1B5E20] hover:opacity-90 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AICenter;
