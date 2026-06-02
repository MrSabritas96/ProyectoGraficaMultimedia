"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HttpAuthRepository } from '@/modules/auth/infrastructure/HttpAuthRepository';
import { ThreeBackground } from '@/shared/components/ThreeBackground';
import { Preloader } from '@/shared/components/Preloader';
import { HelpRobot } from '@/shared/components/HelpRobot';
import { Input } from '@/shared/components/Input';
import { Eye, EyeOff } from 'lucide-react';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [formData, setFormData] = useState({ email: '', codigo_unico: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0); // 0 = none, 1 = email, 2 = code, 3 = password
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Audio state and refs (Autoplay by default)
  const [isPlaying, setIsPlaying] = useState(true);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const onSoundRef = useRef<HTMLAudioElement | null>(null);
  const offSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio objects on client side
    bgMusicRef.current = new Audio('/audio/bg_music.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.8; // Volume increased
    bgMusicRef.current.currentTime = 5; // Start at 5 seconds
    
    // Attempt autoplay (Browsers may block this unless user interacts first, but this fulfills the requirement)
    bgMusicRef.current.play().catch(e => {
      console.log('Autoplay prevented by browser policy until user interacts:', e);
      setIsPlaying(false); // Revert UI if blocked
    });

    onSoundRef.current = new Audio('/audio/music_on.mp3');
    onSoundRef.current.volume = 0.6;

    offSoundRef.current = new Audio('/audio/music_off.mp3');
    offSoundRef.current.volume = 0.6;

    return () => {
      bgMusicRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    // Guarantee music plays on the very first click anywhere on the page if autoplay was blocked
    const handleFirstInteraction = () => {
      if (bgMusicRef.current && bgMusicRef.current.paused) {
        bgMusicRef.current.play().catch(e => console.log('First interaction play prevented', e));
        setIsPlaying(true);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      bgMusicRef.current?.pause();
      offSoundRef.current?.play().catch(e => console.log('Audio play failed', e));
      setIsPlaying(false);
    } else {
      bgMusicRef.current?.play().catch(e => console.log('Autoplay prevented or file missing', e));
      onSoundRef.current?.play().catch(e => console.log('Audio play failed', e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Real-time local coordinates for each metallic text element
      // This allows the flashlight effect to work perfectly across all browsers without the Chromium 'fixed' bug
      const elements = document.querySelectorAll('.metallic-text');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (el as HTMLElement).style.setProperty('--local-mouse-x', `${x}px`);
        (el as HTMLElement).style.setProperty('--local-mouse-y', `${y}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const repo = new HttpAuthRepository();
      const result = await repo.login(formData);
      
      Cookies.set('token', result.token, { expires: 1 });
      Cookies.set('role', result.role, { expires: 1 });
      
      const routes: Record<string, string> = {
        'Administrador': '/dashboard/admin',
        'Secretario': '/dashboard/secretary',
        'Jefe de Unidad': '/dashboard/jefe',
        'Ingeniero Electronico': '/dashboard/engineer',
        'Doctor': '/dashboard/doctor'
      };
      
      router.push(routes[result.role] || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  // Restored Interactive Lighting with Exact Local Coordinates
  const interactivePurpleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-oswald)',
    fontWeight: 300,
    backgroundImage: `radial-gradient(circle 2200px at var(--local-mouse-x, 50%) var(--local-mouse-y, 50%), #ffffff 0%, #e9d5ff 10%, #c084fc 30%, #7e22ce 60%, #4c1d95 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  };

  const interactiveSilverStyle: React.CSSProperties = {
    fontFamily: 'var(--font-oswald)',
    fontWeight: 300,
    backgroundImage: `radial-gradient(circle 2500px at var(--local-mouse-x, 50%) var(--local-mouse-y, 50%), #ffffff 0%, #e2e8f0 10%, #94a3b8 30%, #475569 60%, #1e293b 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    filter: 'drop-shadow(0px 0px 15px rgba(255,255,255,0.15))'
  };

  return (
    <>
      <AnimatePresence>
        {showLoader && <Preloader onFinish={() => setShowLoader(false)} />}
      </AnimatePresence>

      {/* Persistent SVG Defs for Layout Transitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="loader-silver-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {!showLoader && (
        <div ref={containerRef} className="min-h-screen flex items-center justify-center p-6 lg:p-20 relative overflow-hidden bg-[#020005]">
      <ThreeBackground />

      {/* Tutorial Overlay Backdrop */}
      <AnimatePresence>
        {tutorialStep > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050010]/70"
            onClick={() => setTutorialStep(0)}
          />
        )}
      </AnimatePresence>
      
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, top: -20 }}
        animate={{ opacity: 1, top: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute left-0 w-full px-8 py-10 flex justify-between items-center z-50"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-[60px] h-[60px] md:w-[70px] md:h-[70px]">
            <motion.div 
              layoutId="hero-logo-gear"
              transition={{ layout: { duration: 1.2, ease: "easeInOut" } }}
              className="absolute inset-0 flex items-center justify-center rounded-full"
            >
              {/* Spinning Gear */}
              <motion.svg 
                viewBox="0 0 300 300" 
                className="absolute w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              >
                <circle cx="150" cy="150" r="130" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="1" opacity="0.5" />
                <circle cx="150" cy="150" r="115" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="15" strokeDasharray="4 4" opacity="0.9" />
                <circle cx="150" cy="150" r="105" fill="none" stroke="url(#loader-silver-gradient)" strokeWidth="2" opacity="0.8" />
              </motion.svg>
            </motion.div>

            <motion.div 
              layoutId="hero-logo-hc"
              transition={{ layout: { duration: 1.2, ease: "easeInOut" } }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {/* HC Logo */}
              <svg viewBox="0 0 400 300" className="w-[75%] h-auto z-10 relative">
                <text x="40%" y="52%" textAnchor="middle" dominantBaseline="middle" className="logo-text" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 'bold', fontSize: '160px', textShadow: '0 0 5px rgba(255,255,255,0.4)' }} fill="#ffffff">H</text>
                <text x="62%" y="67%" textAnchor="middle" dominantBaseline="middle" className="logo-text" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 'bold', fontSize: '180px', textShadow: '0 0 5px rgba(255,255,255,0.4)' }} fill="#ffffff">C</text>
              </svg>
            </motion.div>
          </div>

          <motion.div 
            layoutId="hero-logo-text"
            transition={{ layout: { duration: 1.2, delay: 0.3, ease: "easeInOut" } }}
            className="flex items-center justify-center overflow-hidden"
          >
            <span className="font-medium tracking-[0.2em] uppercase text-[15px] md:text-[18px] metallic-text" style={interactiveSilverStyle}>
              MEDTRACK
            </span>
          </motion.div>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-light tracking-[0.25em] uppercase text-slate-400">
          <a href="#" className="hover:text-[#8b5cf6] transition-colors cursor-none">INICIO</a>
          <a href="#" className="hover:text-[#8b5cf6] transition-colors cursor-none">SERVICIOS</a>
          
          <div className="relative group flex items-center">
            <button 
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={`transition-colors cursor-none pb-1 ${showHelp ? 'text-[#8b5cf6] border-b border-[#8b5cf6]' : 'hover:text-[#8b5cf6] border-b border-transparent'}`}
            >
              AYUDA
            </button>
            
            {/* Tooltip */}
            <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-max z-50">
              <div className="bg-[#1e1b4b] border border-[#a855f7]/50 text-[#e9d5ff] px-3 py-2 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] text-[9px] tracking-widest relative">
                ¿Necesitas ayuda para ingresar?
                {/* Tooltip arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-[#a855f7]/50" />
              </div>
            </div>
          </div>

          <a href="#" className={`transition-colors cursor-none pb-1 ${!showHelp ? 'text-[#8b5cf6] border-b border-[#8b5cf6]' : 'hover:text-[#8b5cf6] border-b border-transparent'}`}>PORTAL</a>
          
          {/* Audio Toggle Button */}
          <button 
            type="button"
            onClick={toggleAudio}
            className="ml-2 flex items-center justify-center gap-[3px] h-4 cursor-pointer hover:opacity-80 transition-opacity"
            title="Activar/Desactivar Música"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-[2px] bg-[#a855f7] rounded-full"
                animate={isPlaying ? { height: ["4px", "12px", "6px", "14px", "4px"] } : { height: "4px" }}
                transition={isPlaying ? { duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" } : { duration: 0.3 }}
              />
            ))}
          </button>
        </div>
      </motion.nav>

      <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12 relative z-10 mt-12">
        
        {/* Left Side: Welcome & Logo or Help Robot */}
        <div className="flex-1 flex flex-col justify-center items-start w-full lg:pr-12 min-h-[400px]">
          <AnimatePresence mode="wait">
            {!showHelp ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="flex flex-col space-y-12 w-full"
              >
                {/* Metallic Silver BIENVENIDO - Custom Animated Letter by Letter */}
                <div className="flex">
            {"BIENVENIDO".split("").map((letter, i) => {
              // Custom delay sequence: E, N, O first -> I, V, E, D next -> B, N, I last
              const delays = [1.0, 0.4, 0.0, 0.1, 0.5, 0.6, 1.1, 1.2, 0.7, 0.2];
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1.2, delay: delays[i], ease: "easeOut" }}
                  className="text-6xl md:text-[6.5rem] leading-[0.9] tracking-wider metallic-text"
                  style={interactiveSilverStyle}
                >
                  {letter}
                </motion.span>
              );
            })}
          </div>
          
          <div className="flex items-center gap-6 mt-4 relative">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, top: 40 }}
              animate={{ opacity: 1, top: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 metallic-text"
              style={{
                ...interactivePurpleStyle,
                color: 'initial', 
                WebkitBackgroundClip: 'initial', 
                backgroundClip: 'initial',
                WebkitMaskImage: 'url(/images/logo.png)',
                maskImage: 'url(/images/logo.png)',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                filter: 'drop-shadow(0px 0px 15px rgba(126,34,206,0.4))'
              }}
            />
            
            {/* Text beside logo - Staggered Animation */}
            <div className="flex flex-col space-y-1 max-w-xs md:max-w-sm overflow-hidden">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                className="text-lg md:text-2xl tracking-widest uppercase metallic-text" style={interactivePurpleStyle}
              >
                Hospital de Clinicas
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
                className="text-[10px] md:text-xs uppercase tracking-[0.2em] leading-relaxed metallic-text" style={interactivePurpleStyle}
              >
                Unidad de infraestructura y mantenimiento
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 2.0, ease: "easeOut" }}
                className="text-[10px] md:text-xs uppercase tracking-[0.2em] leading-relaxed font-semibold metallic-text" style={interactivePurpleStyle}
              >
                Electromedicina
              </motion.p>
            </div>
          </div>
              </motion.div>
            ) : (
              <motion.div 
                key="help-robot"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-full flex items-center justify-center pt-8"
              >
                <HelpRobot 
                  tutorialStep={tutorialStep}
                  onStartTutorial={() => setTutorialStep(1)}
                  onNextStep={() => setTutorialStep(prev => prev + 1)}
                  onSkipTutorial={() => setTutorialStep(0)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 1.2, ease: "easeOut" }}
          className={`w-full lg:w-[600px] flex-shrink-0 pt-8 lg:pt-0 relative transition-all duration-500 ${tutorialStep > 0 ? 'z-50' : 'z-10'}`}
        >
          <form onSubmit={handleSubmit} className="space-y-12">
                        {/* 2-Column Row for Email and Code */}
            <div className="flex flex-col sm:flex-row gap-8 w-full">
              <div className={`flex-1 relative transition-all duration-500 ${tutorialStep > 0 && tutorialStep !== 1 ? 'opacity-30 pointer-events-none scale-95' : 'scale-100'}`}>
                <div className={`transition-all duration-500 rounded-xl ${tutorialStep === 1 ? 'ring-2 ring-[#a855f7] ring-offset-4 ring-offset-[#020005] bg-[#020005] p-2 -m-2 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : ''}`}>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Correo Institucional"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    variant="minimal"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className={`flex-1 relative transition-all duration-500 ${tutorialStep > 0 && tutorialStep !== 2 ? 'opacity-30 pointer-events-none scale-95' : 'scale-100'}`}>
                <div className={`transition-all duration-500 rounded-xl ${tutorialStep === 2 ? 'ring-2 ring-[#a855f7] ring-offset-4 ring-offset-[#020005] bg-[#020005] p-2 -m-2 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : ''}`}>
                  <Input 
                    id="codigo_unico"
                    name="codigo_unico"
                    type="text"
                    placeholder="Código Único"
                    value={formData.codigo_unico}
                    onChange={(e) => setFormData({ ...formData, codigo_unico: e.target.value })}
                    required
                    variant="minimal"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Password */}
            <div className={`relative w-full pb-2 transition-all duration-500 ${tutorialStep > 0 && tutorialStep !== 3 ? 'opacity-30 pointer-events-none scale-95' : 'scale-100'}`}>
              <div className={`transition-all duration-500 rounded-xl ${tutorialStep === 3 ? 'ring-2 ring-[#a855f7] ring-offset-4 ring-offset-[#020005] bg-[#020005] p-2 -m-2 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : ''}`}>
                <Input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  error={error}
                  variant="minimal"
                  className="text-sm"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-[#8b5cf6] transition-colors p-2 pointer-events-auto"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              {/* Button under password */}
              <div className="flex justify-start mt-10 relative">
                <button 
                  id="btn-login"
                  name="btn-login"
                  type="submit" 
                  disabled={loading}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  className={`group relative text-[11px] md:text-xs tracking-[0.4em] transition-colors duration-500 uppercase pb-4 pl-8 md:pl-16 ${isButtonHovered ? 'text-[#a855f7]' : 'text-slate-300'} disabled:opacity-50 text-left`}
                  style={{ fontFamily: 'var(--font-oswald)', fontWeight: 300 }}
                >
                  {loading ? 'Procesando...' : 'INICIAR SESIÓN'}
                  
                  <span className="absolute bottom-0 left-0 w-[150%] md:w-[200%] max-w-[300px] h-[1px] bg-slate-600/50" />
                  <span 
                    className={`absolute bottom-0 left-0 w-[150%] md:w-[200%] max-w-[300px] h-[1px] bg-gradient-to-r from-[#7e22ce] via-[#a855f7] to-[#4c1d95] transition-transform duration-500 ease-out origin-left ${isButtonHovered ? 'scale-x-100' : 'scale-x-0'}`} 
                  />
                </button>
              </div>

              {/* Animated Pill: Forgot Password */}
              <div className={`w-full flex flex-col items-center justify-center gap-6 mt-12 relative transition-all duration-500 ${tutorialStep > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button type="button" className="group relative rounded-full p-[2px] overflow-hidden flex items-center justify-center w-[250px] md:w-[300px] shadow-[0_0_15px_rgba(126,34,206,0.5)]">
                  {/* Animated background layer for the border */}
                  <div 
                    className="absolute inset-0 animate-border-sweep" 
                    style={{ 
                      backgroundImage: 'linear-gradient(90deg, #7e22ce 0%, #d8b4fe 25%, #ffffff 50%, #d8b4fe 75%, #7e22ce 100%)', 
                      backgroundSize: '200% 100%' 
                    }} 
                  />
                  
                  {/* Inner black pill to hide the center */}
                  <div className="relative bg-[#050505] rounded-full px-5 py-[8px] w-full h-full flex items-center justify-center transition-colors duration-300 group-hover:bg-[#110121]">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-slate-200 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-oswald)', fontWeight: 300 }}>
                      ¿Olvidé mi contraseña?
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </form>

          {/* Demos */}
          <div className="mt-16 pt-8 flex gap-4 opacity-30 hover:opacity-100 transition-opacity justify-start">
            {[
              { label: 'Doctor', email: 'fguzman@gmail.com', codigo_unico: 'DOC-00034' },
              { label: 'Secretario', email: 'secretario@gmail.com', codigo_unico: 'SEC-00044' },
              { label: 'Jefe', email: 'jefe@gmail.com', codigo_unico: 'JEF-SIB-10023' },
              { label: 'Ingeniero', email: 'ingeniero@gmail.com', codigo_unico: 'ING-SIB-54321' },
              { label: 'Admin', email: 'admin@gmail.com', codigo_unico: 'ADM-00005' }
            ].map(demo => (
              <button
                key={demo.label}
                type="button"
                onClick={() => setFormData({ email: demo.email, codigo_unico: demo.codigo_unico, password: 'Hospital123*' })}
                className="px-2 py-1 border-b border-slate-700 text-[9px] uppercase tracking-widest text-slate-500 hover:text-[#8b5cf6] hover:border-[#8b5cf6] transition-all"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </motion.div>
        
      </div>
    </div>
      )}
    </>
  );
}
