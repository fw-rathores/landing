'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, useContextBridge, Preload } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';

// Components
import Hero from '@/components/Hero';
import Loader from '@/components/Loader';
import MouseTracker from '@/components/MouseTracker';
import { 
  CursorModeProvider, 
  CursorModeContext, 
  CapabilitiesSection, 
  ContactSection 
} from '@/components/ScrollSections';
import { TornadoStrip } from '@/components/TornadoCanvas';

// ------------------------------------------------------------------
// Internal Content Wrapper
// This component must be inside CursorModeProvider to access context
// ------------------------------------------------------------------
function AppContent({ loading }: { loading: boolean }) {
  // Bridge the cursor context into the Canvas
  // This must be called in a component that is a child of the Provider
  const ContextBridge = useContextBridge(CursorModeContext);
  
  // Dynamic scroll height calculation
  const [pages, setPages] = useState(3.2);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;

    const updatePages = () => {
      if (contentRef.current) {
        const height = contentRef.current.offsetHeight;
        const vh = window.innerHeight;
        // Calculate pages (height / vh)
        // Ensure at least 3.2 (desktop default) or enough for content
        // Adding a small buffer of 0.1
        const measuredPages = height / vh;
        const newPages = Math.max(measuredPages, 1);
        
        // Only update if difference is significant (> 0.05) to avoid jitter
        setPages(prev => Math.abs(prev - newPages) > 0.05 ? newPages : prev);
      }
    };

    // Initial check with slight delay for layout stability
    const timeout = setTimeout(updatePages, 200);
    const resizeObserver = new ResizeObserver(updatePages);
    
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    window.addEventListener('resize', updatePages);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePages);
    };
  }, [loading]);

  // If still strictly loading (not just fading out), we might want to hide Canvas or keep it hidden
  // But to allow smooth customized entry, we mount it when loading finishes.
  if (loading) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-[#242424]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        className="touch-none"
      >
        <ContextBridge>
            <ambientLight intensity={2} />
            <directionalLight position={[0, 5, 5]} intensity={1.2} />

            <ScrollControls pages={pages} damping={0.2}>
                <Suspense fallback={null}>
                    <TornadoStrip />
                </Suspense>
                {/* 
                  We use <Scroll html> to render our DOM sections inside the scroll container.
                  This allows them to move in sync with the R3F scroll.
                */}
                <Scroll html style={{ width: '100%', height: '100%' }}>
                  <div ref={contentRef} style={{ width: '100%' }}>
                    <Hero />
                    <CapabilitiesSection />
                    <ContactSection />
                  </div>
                </Scroll>
            </ScrollControls>
            
            <Preload all />
        </ContextBridge>
      </Canvas>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Page Component
// ------------------------------------------------------------------
export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <CursorModeProvider>
      {/* Global Mouse Tracker */}
      <MouseTracker />

      {/* Loader Overlay */}
      <AnimatePresence mode="wait">
        {loading && <Loader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Main 3D Canvas & Content */}
      <AppContent loading={loading} />
    </CursorModeProvider>
  );
}