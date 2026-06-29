import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Sparkles, Mail, Lock, User, Phone, CheckCircle, Calendar, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthPortal: React.FC = () => {
  const { language, registerUser, loginUser } = useApp();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // UI States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (isRegister) {
      if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedPassword) {
        setError(translations[language]['auth.error.fields'] || 'Vui lòng điền đầy đủ các thông tin bắt buộc!');
        setLoading(false);
        return;
      }
      if (!agreeTerms) {
        setError(translations[language]['auth.error.terms'] || 'Bạn phải đồng ý với Điều khoản sử dụng của Mellodi Rewards!');
        setLoading(false);
        return;
      }

      const result = await registerUser(trimmedName, trimmedEmail, trimmedPhone, trimmedPassword);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } else {
      if (!trimmedEmail || !trimmedPassword) {
        setError(translations[language]['auth.error.login.fields'] || 'Vui lòng nhập Email và Mật khẩu!');
        setLoading(false);
        return;
      }

      const result = await loginUser(trimmedEmail, trimmedPassword);
      if (result.success) {
        setSuccess(translations[language]['auth.success.login'] || 'Đăng nhập thành công!');
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };


  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden border border-coffee-100 shadow-xl grid grid-cols-1 md:grid-cols-12 md:min-h-[600px] w-full">
      
      {/* LEFT COLUMN: BRANDING & MEMBERSHIP BENEFITS */}
      <div className="hidden md:flex md:col-span-5 bg-[#2D5A47] text-white p-8 sm:p-12 flex-col justify-between relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#A37B45]/15 rounded-full blur-xl pointer-events-none"></div>

        <div className="space-y-8 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#2D5A47] flex items-center justify-center font-serif font-black text-xl">
              M
            </div>
            <span className="font-serif font-bold text-2xl tracking-widest uppercase">
              {translations[language]['brand.name']}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold leading-tight">
              {translations[language]['auth.slogan']}
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              {translations[language]['auth.slogan.desc']}
            </p>
          </div>

          {/* Benefits Bullet list */}
          <div className="space-y-3 pt-4">
            <div className="flex items-start space-x-3 text-xs text-white/90">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Star className="w-3 h-3 text-[#A37B45] fill-[#A37B45]" />
              </div>
              <div>
                <p className="font-bold">{translations[language]['auth.benefit.1.title']}</p>
                <p className="text-[11px] text-white/70">{translations[language]['auth.benefit.1.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-white/90">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-[#A37B45] fill-[#A37B45]" />
              </div>
              <div>
                <p className="font-bold">{translations[language]['auth.benefit.2.title']}</p>
                <p className="text-[11px] text-white/70">{translations[language]['auth.benefit.2.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-white/90">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-[#A37B45] fill-[#A37B45]" />
              </div>
              <div>
                <p className="font-bold">{translations[language]['auth.benefit.3.title']}</p>
                <p className="text-[11px] text-white/70">{translations[language]['auth.benefit.3.desc']}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative holographic card frame */}
        <div className="mt-8 border border-white/20 bg-white/5 backdrop-blur-xs rounded-2xl p-4 text-center text-xs relative z-10">
          <div className="flex justify-between items-center opacity-60 mb-2">
            <span className="font-serif italic font-bold">Mellodi Card</span>
            <div className="flex space-x-1">
              <Star className="w-3 h-3 text-[#A37B45] fill-[#A37B45]" />
              <Star className="w-3 h-3 text-[#A37B45] fill-[#A37B45]" />
            </div>
          </div>
          <p className="font-mono tracking-widest text-[11px] uppercase">Mellodi Basic Rewards Tier</p>
          <div className="mt-4 flex justify-between items-end">
            <span className="text-[10px] text-white/50">MEMBER SINCE 2026</span>
            <span className="text-sm font-serif font-bold text-amber-300">0 LEN</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: REGISTER / LOGIN FORM */}
      <div className="md:col-span-7 p-6 sm:p-12 flex flex-col justify-center w-full">
        
        {/* State Toggle Header */}
        <div className="flex items-center space-x-6 border-b border-coffee-100 pb-4 mb-8">
          <button
            onClick={() => { setIsRegister(false); setError(null); setSuccess(null); }}
            className={`font-serif text-lg font-bold pb-2 border-b-2 transition-all ${
              !isRegister
                ? 'border-[#2D5A47] text-[#2D5A47]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            {translations[language]['auth.login']}
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(null); setSuccess(null); }}
            className={`font-serif text-lg font-bold pb-2 border-b-2 transition-all ${
              isRegister
                ? 'border-[#2D5A47] text-[#2D5A47]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            {translations[language]['auth.register']}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#4E342E]">
              {isRegister ? translations[language]['auth.create.account'] : translations[language]['auth.welcome.back']}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {isRegister 
                ? translations[language]['auth.create.account.sub']
                : translations[language]['auth.welcome.back.sub']}
            </p>
          </div>

          {/* Form alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-coffee-900 block">{translations[language]['auth.fullname']}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-2 focus:ring-[#2D5A47] focus:border-transparent outline-none bg-stone-50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-coffee-900 block">{translations[language]['auth.email']}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-2 focus:ring-[#2D5A47] focus:border-transparent outline-none bg-stone-50"
                />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-coffee-900 block">{translations[language]['auth.phone']}</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-2 focus:ring-[#2D5A47] focus:border-transparent outline-none bg-stone-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-coffee-900 block">{translations[language]['auth.birthday']}</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-2 focus:ring-[#2D5A47] focus:border-transparent outline-none bg-stone-50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-coffee-900 block">{translations[language]['auth.password']}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-2 focus:ring-[#2D5A47] focus:border-transparent outline-none bg-stone-50"
                />
              </div>
            </div>

            {isRegister && (
              <div className="flex items-start space-x-2.5 pt-1.5">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-coffee-200 text-[#2D5A47] focus:ring-[#2D5A47] h-4 w-4"
                />
                <label htmlFor="agree" className="text-[11px] text-stone-500 leading-normal">
                  {translations[language]['auth.agree']}
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2D5A47] hover:bg-[#1E3F31] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-6"
            >
              <span>{loading ? (translations[language]['auth.loading'] || 'Đang xử lý...') : isRegister ? translations[language]['auth.join.btn'] : translations[language]['auth.login.btn']}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};
