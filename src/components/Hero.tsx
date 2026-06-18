'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { siteConfig } from '@/siteConfig';
import { OPEN_BRIEF_FORM_EVENT } from '@/components/ScrollSections';

const heroChecks = [
  { left: '7%', top: '22%', state: 'done' },
  { left: '17%', top: '48%', state: 'idle' },
  { left: '25%', top: '28%', state: 'done' },
  { left: '35%', top: '63%', state: 'idle' },
  { left: '48%', top: '19%', state: 'live' },
  { left: '58%', top: '54%', state: 'done' },
  { left: '68%', top: '31%', state: 'idle' },
  { left: '81%', top: '47%', state: 'done' },
  { left: '91%', top: '24%', state: 'idle' },
];

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
    // Section height is 115vh, content height is 100vh -> sticky distance is 15vh.
    const stickyHeight = 0.15 * vh;
    
    // Counter-translate the header to simulate sticky behavior
    // The parent container moves UP, so we move the header DOWN
    const translateY = Math.min(currentScrollY, stickyHeight);
    
    headerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
  });

  return (
    <div className="relative min-h-[115vh] w-full overflow-hidden pointer-events-none">
      <div className="hero-background-field absolute inset-0 z-0" aria-hidden="true">
        {heroChecks.map((check) => (
          <span
            key={`${check.left}-${check.top}`}
            className={`hero-check hero-check-${check.state}`}
            style={{ left: check.left, top: check.top }}
          />
        ))}
      </div>

      {/* Main Heading Container */}
      {/* Removed 'sticky top-0' and replaced with manual transform */}
      <div 
        ref={headerRef}
        className="relative z-10 h-screen flex flex-col justify-start items-center pt-[10px] px-6 lg:px-12 will-change-transform"
      >
        <h1
          className="hero-title relative inline-block overflow-visible text-center text-[clamp(4rem,12vw,11.5rem)] font-black uppercase leading-[0.82] tracking-[0] text-[#e5e5e5] whitespace-pre-line select-none pointer-events-auto"
          data-text={siteConfig.heroHeader}
        >
          <span className="relative z-10">{siteConfig.heroHeader}</span>
        </h1>
        
        <div className="mt-10 max-w-5xl text-center pointer-events-auto lg:mt-12">
          <p className="text-base md:text-lg lg:text-xl uppercase tracking-[0.12em] md:tracking-[0.16em] text-white/80 leading-relaxed font-mono">
            {siteConfig.subtext}
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_BRIEF_FORM_EVENT))}
            className="group relative mt-7 inline-flex h-14 items-center justify-center overflow-hidden border border-white/20 bg-white px-9 text-xs font-black uppercase tracking-[0.22em] text-black transition-colors hover:border-[#FF003C] hover:bg-[#FF003C] hover:text-white"
          >
            <span className="absolute inset-y-0 left-0 w-1.5 bg-[#FF003C] transition-all group-hover:w-full" />
            <span className="relative z-10">Give us the mess</span>
          </button>
          <div className="hero-proof-field relative mx-auto mt-12 w-full max-w-4xl px-4 py-4 lg:mt-14">
            <div className="relative z-10 mx-auto flex max-w-3xl items-center justify-center gap-4 text-center">
              <span className="h-px w-10 bg-white/16" />
              <p className="text-[10px] uppercase leading-relaxed tracking-[0.24em] text-white/46 font-mono">
                {siteConfig.proofLine}
              </p>
              <span className="h-px w-10 bg-white/16" />
            </div>

            <div className="hero-proof-glass relative z-10 mx-auto mt-5 grid max-w-3xl grid-cols-2 overflow-hidden border border-white/18 bg-white/[0.075] md:grid-cols-4">
              {siteConfig.partnerPrograms.map((program) => (
                <div
                  key={program.name}
                  className="hero-proof-card relative h-14 border-white/12 bg-white/[0.045] md:h-[58px] md:border-l md:first:border-l-0"
                >
                  <Image
                    src={program.logo}
                    alt={program.name}
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 188px, 38vw"
                    className="object-contain px-5 py-3 opacity-90 saturate-125"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Plus Signs */}
      <div className="fixed top-1/2 left-[10%] -translate-x-1/2 -translate-y-1/2 text-[#FF003C]/60 z-30 font-light pointer-events-none">+</div>
      <div className="fixed top-1/2 right-[10%] -translate-x-1/2 -translate-y-1/2 text-[#FF003C]/60 z-30 font-light pointer-events-none">+</div>
    </div>
  );
}
