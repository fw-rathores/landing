'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { siteConfig } from '@/siteConfig';

export default function Hero() {
  const headerRef = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!headerRef.current) return;
    
    // Calculate scroll content offset in pixels
    // scroll.offset is 0..1, covering the entire scrollable distance
    // scroll.pages is the total height in "viewport heights"
    // The scrollable distance is (pages - 1) * view height
    const vh = window.innerHeight;
    const totalScrollDist = (scroll.pages - 1) * vh;
    const currentScrollY = scroll.offset * totalScrollDist;

    // We want the header to stick for the extra height of the section
    // Section height is 130vh, Content height is 100vh -> Sticky distance is 30vh
    const stickyHeight = 0.3 * vh;
    
    // Counter-translate the header to simulate sticky behavior
    // The parent container moves UP, so we move the header DOWN
    const translateY = Math.min(currentScrollY, stickyHeight);
    
    headerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
  });

  return (
    <div className="relative min-h-[130dvh] w-full overflow-hidden pointer-events-none">
      {/* 2px Guide Lines */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 w-full h-[2px] bg-[#FF003C]/20" />
        <div className="absolute left-[5%] lg:left-[10%] h-full w-[2px] bg-[#FF003C]/20" />
      </div>

      {/* Main Heading Container */}
      {/* Removed 'sticky top-0' and replaced with manual transform */}
      <div 
        ref={headerRef}
        className="h-[100dvh] flex flex-col justify-start items-center pt-[10px] px-4 md:px-6 lg:px-12 z-0 will-change-transform"
      >
        <h1 className="text-[13vw] lg:text-[12vw] leading-[0.85] font-black uppercase tracking-tighter text-[#e5e5e5] whitespace-pre-line select-none text-center pointer-events-auto">
          {siteConfig.heroHeader}
        </h1>
        
        <div className="mt-8 lg:mt-12 max-w-[80vw] lg:max-w-sm text-center pointer-events-auto">
          <p className="text-[10px] lg:text-xs uppercase tracking-widest text-white/50 leading-relaxed font-mono">
            {siteConfig.subtext}
          </p>
        </div>
      </div>

      {/* Decorative Plus Signs */}
      <div className="fixed top-1/2 left-[5%] lg:left-[10%] -translate-x-1/2 -translate-y-1/2 text-[#FF003C]/60 z-30 font-light pointer-events-none">+</div>
      <div className="fixed top-1/2 right-[5%] lg:right-[10%] -translate-x-1/2 -translate-y-1/2 text-[#FF003C]/60 z-30 font-light pointer-events-none">+</div>
    </div>
  );
}
