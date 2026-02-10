'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
const brands = [
  { name: 'French Avenue', logo: '/brands/fa.png', hasCaseStudy: true },
  { name: 'Street Origins', logo: '/brands/so.png', hasCaseStudy: true },
  { name: 'Fragrance World', logo: '/brands/fw.png', hasCaseStudy: false },
];

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { setDark } = React.useContext(CursorModeContext);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  useInViewport(sectionRef, (inView) => {
    setDark('capabilities', inView);
  });
  
  return (
    <section 
      ref={sectionRef}
      className="relative z-40 pointer-events-auto w-full bg-[#e8e8e8] text-black"
    >
      {/* Plus decorations */}
      <div className="absolute bottom-[30%] left-[20%] text-[#FF003C]/40 text-lg font-light pointer-events-none">+</div>
      
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 pt-24 pb-40">
        {/* Top Description */}
        <div className="max-w-3xl mb-20">
          <p className="text-lg lg:text-xl font-medium leading-relaxed mb-6">
            We are a marketing agency for the post-camera era. We treat generative media as a discipline, not a shortcut.
          </p>
          <p className="text-lg lg:text-xl font-medium leading-relaxed">
            Most AI is random; our process is deterministic. We build custom models trained specifically on your brand’s visual identity—your lighting, your textures, your composition. This gives you an 'always-on' virtual studio that delivers the consistency of a high-end photoshoot, with the scale that only software can provide.
          </p>
        </div>
        
        {/* Two Column: Image + Capabilities */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left: Image */}
          <div className="aspect-[3/4] max-w-sm overflow-hidden relative bg-black/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={siteConfig.capabilities[activeIndex].image}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={siteConfig.capabilities[activeIndex].image} 
                  alt={siteConfig.capabilities[activeIndex].name}
                  className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-500"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Right: Capabilities List */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-medium mb-8 text-black/60">
              CAPABILITIES
            </h3>
            
            <div className="space-y-0">
              {siteConfig.capabilities.map((cap, i) => (
                <div 
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`py-4 border-b border-black/15 group cursor-pointer hover:bg-black/5 transition-colors px-2 -mx-2 overflow-hidden ${activeIndex === i ? 'bg-black/5' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm lg:text-base font-medium transition-colors ${activeIndex === i ? 'text-black' : 'text-black/60'}`}>
                      {cap.name}
                    </span>
                    <span className={`text-xs font-mono transition-colors ${activeIndex === i ? 'text-black' : 'text-black/40'}`}>
                      [ {cap.number} ]
                    </span>
                  </div>
                  
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: activeIndex === i ? 'auto' : 0,
                      opacity: activeIndex === i ? 1 : 0,
                      marginTop: activeIndex === i ? 16 : 0
                    }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs lg:text-sm text-black/70 leading-relaxed max-w-sm">
                      {cap.description}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 group cursor-pointer">
              <span className="text-xs uppercase tracking-widest font-medium">START A PROJECT</span>
              <div className="mt-1 text-xl group-hover:translate-x-2 transition-transform">→</div>
            </div>
          </div>
        </div>
        
        {/* Brands Section */}
        <div className="mt-24 py-12 border-y border-black/10">
          <h3 className="text-center text-xs uppercase tracking-widest font-medium mb-12 text-black/60">
            BRANDS WORKED WITH
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-16 lg:gap-32">
            {brands.map((brand, i) => (
              <div key={i} className="relative group cursor-pointer">
                {brand.hasCaseStudy && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full mb-2">
                    <div className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Case Study
                    </div>
                    {/* Small arrow/triangle pointing down */}
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-black absolute left-1/2 -translate-x-1/2 top-full"></div>
                  </div>
                )}
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="h-12 lg:h-16 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT SECTION
// ============================================================================
const internalLinks = ['HOME', 'ABOUT US', 'PROJECTS', 'LABS', 'CONTACT', 'EASTER EGG', 'PRIVACY POLICY'];
const externalLinks = ['INSTAGRAM', 'LINKEDIN'];

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { setDark } = React.useContext(CursorModeContext);
  
  useInViewport(sectionRef, (inView) => {
    setDark('contact', inView);
  });
  
  return (
    <section 
      ref={sectionRef}
      className="relative z-40 pointer-events-auto w-full text-black overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #e8e8e8 0%, #FF003C 100%)',
      }}
    >
      {/* Plus decoration */}
      <div className="absolute top-1/2 left-[10%] text-[#FF003C]/40 text-lg font-light pointer-events-none">+</div>
      
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 pt-48 pb-8">
        {/* Main Email */}
        <div className="mb-12 relative group w-fit">
          <h2 
            onClick={() => {
              navigator.clipboard.writeText('hello@renderless.agency');
            }}
            className="text-[6vw] lg:text-[5vw] font-black leading-[0.95] tracking-tighter uppercase cursor-pointer hover:opacity-70 transition-opacity"
          >
            HELLO@RENDERLESS.AGENCY
          </h2>
          
          {/* Copy Tooltip */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap">
              Copy Mail
            </div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-black absolute left-1/2 -translate-x-1/2 top-full"></div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center border-t border-black/10 pt-8 mt-12">
          <p className="text-xs uppercase tracking-widest text-black/40">
            MADE WITH &lt;3 WORK
          </p>
          <p className="text-xs uppercase tracking-widest text-black/40">
            &copy; 2026 RENDERLESS
          </p>
        </div>
      </div>
      
      {/* 3D Figure silhouette (simplified) */}
      <div className="absolute bottom-0 right-[15%] w-64 h-96 pointer-events-none opacity-30">
        <div className="w-full h-full bg-gradient-to-t from-[#FF003C] via-[#e8e8e8] to-transparent rounded-t-full"></div>
      </div>
    </section>
  );
}
