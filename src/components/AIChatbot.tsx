import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getBotResponse, ChatMessage } from '../lib/chatbot-ai';
import { MessageSquare, X, Send, Sparkles, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatbotProps {
  mode: 'web' | 'app';
}

const localTrans = {
  vi: {
    title: 'Trợ Lý Ảo Mellodi',
    status: 'Trực tuyến 24/7',
    placeholder: 'Hỏi Mellodi bất kỳ điều gì...',
    send: 'Gửi',
    quickQueries: [
      { text: '📍 Địa chỉ & Hotline', query: 'địa chỉ và hotline' },
      { text: '☕ Thực đơn Signature', query: 'thực đơn signature' },
      { text: '⭐️ Tích điểm & Hạng VIP', query: 'tích điểm và vip' },
      { text: '🎁 Ưu đãi & Voucher', query: 'khuyến mãi và voucher' }
    ],
    greeting: 'Mellodi xin chào! Tôi là trợ lý ảo AI hỗ trợ khách hàng. Bạn cần tôi giải đáp thông tin gì hôm nay?'
  },
  en: {
    title: 'Mellodi AI Assistant',
    status: 'Online 24/7',
    placeholder: 'Ask Mellodi anything...',
    send: 'Send',
    quickQueries: [
      { text: '📍 Location & Hotline', query: 'address and hotline' },
      { text: '☕ Signature Menu', query: 'signature menu' },
      { text: '⭐️ Points & VIP Tiers', query: 'points and vip' },
      { text: '🎁 Deals & Vouchers', query: 'promotions and vouchers' }
    ],
    greeting: 'Hello! I am Mellodi\'s AI Virtual Assistant. How can I assist you today?'
  },
  ko: {
    title: '멜로디 AI 비서',
    status: '24/7 온라인',
    placeholder: '멜로디에게 무엇이든 물어보세요...',
    send: '전송',
    quickQueries: [
      { text: '📍 매장 위치 & 고객센터', query: '주소와 전화번호' },
      { text: '☕ 시그니처 메뉴', query: '시그니처 메뉴' },
      { text: '⭐️ 포인트 적립 & VIP', query: '적립 및 등급' },
      { text: '🎁 쿠폰 & 프로모션', query: '쿠폰과 혜택' }
    ],
    greeting: '안녕하세요! 멜로디의 AI 고객지원 비서입니다. 오늘 어떤 도움이 필요하신가요?'
  }
};

export const AIChatbot: React.FC<AIChatbotProps> = ({ mode }) => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = localTrans[language] || localTrans['vi'];

  // Initialize with greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: t.greeting,
        timestamp: new Date()
      }
    ]);
  }, [language]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botReplyText = getBotResponse(textToSend, language);
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  // Determine positioning classes based on mode (web vs app)
  const containerClasses = mode === 'app'
    ? 'absolute bottom-4 right-4 z-45 text-left'
    : 'fixed bottom-6 right-6 z-50 text-left';

  const windowClasses = mode === 'app'
    ? 'absolute bottom-14 right-0 w-[300px] h-[380px] bg-white border border-coffee-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col'
    : 'absolute bottom-16 right-0 w-[350px] h-[480px] bg-white border border-coffee-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col';

  return (
    <div className={containerClasses}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={windowClasses}
          >
            {/* Chat Header */}
            <div className="bg-[#4E342E] text-white p-3.5 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/30">
                  <svg className="w-4.5 h-4.5 text-amber-300 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Coffee Cup */}
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="14" y1="2" x2="14" y2="4" />
                    {/* Headset */}
                    <path d="M3 14c0-4.5 3-8 9-8s9 3.5 9 8" stroke="#FBBF24" />
                    <circle cx="3" cy="14" r="1" fill="#FBBF24" stroke="#FBBF24" />
                    <circle cx="21" cy="14" r="1" fill="#FBBF24" stroke="#FBBF24" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold tracking-wide">{t.title}</h4>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] text-white/70 font-medium">{t.status}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-grow p-3 overflow-y-auto bg-stone-50 space-y-3 scrollbar-none text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-3xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#4E342E] text-white rounded-br-xs'
                        : 'bg-white text-stone-800 border border-stone-200/60 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-stone-500 border border-stone-200/60 rounded-2xl rounded-bl-xs p-3 flex space-x-1 items-center shadow-3xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick-reply Suggestion Chips */}
            <div className="p-2 bg-white border-t border-stone-100 flex flex-wrap gap-1.5 shrink-0 justify-start">
              {t.quickQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-xl text-[10px] font-semibold text-stone-600 transition-all cursor-pointer hover:scale-102"
                >
                  {item.text}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-stone-100 flex items-center space-x-2 shrink-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="flex-grow px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-coffee-300"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="w-8 h-8 rounded-xl bg-[#4E342E] hover:bg-[#3E2723] text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title={t.send}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-[#4E342E] hover:bg-[#3E2723] text-white flex items-center justify-center shadow-xl border border-white/10 cursor-pointer relative"
        title={t.title}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <svg className="w-5.5 h-5.5 text-white stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Coffee Cup */}
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
            {/* Headset */}
            <path d="M3 14c0-4.5 3-8 9-8s9 3.5 9 8" stroke="#FBBF24" />
            <circle cx="3" cy="14" r="1" fill="#FBBF24" stroke="#FBBF24" />
            <circle cx="21" cy="14" r="1" fill="#FBBF24" stroke="#FBBF24" />
          </svg>
        )}
      </motion.button>
    </div>
  );
};
