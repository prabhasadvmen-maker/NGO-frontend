import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, User, HelpCircle, ShieldAlert, Cpu, BarChart2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const SYSTEM_API = `${API_BASE_URL}/api/superadmin/system`;

const AICenter = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: 'ai',
      text: "Hello! I am Advmen NGO's Smart Assistant. How can I assist you with analyzing donation statistics, drafting notices, or allocating volunteer assets today?"
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleQuery = async (inputPrompt) => {
    const queryStr = inputPrompt || prompt;
    if (!queryStr.trim()) return;

    // Append User message
    const userMsg = { sender: 'user', text: queryStr };
    setChat(prev => [...prev, userMsg]);
    setPrompt('');
    setSubmitting(true);

    try {
      const res = await fetch(`${SYSTEM_API}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: queryStr })
      });
      const data = await res.json();
      if (data.success) {
        setChat(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        toast.error(data.message || 'AI processing error');
      }
    } catch (err) {
      toast.error('Network error contacting AI Center');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChipClick = (topic) => {
    handleQuery(topic);
  };

  const suggestChips = [
    "Analyze donations report trends",
    "Where should we host the next campaign event?",
    "Plan volunteer outreach allocation stats",
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Bot className="text-[#1B5E20]" size={28} />
            AI Center & Assistant
          </h1>
          <p className="text-xs text-gray-400 font-bold mt-1">
            Leverage smart algorithms, generate operations summary reports, and chat with the NGO operations model
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat assistant container */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between h-[65vh]">
            {/* Model Title */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 bg-green-50 rounded-xl">
                  <Sparkles className="text-green-600 animate-pulse" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-800">NGO Operation Helper</h3>
                  <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span> Model: Advmen-NLP-v2.1
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Box messages list */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar bg-gray-50/30">
              {chat.map((msg, idx) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div key={idx} className={`flex items-start gap-2.5 text-left ${!isAi ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-2 rounded-xl shrink-0 ${isAi ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isAi ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className={`p-3.5 rounded-2xl max-w-md text-xs font-semibold leading-relaxed ${
                      isAi
                        ? 'bg-white border border-gray-100 text-gray-700 shadow-sm'
                        : 'bg-[#1B5E20] text-white'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {submitting && (
                <div className="flex items-start gap-2.5 text-left">
                  <div className="p-2 rounded-xl shrink-0 bg-green-50 text-green-700">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-100 text-xs text-gray-400 font-bold italic shadow-sm animate-pulse">
                    Computing analytical response parameters...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick chips & Form query input */}
            <div className="p-4 bg-white border-t border-gray-100 space-y-3">
              {/* Prompt Suggestions */}
              <div className="flex flex-wrap gap-2 justify-start">
                {suggestChips.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleChipClick(chip)}
                    className="px-3 py-1.5 border border-gray-200 hover:border-green-500 rounded-xl bg-white text-gray-650 hover:text-green-700 font-bold text-[10px] text-left cursor-pointer transition-colors shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message submit */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleQuery(); }}
                className="flex items-center gap-2 p-1.5 border border-gray-200 rounded-2xl bg-gray-50/50"
              >
                <input
                  type="text"
                  placeholder="Ask assist model about branch drives or finance charts..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={submitting}
                  className="bg-transparent border-0 outline-none text-xs w-full px-2 font-semibold text-gray-700"
                />
                <button
                  type="submit"
                  disabled={submitting || !prompt.trim()}
                  className="p-2.5 bg-[#1B5E20] hover:opacity-90 disabled:opacity-50 text-white rounded-xl border-0 cursor-pointer shadow-md transition-all flex items-center justify-center shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* AI Info details pane */}
          <div className="space-y-6 text-left">
            {/* Insights panel */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-1.5">
                <BarChart2 className="text-[#1B5E20]" size={20} /> Smart AI Analytics
              </h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Ongoing automated calculations conducted background by system models schedules.
              </p>

              <div className="space-y-3.5">
                {[
                  { label: 'Volunteer Matching Rate', val: '94.2%', desc: 'Optimized location scheduling' },
                  { label: 'Duplicate Entry Detections', val: 'Active', desc: 'Running profiles verification checks' },
                  { label: 'Email Outreach Deliverability', val: '99.1%', desc: 'Spam filters and bounce verification' }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-gray-700">{item.label}</span>
                      <span className="block text-[9px] text-gray-400 font-bold mt-0.5">{item.desc}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-150 text-[10px] font-extrabold">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note Panel */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-1.5">
                <Cpu className="text-amber-600" size={20} /> Assistant Processing Note
              </h3>
              <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                AI outputs are modeled dynamically from structural branch databases tables. Verify details before triggering notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AICenter;
