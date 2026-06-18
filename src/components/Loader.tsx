'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/siteConfig';

const technicalMessages = [
  "INDEXING PRODUCT REFERENCES...",
  "BUILDING VISUAL CONSTRAINTS...",
  "LOADING SKU CREATIVE SYSTEM...",
  "PREPARING INFLUENCER SIGNALS...",
  "SYNCING SENTIMENT SOURCES...",
  "MAPPING META PERFORMANCE DATA...",
  "ASSEMBLING LAUNCH DASHBOARD...",
  "QUEUING GROWTH RECOMMENDATIONS...",
  "RENDERLESS SYSTEM READY."
];

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [realProgress, setRealProgress] = useState(0); // Actual load percentage
  const [displayedProgress, setDisplayedProgress] = useState(0); // Visual percentage
  const [loadingFile, setLoadingFile] = useState("...");
  const [elapsed, setElapsed] = useState(0);
  const completionTriggeredRef = useRef(false);
  const completionTimeoutRef = useRef<number | null>(null);
  const preloadImagesRef = useRef<HTMLImageElement[]>([]);

  const triggerComplete = useCallback(() => {
    if (completionTriggeredRef.current) return;

    completionTriggeredRef.current = true;
    completionTimeoutRef.current = window.setTimeout(() => {
      onComplete();
    }, 160);
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      completionTriggeredRef.current = true;
      onComplete();
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [onComplete]);

  // Stats for "elapsed time"
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Animation Loop to smooth out progress
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setDisplayedProgress(prev => {
        // If we reached the target "real" progress, stop (unless it's 100, then we ensure we hit it)
        if (prev >= realProgress && realProgress < 100) return prev;
        
        // Calculate step - vary it a bit for "organic" feel
        // However, ensure a minimum speed so it doesn't stall, and a maximum so it doesn't jump
        const diff = realProgress - prev;
        
        // If real progress is way ahead, move faster. If close, move slower.
        // But force a minimum increment to ensure movement.
        let step = Math.max(1.2, diff * 0.18); 
        
        // Keep the terminal responsive once assets are cached or locally served.
        step = Math.min(step, 8); 
        
        let next = prev + step;
        
        // Snap to 100 if very close and real progress is 100
        if (realProgress === 100 && next > 99.5) {
          next = 100;
        }

        return next;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [realProgress]);

  // Complete trigger
  useEffect(() => {
    if (displayedProgress >= 100) {
      triggerComplete();
    }
  }, [displayedProgress, triggerComplete]);

  useEffect(() => {
    if (realProgress >= 100) {
      triggerComplete();
    }
  }, [realProgress, triggerComplete]);

  // Actual Asset Preloading
  useEffect(() => {
    const imageUrls = [
      ...siteConfig.images.map((img) => img.url),
      ...siteConfig.capabilities.map((cap) => cap.image),
    ];
    
    const uniqueUrls = Array.from(new Set(imageUrls));
    const total = uniqueUrls.length;
    let loaded = 0;
    let cancelled = false;
    const fallbackTimeout = window.setTimeout(() => {
      if (cancelled) return;
      setLoadingFile('ready');
      setRealProgress(100);
      triggerComplete();
    }, 2200);

    const updateRealProgress = (url?: string) => {
      if (cancelled) return;
      loaded += 1;
      const newProgress = Math.min(Math.round((loaded / total) * 100), 100);
      setRealProgress(newProgress);
      if (newProgress >= 100) {
        triggerComplete();
      }
      
      if (url) {
        const filename = url.split('/').pop() || url;
        setLoadingFile(filename);
      }
    };

    if (total === 0) {
        queueMicrotask(() => setRealProgress(100));
        return;
    }

    uniqueUrls.forEach((url) => {
      const img = new Image();
      let settled = false;
      const markLoaded = () => {
        if (settled) return;
        settled = true;
        updateRealProgress(url);
      };

      img.onload = markLoaded;
      img.onerror = markLoaded;
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = url;
      preloadImagesRef.current.push(img);

      if (img.complete) {
        queueMicrotask(markLoaded);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimeout);
      preloadImagesRef.current = [];
    };
  }, [triggerComplete]);

  const displayInt = Math.floor(displayedProgress);
  const currentMessage = technicalMessages[
    Math.min(
      Math.floor((displayedProgress / 100) * (technicalMessages.length - 1)),
      technicalMessages.length - 1
    )
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#111] text-[#e5e5e5] font-mono overflow-hidden cursor-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
        {/* Background Grid */}
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
                backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
        />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start text-[10px] tracking-widest opacity-70">
            <div>
                <div className="font-bold text-[#e5e5e5]">RENDERLESS GROWTH OS</div>
                <div className="text-[#CCFF00]">FRAGRANCE / LAUNCH MODE</div>
            </div>
            <div className="text-right">
                <div>SYS.STATUS: <span className="text-[#CCFF00]">ONLINE</span></div>
                <div>MEM: {Math.round(displayInt * 4.2)}MB / 1024MB</div>
            </div>
        </div>

        {/* Center Content */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-8 flex flex-col items-center">
            
            {/* The Percentage - BIG */}
            <div className="relative mb-8">
                <motion.div 
                    className="text-8xl md:text-9xl font-black tracking-tighter text-transparent"
                    style={{ WebkitTextStroke: '2px #555' }}
                >
                    {displayInt < 10 ? `0${displayInt}` : displayInt}
                </motion.div>
                <div className="absolute inset-0 overflow-hidden flex justify-center" style={{ height: `${displayInt}%` }}>
                     <div className="text-8xl md:text-9xl font-black tracking-tighter text-[#e5e5e5]">
                        {displayInt < 10 ? `0${displayInt}` : displayInt}
                     </div>
                </div>
                
                {/* Decorative brackets */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 h-24 w-1 bg-[#CCFF00]" />
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 h-24 w-1 bg-[#CCFF00]" />
            </div>

            {/* Progress Bar styled as blocks */}
            <div className="w-full h-2 flex gap-1 mb-4 opacity-50">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 transition-colors duration-100 ${
                            (i / 40) * 100 < displayInt ? 'bg-[#e5e5e5]' : 'bg-[#222]'
                        }`}
                    />
                ))}
            </div>
            
            <div className="w-full flex justify-between text-xs tracking-widest text-[#666]">
                <span>PREPARING LAUNCH SYSTEM</span>
                <span className="text-[#CCFF00] animate-pulse">PROCESSING</span>
            </div>
        </div>

        {/* Bottom Left Logs */}
        <div className="absolute bottom-6 left-6 font-mono text-xs text-[#666] flex flex-col gap-1">
            <div className="opacity-50">T+{elapsed.toFixed(2)}s</div>
            <div className="text-[#CCFF00]">
                {`> ${currentMessage}`}
            </div>
            <div className="text-[#444] truncate max-w-[300px]">
                {`> loading: ${loadingFile}`}
            </div>
        </div>

        {/* Bottom Right Decoration */}
        <div className="absolute bottom-6 right-6 text-right">
             <div className="w-16 h-16 border border-[#333] relative flex items-center justify-center">
                 <div className="w-12 h-12 border border-[#CCFF00]/30 animate-[spin_3s_linear_infinite]" />
                 <div className="absolute inset-0 flex items-center justify-center text-[9px] text-[#CCFF00]">
                    {Math.round(displayInt)}%
                 </div>
             </div>
        </div>
    </motion.div>
  );
}
