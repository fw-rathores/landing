'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { siteConfig } from '@/siteConfig';

// Hook to detect when a section is in viewport and trigger dark mode for cursor
function useInViewport(ref: React.RefObject<HTMLElement | null>, callback: (inView: boolean) => void) {
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting && entry.intersectionRatio > 0.3);
      },
      { threshold: [0, 0.3, 0.5, 0.7, 1] }
    );
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, callback]);
}

// Context to share dark mode state globally
export const CursorModeContext = React.createContext<{
  isDark: boolean;
  setDark: (id: string, isDark: boolean) => void;
}>({
  isDark: false,
  setDark: () => {},
});

export function CursorModeProvider({ children }: { children: React.ReactNode }) {
  const [darkSections, setDarkSections] = useState<Set<string>>(new Set());
  
  const setDark = (id: string, isDark: boolean) => {
    setDarkSections(prev => {
      const next = new Set(prev);
      if (isDark) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };
  
  return (
    <CursorModeContext.Provider value={{ isDark: darkSections.size > 0, setDark }}>
      {children}
    </CursorModeContext.Provider>
  );
}

// ============================================================================
// CAPABILITIES SECTION
// ============================================================================
export const OPEN_BRIEF_FORM_EVENT = 'renderless:open-brief-form';

function SectionKicker({ children, tone = 'dark' }: { children: React.ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <p className={`text-[10px] uppercase tracking-[0.28em] font-mono ${tone === 'light' ? 'text-white/45' : 'text-black/50'}`}>
      {children}
    </p>
  );
}

type LeadFormState = {
  name: string;
  company: string;
  email: string;
  countryCode: string;
  phone: string;
  message: string;
};

type LeadFormStatus = 'idle' | 'loading' | 'success' | 'error';
type CatMood = 'idle' | 'angry' | 'happy' | 'sending';

const countryCodes = [
  { value: '+91', label: 'IN +91' },
  { value: '+1', label: 'US +1' },
  { value: '+44', label: 'UK +44' },
  { value: '+971', label: 'UAE +971' },
  { value: '+966', label: 'SA +966' },
  { value: '+33', label: 'FR +33' },
];

const initialLeadForm: LeadFormState = {
  name: '',
  company: '',
  email: '',
  countryCode: '+91',
  phone: '',
  message: '',
};

type LeadFormModalProps = {
  form: LeadFormState;
  status: LeadFormStatus;
  error: string;
  isOpen: boolean;
  onClose: () => void;
  onFieldChange: (field: keyof LeadFormState, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function CursorCat({ eye, mood }: { eye: { x: number; y: number }; mood: CatMood }) {
  const isAngry = mood === 'angry';
  const isHappy = mood === 'happy';
  const isSending = mood === 'sending';
  const pupilColor = isAngry ? '#e8e8e8' : '#FF003C';
  const pupilX = clamp(eye.x, -14, 14);
  const pupilY = clamp(eye.y, -9, 9);

  return (
    <motion.div
      data-cursor-cat
      className="relative h-40 w-48 shrink-0"
      animate={isAngry ? { x: [-3, 3, -2, 2, 0] } : isHappy ? { y: [0, -4, 0] } : isSending ? { y: [0, -2, 0] } : { x: 0, y: 0 }}
      transition={isAngry ? { duration: 0.2, repeat: 2 } : isSending ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.35 }}
    >
      <div className="absolute left-4 top-8 h-28 w-40 border border-white/10 bg-[#111]/70" />
      <motion.svg
        viewBox="0 0 220 178"
        className="absolute inset-0 h-full w-full overflow-visible"
        animate={isHappy ? { rotate: [-1, 1.5, -1] } : { rotate: 0 }}
        transition={{ duration: 0.8, repeat: isHappy ? Infinity : 0, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <motion.path
          d="M158 105 C206 100 203 45 165 62"
          fill="none"
          stroke="#FF003C"
          strokeWidth="10"
          strokeLinecap="square"
          animate={isHappy || isSending ? { pathLength: [0.78, 1, 0.82], opacity: [0.55, 1, 0.55] } : { pathLength: 1, opacity: 0.72 }}
          transition={{ duration: 0.9, repeat: isHappy || isSending ? Infinity : 0, ease: 'easeInOut' }}
        />
        <motion.path
          d="M62 39 L78 7 L91 43"
          fill={isAngry ? '#FF003C' : '#222832'}
          stroke="#e8e8e8"
          strokeOpacity="0.28"
          strokeWidth="2"
          animate={isAngry ? { y: [-1, 1, -1] } : { y: 0 }}
          transition={{ duration: 0.2, repeat: isAngry ? 4 : 0 }}
        />
        <motion.path
          d="M129 43 L144 7 L161 39"
          fill={isAngry ? '#FF003C' : '#222832'}
          stroke="#e8e8e8"
          strokeOpacity="0.28"
          strokeWidth="2"
          animate={isAngry ? { y: [1, -1, 1] } : { y: 0 }}
          transition={{ duration: 0.2, repeat: isAngry ? 4 : 0 }}
        />
        <path d="M70 36 L78 19 L84 39" fill="#FF003C" opacity="0.62" />
        <path d="M138 39 L145 19 L154 36" fill="#FF003C" opacity="0.62" />
        <path
          d="M47 41 H169 L185 86 L161 145 H61 L33 87 Z"
          fill={isAngry ? '#260910' : '#121a23'}
          stroke={isAngry ? '#FF003C' : '#e8e8e8'}
          strokeOpacity={isAngry ? 0.9 : 0.22}
          strokeWidth="2"
        />
        {isSending && (
          <motion.rect
            x="34"
            y="41"
            width="18"
            height="104"
            fill="#FF003C"
            opacity="0.2"
            initial={{ x: 34 }}
            animate={{ x: 168 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
        <path d="M47 41 H169" stroke="#FF003C" strokeOpacity="0.6" strokeWidth="2" />
        <rect x="61" y="71" width="43" height="36" fill={isAngry ? '#FF003C' : '#f2f2f2'} />
        <rect x="116" y="71" width="43" height="36" fill={isAngry ? '#FF003C' : '#f2f2f2'} />
        <motion.g
          animate={{ x: pupilX, y: pupilY }}
          transition={{ type: 'spring', stiffness: 520, damping: 24, mass: 0.35 }}
        >
          <rect x="77" y="76" width="15" height="26" fill={pupilColor} />
          <rect x="131" y="76" width="15" height="26" fill={pupilColor} />
        </motion.g>
        <rect x="63" y="73" width="39" height="4" fill="#000" opacity="0.14" />
        <rect x="118" y="73" width="39" height="4" fill="#000" opacity="0.14" />
        <motion.path
          d={isAngry ? 'M57 63 L104 73 M113 73 L163 62' : 'M58 63 H104 M116 63 H162'}
          stroke="#FF003C"
          strokeWidth={isAngry ? '5' : '3'}
          strokeLinecap="square"
          animate={isAngry ? { opacity: [1, 0.55, 1] } : { opacity: 0.85 }}
          transition={{ duration: 0.18, repeat: isAngry ? 5 : 0 }}
        />
        <path d="M103 113 L111 105 L119 113 L111 121 Z" fill="#FF003C" />
        <path
          d={isHappy ? 'M87 123 C102 139 122 139 138 123' : isAngry ? 'M91 132 H132' : 'M94 126 C106 132 118 132 130 126'}
          fill="none"
          stroke="#e8e8e8"
          strokeOpacity={isAngry ? 0.45 : 0.62}
          strokeWidth="2"
          strokeLinecap="square"
        />
        <path d="M51 105 H12 M52 115 H17 M166 105 H207 M165 115 H202" stroke="#e8e8e8" strokeOpacity="0.44" strokeWidth="2" />
        <path d="M58 143 H92 V164 H58 Z M128 143 H162 V164 H128 Z" fill="#101010" stroke="#e8e8e8" strokeOpacity="0.18" strokeWidth="2" />
        <path d="M45 169 H173" stroke="#FF003C" strokeOpacity="0.8" strokeWidth="2" />
      </motion.svg>
      <div className="absolute -right-1 top-4 border border-[#FF003C] bg-[#FF003C] px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-black">
        optical cat
      </div>
    </motion.div>
  );
}

function LeadFormModal({
  form,
  status,
  error,
  isOpen,
  onClose,
  onFieldChange,
  onSubmit,
}: LeadFormModalProps) {
  const [catEye, setCatEye] = useState({ x: 0, y: 0 });
  const [catMood, setCatMood] = useState<CatMood>('idle');
  const activeCatMood = status === 'loading' ? 'sending' : catMood;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseMove={(event) => {
            const cat = event.currentTarget.querySelector('[data-cursor-cat]');
            const rect = cat?.getBoundingClientRect();
            const closeButton = event.currentTarget.querySelector('[data-modal-close]');
            const submitButton = event.currentTarget.querySelector('[data-modal-submit]');
            const closeRect = closeButton?.getBoundingClientRect();
            const submitRect = submitButton?.getBoundingClientRect();

            if (status !== 'loading') {
              const isOverClose = closeRect
                ? event.clientX >= closeRect.left &&
                  event.clientX <= closeRect.right &&
                  event.clientY >= closeRect.top &&
                  event.clientY <= closeRect.bottom
                : false;
              const isOverSubmit = submitRect
                ? event.clientX >= submitRect.left &&
                  event.clientX <= submitRect.right &&
                  event.clientY >= submitRect.top &&
                  event.clientY <= submitRect.bottom
                : false;

              setCatMood(isOverClose ? 'angry' : isOverSubmit ? 'happy' : 'idle');
            }

            if (!rect) return;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            setCatEye({
              x: clamp((event.clientX - centerX) / 16, -14, 14),
              y: clamp((event.clientY - centerY) / 20, -9, 9),
            });
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-form-title"
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-white/14 bg-[#242424] text-[#e8e8e8] shadow-2xl"
            initial={{ opacity: 0, y: 28, scale: 0.97, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              data-modal-close
              onClick={onClose}
              onMouseEnter={() => setCatMood('angry')}
              onMouseLeave={() => setCatMood('idle')}
              onPointerEnter={() => setCatMood('angry')}
              onPointerLeave={() => setCatMood('idle')}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/15 text-xl leading-none text-white/70 transition-colors hover:border-[#FF003C] hover:text-white"
              aria-label="Close brief form"
            >
              ×
            </button>

            <div className="relative grid gap-8 p-6 lg:grid-cols-[0.72fr_1.28fr] lg:p-8">
              <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                <div>
                  <SectionKicker tone="light">Brief intake / tiny cat supervisor</SectionKicker>
                  <h3 id="lead-form-title" className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-tighter lg:text-6xl">
                    Feed the work stack.
                  </h3>
                  <p className="mt-5 text-base font-medium leading-relaxed text-white/58">
                    Drop the brand lore, deadline pressure, tool pile, and that one task that keeps ricocheting between people. We will paw through it and send back the fastest first move.
                  </p>
                </div>

                <div className="flex items-end justify-between gap-6">
                  <CursorCat eye={catEye} mood={activeCatMood} />
                  <div className="hidden text-right text-[10px] uppercase tracking-[0.22em] text-white/32 sm:block">
                    <p>
                      {activeCatMood === 'angry' && 'Exit paw detected'}
                      {activeCatMood === 'happy' && 'Send button purrs'}
                      {activeCatMood === 'sending' && 'Sorting the stack'}
                      {activeCatMood === 'idle' && 'Cat tracks cursor'}
                    </p>
                    <p className="mt-2 text-[#FF003C]">
                      {activeCatMood === 'angry' ? 'Stay for one more line' : activeCatMood === 'happy' ? 'Ready to pounce' : activeCatMood === 'sending' ? 'Whiskers working' : 'No dashboard treats'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-mono text-white/40">Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => onFieldChange('name', event.target.value)}
                    className="h-12 border border-white/12 bg-black/10 px-3 text-base font-medium text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FF003C]"
                    placeholder="Your name"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-mono text-white/40">Company</span>
                  <input
                    required
                    value={form.company}
                    onChange={(event) => onFieldChange('company', event.target.value)}
                    className="h-12 border border-white/12 bg-black/10 px-3 text-base font-medium text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FF003C]"
                    placeholder="Brand / company"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-mono text-white/40">Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => onFieldChange('email', event.target.value)}
                    className="h-12 border border-white/12 bg-black/10 px-3 text-base font-medium text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FF003C]"
                    placeholder="you@brand.com"
                  />
                </label>

                <div className="grid gap-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-mono text-white/40">Phone</span>
                  <div className="grid grid-cols-[112px_1fr]">
                    <select
                      value={form.countryCode}
                      onChange={(event) => onFieldChange('countryCode', event.target.value)}
                      className="h-12 border border-r-0 border-white/12 bg-[#242424] px-3 text-sm font-medium text-white outline-none transition-colors focus:border-[#FF003C]"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.phone}
                      onChange={(event) => onFieldChange('phone', event.target.value)}
                      className="h-12 min-w-0 border border-white/12 bg-black/10 px-3 text-base font-medium text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FF003C]"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <label className="grid gap-2 lg:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-mono text-white/40">Message</span>
                  <textarea
                    required
                    value={form.message}
                    onChange={(event) => onFieldChange('message', event.target.value)}
                    className="min-h-36 resize-y border border-white/12 bg-black/10 px-3 py-3 text-base font-medium leading-relaxed text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FF003C]"
                    placeholder="What needs shipping, what keeps wobbling, and who is currently holding the ball of yarn?"
                  />
                </label>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-5 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between">
                  <p className="min-h-5 text-xs font-medium text-white/48">
                    {status === 'loading' && 'The cat is dragging your brief into the operating loop...'}
                    {status === 'success' && 'Brief sent. We will reply with the fastest first workflow.'}
                    {status === 'error' && error}
                  </p>
                  <button
                    type="submit"
                    data-modal-submit
                    disabled={status === 'loading'}
                    onMouseEnter={() => setCatMood('happy')}
                    onMouseLeave={() => setCatMood('idle')}
                    onPointerEnter={() => setCatMood('happy')}
                    onPointerLeave={() => setCatMood('idle')}
                    className="relative inline-flex h-12 items-center justify-center overflow-hidden border border-white bg-[#e8e8e8] px-6 text-xs font-black uppercase tracking-[0.18em] text-black transition-colors hover:border-[#FF003C] hover:bg-[#FF003C] hover:text-white disabled:cursor-wait disabled:border-white/20 disabled:bg-white/20 disabled:text-white/45"
                  >
                    {status === 'loading' && (
                      <motion.span
                        className="absolute inset-y-0 left-0 w-10 bg-white/30"
                        initial={{ x: -48 }}
                        animate={{ x: 170 }}
                        transition={{ duration: 0.72, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1">
                      {status === 'loading' ? 'Sending' : 'Send brief'}
                      {status === 'loading' && (
                        <span className="inline-flex w-5 justify-start">
                          <motion.span
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          >
                            ...
                          </motion.span>
                        </span>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reboundRef = useRef<HTMLDivElement>(null);
  const catPanelArmedAtRef = useRef<number | null>(null);
  const catHasDiedRef = useRef(false);
  const catSnapTimeoutsRef = useRef<number[]>([]);
  const lastCatSnapAtRef = useRef(0);
  const { setDark } = React.useContext(CursorModeContext);
  const [openCapability, setOpenCapability] = useState('01');
  const [leadForm, setLeadForm] = useState<LeadFormState>(initialLeadForm);
  const [leadStatus, setLeadStatus] = useState<LeadFormStatus>('idle');
  const [leadError, setLeadError] = useState('');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isCatDead, setIsCatDead] = useState(false);
  
  useInViewport(sectionRef, (inView) => {
    setDark('capabilities', inView);
  });

  useEffect(() => {
    const openFromExternalCta = () => setIsLeadFormOpen(true);

    window.addEventListener(OPEN_BRIEF_FORM_EVENT, openFromExternalCta);
    return () => window.removeEventListener(OPEN_BRIEF_FORM_EVENT, openFromExternalCta);
  }, []);

  useEffect(() => {
    const reboundNode = reboundRef.current;

    if (!reboundNode) return;

    const getScrollContainers = () => {
      const scrollNodes = Array.from(document.querySelectorAll<HTMLElement>('div')).filter((node) => {
        const style = window.getComputedStyle(node);
        return /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 100;
      });
      const documentScroller = document.scrollingElement as HTMLElement | null;

      return Array.from(new Set([...scrollNodes, ...(documentScroller ? [documentScroller] : [])]));
    };

    const snapBackToFooter = () => {
      const align = (behavior: ScrollBehavior) => {
        getScrollContainers().forEach((scrollNode) => {
          const reboundRect = reboundNode.getBoundingClientRect();
          const scrollRect = scrollNode.getBoundingClientRect();
          const viewportBottom = scrollRect.top + scrollNode.clientHeight;
          const targetTop = scrollNode.scrollTop + reboundRect.top - viewportBottom - 10;
          const maxTop = scrollNode.scrollHeight - scrollNode.clientHeight;
          const clampedTop = Math.min(Math.max(targetTop, 0), maxTop);

          scrollNode.scrollTo({ top: clampedTop, behavior });
          if (behavior === 'auto') {
            scrollNode.scrollTop = clampedTop;
          }
        });
      };

      align('smooth');
      [320, 760, 1320].forEach((delay) => {
        const timeoutId = window.setTimeout(() => align('auto'), delay);
        catSnapTimeoutsRef.current.push(timeoutId);
      });
    };

    const queueSnapBackToFooter = (delay = 0) => {
      const now = Date.now();

      if (now - lastCatSnapAtRef.current < 700) return;

      lastCatSnapAtRef.current = now;
      const timeoutId = window.setTimeout(snapBackToFooter, delay);
      catSnapTimeoutsRef.current.push(timeoutId);
    };

    const handleCuriosity = (event?: Event) => {
      const rect = reboundNode.getBoundingClientRect();
      const visiblePx = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const isScrollIntent = event?.type === 'wheel' || event?.type === 'touchmove';

      if (visiblePx < 80) {
        catPanelArmedAtRef.current = null;
        return;
      }

      const now = Date.now();
      if (!catPanelArmedAtRef.current) {
        catPanelArmedAtRef.current = now;
        return;
      }

      if (!isScrollIntent) return;

      if (!catHasDiedRef.current && now - catPanelArmedAtRef.current > 450) {
        catHasDiedRef.current = true;
        setIsCatDead(true);
        queueSnapBackToFooter(560);
        return;
      }

      if (catHasDiedRef.current && now - catPanelArmedAtRef.current > 180) {
        queueSnapBackToFooter(140);
      }
    };

    const scrollNodes = getScrollContainers();

    window.addEventListener('scroll', handleCuriosity, true);
    window.addEventListener('wheel', handleCuriosity, true);
    window.addEventListener('touchmove', handleCuriosity, true);
    scrollNodes.forEach((scrollNode) => {
      scrollNode.addEventListener('scroll', handleCuriosity, { passive: true });
      scrollNode.addEventListener('wheel', handleCuriosity, { passive: true });
    });
    handleCuriosity();

    return () => {
      window.removeEventListener('scroll', handleCuriosity, true);
      window.removeEventListener('wheel', handleCuriosity, true);
      window.removeEventListener('touchmove', handleCuriosity, true);
      scrollNodes.forEach((scrollNode) => {
        scrollNode.removeEventListener('scroll', handleCuriosity);
        scrollNode.removeEventListener('wheel', handleCuriosity);
      });
      catSnapTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      catSnapTimeoutsRef.current = [];
    };
  }, []);

  const updateLeadForm = (field: keyof LeadFormState, value: string) => {
    setLeadForm((current) => ({ ...current, [field]: value }));
    if (leadStatus !== 'idle') {
      setLeadStatus('idle');
      setLeadError('');
    }
  };

  const submitLeadForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadStatus('loading');
    setLeadError('');
    const startedAt = Date.now();
    const keepSendingVisible = async () => {
      const remaining = 850 - (Date.now() - startedAt);

      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }
    };

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? 'Could not send the brief.');
      }

      await keepSendingVisible();
      setLeadStatus('success');
      setLeadForm(initialLeadForm);
    } catch (error) {
      await keepSendingVisible();
      setLeadStatus('error');
      setLeadError(error instanceof Error ? error.message : 'Could not send the brief.');
    }
  };

  const openBriefForm = () => {
    setIsLeadFormOpen(true);
  };
  
  return (
    <section 
      ref={sectionRef}
      className="relative z-40 pointer-events-auto w-full bg-[#e8e8e8] text-black"
    >
      {/* Plus decorations */}
      <div className="absolute bottom-[30%] left-[20%] text-[#FF003C]/40 text-lg font-light pointer-events-none">+</div>
      
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 pt-0 pb-0">
        <div className="relative left-1/2 mb-24 w-screen -translate-x-1/2 overflow-hidden bg-[#242424] text-[#e8e8e8]">
          <div className="mx-auto max-w-[1400px] px-8 py-14 lg:px-16 lg:py-16">
          <div className="max-w-6xl">
            <SectionKicker tone="light">The coordination tax</SectionKicker>
            <p className="mt-6 max-w-6xl text-3xl lg:text-[3.4rem] xl:text-6xl font-black leading-[0.92] tracking-tighter uppercase mb-10">
            You do not have an ideas problem. You have a coordination problem.
            </p>
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
              <div>
                <p className="text-sm lg:text-base uppercase tracking-[0.18em] font-mono text-[#CCFF00]">
                  What actually happens
                </p>
                <p className="mt-5 text-base lg:text-xl font-medium leading-relaxed text-white/78">
                  Your team knows the next moves: more creatives, better influencer research, sharper ad tests, social listening, dashboards, SKU decisions.
                </p>
                <p className="mt-5 text-base lg:text-xl font-medium leading-relaxed text-white/58">
                  But every piece lives with a different agency, freelancer, tool, spreadsheet, or WhatsApp thread. The founder becomes the human router.
                </p>
              </div>

              <div>
                <p className="text-sm lg:text-base uppercase tracking-[0.18em] font-mono text-[#CCFF00]">
                  Enter Renderless
                </p>
                <p className="mt-5 text-base lg:text-xl font-medium leading-relaxed text-white/84">
                  Renderless absorbs that coordination. We use internal AI systems to generate assets, research creators, monitor the market, connect performance data, and turn it into decisions.
                </p>
                <p className="mt-5 text-base lg:text-xl font-medium leading-relaxed text-white/62">
                  You get finished work and clear recommendations, not another platform to operate or another vendor to manage.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="mb-28">
          <div className="mb-8">
            <div className="max-w-4xl">
              <SectionKicker>What we ship</SectionKicker>
              <h3 className="mt-4 text-3xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
                Work we take off your plate.
              </h3>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.38fr)] lg:items-start lg:gap-12">
            <div className="border-y border-black/10">
              {siteConfig.capabilities.map((cap) => {
                const isOpen = openCapability === cap.number;

                return (
                <article
                  key={cap.number}
                  className="border-b border-black/10 transition-colors last:border-b-0 hover:bg-white/30"
                >
                  <button
                    type="button"
                    onClick={() => setOpenCapability(isOpen ? '' : cap.number)}
                    className="grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-5 text-left sm:gap-5"
                  >
                    <span className="text-xs font-mono text-[#FF003C]">
                      [ {cap.number} ]
                    </span>
                    <h4 className="min-w-0 break-words text-2xl font-black uppercase leading-none tracking-tighter lg:text-4xl">
                      {cap.name}
                    </h4>
                    <span className="w-12 shrink-0 text-right font-mono text-sm tracking-[0.18em] text-[#FF003C] lg:w-14 lg:text-base">
                      [ {isOpen ? '-' : '+'} ]
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`${cap.number}-content`}
                        initial={{ height: 0, opacity: 0, y: -8, filter: 'blur(4px)' }}
                        animate={{ height: 'auto', opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ height: 0, opacity: 0, y: -8, filter: 'blur(4px)' }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <motion.p
                          initial={{ x: -12 }}
                          animate={{ x: 0 }}
                          exit={{ x: -12 }}
                          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                          className="max-w-3xl pb-7 pl-12 text-base lg:text-lg font-medium leading-relaxed text-black/70"
                        >
                          {cap.description}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
                );
              })}
            </div>

            <aside className="lg:sticky lg:top-10">
              <div className="mx-auto aspect-[9/16] w-full max-w-[330px] overflow-hidden border border-black/15 bg-[#242424] text-[#e8e8e8] lg:mx-0 lg:ml-auto">
                <div
                  className="relative h-full"
                  style={{
                    backgroundImage:
                      'linear-gradient(#e8e8e814 1px, transparent 1px), linear-gradient(90deg, #e8e8e814 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                >
                  <div className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
                    <span className="h-2 w-2 rounded-full bg-[#FF003C]" />
                    Reel placeholder
                  </div>
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/8">
                      <div className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                    </div>
                    <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                      Offerings explainer / 9:16
                    </p>
                  </div>
                  <div className="absolute inset-x-4 bottom-4 border-t border-white/10 pt-4">
                    <p className="text-sm font-medium leading-relaxed text-white/70">
                      Static reel slot for the founder walkthrough of everything Renderless can ship.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="relative left-1/2 mb-24 w-screen -translate-x-1/2 bg-[#242424] text-[#e8e8e8]">
          <div className="mx-auto max-w-[1400px] px-8 py-16 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <SectionKicker tone="light">Selected work</SectionKicker>
              <h3 className="mt-4 text-3xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
                Work done so far.
              </h3>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/55">
              Client details stay compressed, but the shape is clear: one-off work expands into retained growth infrastructure.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {siteConfig.caseStudies.map((study) => (
              <article key={study.brand} className="border border-white/10 bg-white/[0.03]">
                <div className="relative flex h-44 items-center justify-center border-b border-white/10 bg-white/[0.045] p-5 lg:h-52">
                  <Image
                    src={study.logo}
                    alt={`${study.brand} logo`}
                    fill
                    sizes="(min-width: 1024px) 28vw, calc(100vw - 64px)"
                    className="object-contain p-5 opacity-100 grayscale invert contrast-125"
                    unoptimized
                  />
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-mono text-[#FF003C] mb-4">
                    {study.label}
                  </p>
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-4">
                    {study.brand}
                  </h4>
                  <p className="text-sm leading-relaxed text-white/60">
                    {study.result}
                  </p>
                  <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                    {study.work.map((item) => (
                      <p key={item} className="py-3 text-xs uppercase tracking-[0.12em] text-white/50">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        </div>

        <div className="mb-24">
          <SectionKicker>Video testimonials</SectionKicker>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {siteConfig.testimonials.map((item) => (
              <article key={`${item.name}-${item.company}`} className="grid border border-black/10 bg-[#efefef] sm:grid-cols-[0.8fr_1fr]">
                <div className="relative aspect-video overflow-hidden bg-black sm:aspect-auto">
                  <Image
                    src={item.thumbnail}
                    alt={`${item.company} video testimonial placeholder`}
                    fill
                    sizes="(min-width: 1024px) 20vw, calc(50vw - 40px)"
                    className="object-cover grayscale opacity-60"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/50">
                    <div className="ml-1 h-0 w-0 border-y-[9px] border-l-[14px] border-y-transparent border-l-white" />
                  </div>
                  <div className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.2em] text-white/70 font-mono">
                    {item.type}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-2xl font-black uppercase tracking-tighter">{item.company}</h4>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.22em] font-mono text-[#FF003C]">
                    {item.name}
                  </p>
                  <p className="mt-8 text-sm leading-relaxed text-black/60">
                    {item.note}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="border-y border-black/10 py-14">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <SectionKicker>The secret sauce</SectionKicker>
              <h3 className="mt-6 text-3xl lg:text-6xl font-black uppercase tracking-tighter leading-none">
                We get better because your data stays in the loop.
              </h3>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={openBriefForm}
                className="mt-8 inline-flex h-12 items-center justify-center border border-black bg-black px-6 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-[#FF003C] hover:bg-[#FF003C]"
              >
                Throw it in
              </button>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {siteConfig.dataAdvantage.map((point, i) => (
                <div key={point} className="grid gap-4 py-5 sm:grid-cols-[2rem_1fr] sm:items-center sm:gap-5">
                  <span className="text-right text-xs font-mono tabular-nums leading-none text-[#FF003C]">
                    0{i + 1}
                  </span>
                  <p className="text-base lg:text-lg font-medium leading-relaxed text-black/70">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#242424] text-[#e8e8e8]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
              backgroundSize: '72px 72px, 36px 36px, 19px 19px',
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_86%_72%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(0,0,0,0)_44%,rgba(0,0,0,0.16))]" />
          <div className="absolute left-0 top-0 h-px w-full bg-white/18" />
          <div className="relative mx-auto max-w-[1400px] px-8 py-12 lg:px-16 lg:py-16">
            <div className="border-y border-white/10 py-8">
              <SectionKicker tone="light">Dictionary / post-camera growth</SectionKicker>
              <div className="mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div>
                  <div>
                    <h2 className="text-5xl font-black lowercase leading-[0.82] tracking-tighter md:text-7xl lg:text-8xl">
                      renderless
                    </h2>
                    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white/58 sm:text-xs">
                      <span className="text-white/82">noun / verb</span>
                      <span className="h-px w-7 bg-white/18" aria-hidden="true" />
                      <span>ren-der-less</span>
                      <span className="h-px w-7 bg-white/18" aria-hidden="true" />
                      <span className="normal-case tracking-[0.14em]">/ ren-der-ləs /</span>
                    </p>
                  </div>
                  <p className="mt-8 max-w-lg text-base font-medium leading-relaxed text-white/68 lg:text-lg">
                    The move from shoot-dependent growth to an AI-native operating loop where the work ships before coordination turns into a full-time job.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={openBriefForm}
                      className="inline-flex h-12 items-center justify-center border border-white bg-[#e8e8e8] px-6 text-xs font-black uppercase tracking-[0.18em] text-black transition-colors hover:border-white hover:bg-transparent hover:text-white"
                    >
                      Contact us
                    </button>
                    <a
                      href="mailto:hello@renderless.agency"
                      className="inline-flex h-12 items-center justify-center border border-white/15 bg-white/[0.025] px-6 text-xs font-black uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white hover:text-white"
                    >
                      hello@renderless.agency
                    </a>
                  </div>
                </div>

                <div>
                  <div className="divide-y divide-white/10 border-y border-white/10">
                    {[
                      'The post-camera growth mode for D2C brands: creative output, creator research, market listening, dashboards, and weekly decisions from one loop.',
                      'A way to collapse agencies, freelancers, tools, spreadsheets, and WhatsApp threads into finished work your team can use.',
                      'Usage: We went renderless and shipped the SKU before the old production plan got approved.',
                    ].map((definition, index) => (
                      <div key={definition} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-5 py-5">
                        <span className="pt-2 text-right font-mono text-xs font-black leading-none tabular-nums text-white/55">
                          0{index + 1}
                        </span>
                        <p className="text-base font-medium leading-relaxed text-white/72 lg:text-lg">
                          {definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-6 text-[10px] uppercase tracking-[0.22em] text-white/36 md:grid-cols-3">
              <p>Renderless / AI-native growth team</p>
              <p className="md:text-center">D2C fragrance and consumer brands</p>
              <p className="md:text-right">2026 / built for shipped work</p>
            </div>
          </div>
        </footer>

        <motion.div
          ref={reboundRef}
          className="relative left-1/2 min-h-[70vh] w-screen -translate-x-1/2 overflow-hidden bg-[#FF003C] text-white"
          animate={isCatDead ? { y: 0 } : { y: 0 }}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.24]"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(0,0,0,0.18) 1px, transparent 1px), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
              backgroundSize: '56px 56px, 18px 18px',
            }}
          />
          <div className="relative mx-auto flex min-h-[70vh] max-w-[1400px] items-center justify-center px-8 py-10 lg:px-16">
            <motion.p
              className="absolute inset-x-4 top-8 z-10 whitespace-nowrap text-center text-3xl font-black uppercase leading-none tracking-tighter text-black sm:text-4xl md:text-5xl lg:top-12 lg:text-6xl"
              animate={isCatDead ? { opacity: [0.5, 1], y: [6, 0] } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {isCatDead ? 'Curiosity killed the cat.' : 'Curiosity will kill the cat.'}
            </motion.p>
            <motion.div
              className="relative h-[430px] w-full max-w-[860px] origin-center"
              animate={isCatDead ? { rotate: 180, y: 28, scale: 0.9 } : { rotate: 0, y: 0, scale: 1 }}
              transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 520 260" className="absolute inset-0 h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="catBlackFur" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#252b31" />
                    <stop offset="52%" stopColor="#050608" />
                    <stop offset="100%" stopColor="#16191f" />
                  </linearGradient>
                  <filter id="catShadow" x="-20%" y="-20%" width="140%" height="150%">
                    <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#000000" floodOpacity="0.24" />
                  </filter>
                </defs>

                <motion.path
                  d="M86 178 C18 165 20 90 82 94 C126 97 116 149 81 138"
                  fill="none"
                  stroke="#111419"
                  strokeWidth="24"
                  strokeLinecap="round"
                  animate={isCatDead ? { pathLength: 0.9, opacity: 0.7 } : { pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
                />
                <path
                  d="M126 116 C142 70 202 48 278 55 C356 62 416 101 423 159 C431 222 361 245 256 238 C164 232 101 190 126 116 Z"
                  fill="url(#catBlackFur)"
                  filter="url(#catShadow)"
                />
                <path d="M164 75 L183 18 L216 68" fill="#090b0e" stroke="#313941" strokeWidth="3" />
                <path d="M309 66 L352 20 L361 90" fill="#090b0e" stroke="#313941" strokeWidth="3" />
                <path d="M178 62 L186 36 L202 66" fill="#FF003C" opacity="0.42" />
                <path d="M326 66 L349 42 L353 79" fill="#FF003C" opacity="0.42" />
                <path
                  d="M161 70 C186 36 267 28 326 56 C372 78 387 136 358 172 C325 213 221 215 174 176 C139 147 137 101 161 70 Z"
                  fill="#0b0d10"
                  stroke="#343c43"
                  strokeWidth="3"
                />
                {isCatDead ? (
                  <g>
                    <path d="M199 99 L244 124 M244 99 L199 124 M304 99 L349 124 M349 99 L304 124" stroke="#e8e8e8" strokeWidth="7" strokeLinecap="square" />
                    <path d="M190 88 H256 M292 88 H360" stroke="#FF003C" strokeWidth="8" strokeLinecap="square" opacity="0.72" />
                  </g>
                ) : (
                  <>
                    <path d="M194 113 L255 94 L240 126 L202 121 Z" fill="#e8e8e8" />
                    <path d="M294 95 L356 114 L347 122 L308 126 Z" fill="#e8e8e8" />
                    <path d="M217 104 L226 122 M326 104 L319 123" stroke="#FF003C" strokeWidth="6" strokeLinecap="square" />
                    <path d="M186 88 L257 108 M292 108 L363 87" stroke="#FF003C" strokeWidth="10" strokeLinecap="square" />
                    <g>
                      <rect x="220" y="104" width="10" height="19" fill="#FF003C" />
                      <rect x="322" y="105" width="10" height="19" fill="#FF003C" />
                    </g>
                  </>
                )}
                <path d="M268 136 L282 124 L296 136 L281 148 Z" fill="#FF003C" />
                {isCatDead ? (
                  <path d="M256 160 C270 166 296 166 310 160" fill="none" stroke="#e8e8e8" strokeOpacity="0.38" strokeWidth="3" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M250 158 C266 147 297 147 315 158 L303 180 H262 Z" fill="#140307" stroke="#e8e8e8" strokeOpacity="0.4" strokeWidth="3" />
                    <path d="M268 158 L275 174 L282 158 M292 158 L299 174 L306 158" fill="none" stroke="#e8e8e8" strokeWidth="3" strokeLinecap="square" />
                  </>
                )}
                <path d="M168 137 H96 M170 151 H105 M356 137 H441 M354 151 H431" stroke="#e8e8e8" strokeOpacity="0.42" strokeWidth="3" />

                <motion.g
                  animate={isCatDead ? { rotate: 16, y: 28, x: 22 } : { rotate: -8, y: 0, x: 0 }}
                  transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: '335px 176px' }}
                >
                  <path d="M324 173 C357 136 399 102 437 82" fill="none" stroke="#111419" strokeWidth="24" strokeLinecap="round" />
                  <path d="M426 75 C447 62 466 69 471 86 C478 110 448 124 424 108 C409 98 410 84 426 75 Z" fill="#090b0e" stroke="#343c43" strokeWidth="3" />
                  <path d="M422 78 C439 70 459 75 470 88" fill="none" stroke="#FF003C" strokeOpacity="0.9" strokeWidth="5" strokeLinecap="round" />
                  <path d="M430 78 L427 102 M447 73 L444 105 M464 82 L454 106" stroke="#e8e8e8" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
                </motion.g>

                <path d="M167 219 C190 238 228 243 268 242 C312 241 355 234 381 215" fill="none" stroke="#343c43" strokeWidth="3" strokeLinecap="round" />
                <path d="M181 210 H238 V245 H181 Z M310 208 H367 V244 H310 Z" fill="#070809" stroke="#343c43" strokeWidth="3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <LeadFormModal
        form={leadForm}
        status={leadStatus}
        error={leadError}
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        onFieldChange={updateLeadForm}
        onSubmit={submitLeadForm}
      />
    </section>
  );
}
