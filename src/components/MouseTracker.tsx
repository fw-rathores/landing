"use client";
import React, { useEffect, useRef, useContext } from 'react';
import { CursorModeContext } from './ScrollSections';

export default function MouseTracker() {
  const vLineRef = useRef<HTMLDivElement>(null);
  const hLineRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  const { isDark } = useContext(CursorModeContext);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (vLineRef.current) vLineRef.current.style.transform = `translateX(${e.clientX}px)`;
      if (hLineRef.current) hLineRef.current.style.transform = `translateY(${e.clientY}px)`;
      if (crosshairRef.current) crosshairRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

      // Update coordinates
      const xEl = document.getElementById('coord-x');
      const yEl = document.getElementById('coord-y');
      if (xEl) xEl.textContent = Math.round(e.clientX).toString().padStart(4, '0');
      if (yEl) yEl.textContent = Math.round(e.clientY).toString().padStart(4, '0');

      // Detect if hovering over a clickable element
      const target = e.target as HTMLElement;
      if (target) {
        const computedStyle = window.getComputedStyle(target);
        const clickable = 
          target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a') || 
          target.closest('button') ||
          computedStyle.cursor === 'pointer' ||
          target.classList.contains('cursor-pointer');
        
        setIsHovering(!!clickable);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const lineColor = 'bg-[#FF003C]';

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      {/* Vertical Line */}
      <div 
        ref={vLineRef}
        className={`absolute top-0 left-0 w-[2px] h-full will-change-transform opacity-30 transition-colors duration-300 ${lineColor}`}
      />
      {/* Horizontal Line */}
      <div 
        ref={hLineRef}
        className={`absolute top-0 left-0 h-[2px] w-full will-change-transform opacity-30 transition-colors duration-300 ${lineColor}`}
      />
      
      {/* Center Crosshair */}
      <div 
        ref={crosshairRef}
        className="absolute top-0 left-0 w-8 h-8 -ml-4 -mt-4 will-change-transform transition-all duration-300 ease-out"
        style={{
          transform: isHovering ? 'scale(1.5) rotate(45deg)' : 'scale(1) rotate(0deg)'
        }}
      >
        {/* Main Cross */}
        <div className={`absolute top-1/2 left-0 w-full h-[2px] -translate-y-[1px] ${lineColor} ${isHovering ? 'opacity-100' : 'opacity-60'}`} />
        <div className={`absolute left-1/2 top-0 h-full w-[2px] -translate-x-[1px] ${lineColor} ${isHovering ? 'opacity-100' : 'opacity-60'}`} />
        
        {/* Optional Inner Dot or Corner marks can be added here for a "premium" feel */}
        {isHovering && (
          <div className="absolute inset-0 border-2 border-[#FF003C] rounded-sm opacity-40 animate-pulse" />
        )}
      </div>

      {/* Numerical Coordinates (Technical Detail) */}
      <div 
        className="absolute bottom-4 right-4 font-mono text-[10px] text-[#FF003C]/40 uppercase tracking-widest"
      >
        <span id="coord-x">0000</span> / <span id="coord-y">0000</span>
      </div>
    </div>
  );
}
