import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, MessageSquare, X, Phone, MessageCircle, Send, Bot, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../shared/apiConfig';

export const FloatingUtils = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am the Savitram AI Assistant. Ask me anything about our NGO — donations, volunteering, membership, or our programs!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const checkScrollTop = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, []);

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen, botTyping]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMsg = inputText.trim();
    if (!userMsg || botTyping) return;

    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setBotTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/public/cms/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-6)
        })
      });
      const json = await res.json();
      const reply = json.success && json.data?.reply?.trim()
        ? json.data.reply
        : 'Sorry, I am having trouble responding right now. Please call us at +91 88600 36008.';
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network error. Please try again or contact us at +91 88600 36008.' }]);
    } finally {
      setBotTyping(false);
    }
  };

  return (
    <>
      {/* Back to Top Button */}
      <button
        onClick={scrollTop}
        className={`back-to-top-btn border-0 ${
          showScroll ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* Left Side: Expandable Chat Widget */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        {/* Expanded Options Menu */}
        <div className={`flex flex-col gap-2 transition-all duration-300 origin-bottom-left ${
          menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}>
          {/* Chat with AI */}
          <div className="px-3 py-2 rounded-xl bg-[#0A1628] border border-white/10 shadow-lg">
            <button
              onClick={() => { setChatOpen(true); setMenuOpen(false); }}
              className="flex items-center gap-3 text-white text-xs font-bold hover:text-[#1B5E20] transition-all cursor-pointer w-full"
            >
              <Bot size={16} className="text-[#1B5E20]" />
              <span>Chat with AI</span>
            </button>
          </div>

          {/* WhatsApp */}
          <div className="px-3 py-2 rounded-xl bg-[#0A1628] border border-[#25D366]/40 shadow-lg">
            <a
              href="https://wa.me/918860036008"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white text-xs font-bold hover:text-[#25D366] transition-all cursor-pointer w-full"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Call Us */}
          <div className="px-3 py-2 rounded-xl bg-[#0A1628] border border-[#2196F3]/40 shadow-lg">
            <a
              href="tel:+918860036008"
              className="flex items-center gap-3 text-white text-xs font-bold hover:text-[#2196F3] transition-all cursor-pointer w-full"
            >
              <Phone size={16} className="text-[#2196F3]" />
              <span>Call Us</span>
            </a>
          </div>
        </div>

        {/* Main Floating Trigger Button - In Box */}
        <div className="px-3 py-2.5 rounded-xl bg-[#1B5E20] border border-white/20 shadow-lg">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-white transition-all duration-300 hover:scale-105 cursor-pointer font-bold text-sm"
            style={{
              animation: menuOpen ? 'none' : 'pulse-green-ring 2.5s infinite'
            }}
            aria-label="Let's Chat Menu"
          >
            {menuOpen ? <X size={18} /> : <>
              <MessageSquare size={18} />
              <span>Let's Chat</span>
            </>}
          </button>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse-green-ring {
            0% { box-shadow: 0 0 0 0 rgba(27, 94, 32, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(27, 94, 32, 0); }
            100% { box-shadow: 0 0 0 0 rgba(27, 94, 32, 0); }
          }
        `}} />
      </div>

      {/* AI Chatbot Dialog */}
      {chatOpen && (
        <div
          className="fixed bottom-24 left-6 right-6 z-50 w-auto max-w-[320px] md:max-w-[320px] bg-[#0A1628] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left"
          style={{ height: '420px' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#1B5E20] flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <img src="/NGO logo.jpeg" alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
              <div>
                <p className="font-display font-extrabold text-xs tracking-wide leading-none">Savitram AI</p>
                <p className="text-[9px] text-white/70 font-semibold mt-0.5">Powered by Groq · Mixtral</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0A1628] text-xs font-semibold">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#1B5E20] text-white rounded-br-none'
                    : 'bg-white/5 text-white/90 border border-white/5 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {botTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 rounded-xl rounded-bl-none px-3 py-2 flex items-center gap-1.5">
                  <Loader2 size={12} className="text-[#1B5E20] animate-spin" />
                  <span className="text-white/50 text-[10px] font-semibold">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-[#091220] flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about donations, events..."
              disabled={botTyping}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#1B5E20] font-semibold disabled:opacity-60"
              aria-label="Chat message input"
            />
            <button
              type="submit"
              disabled={botTyping || !inputText.trim()}
              className="p-2 rounded-lg bg-[#1B5E20] text-white hover:brightness-110 cursor-pointer border-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingUtils;
