'use client';

import { Suspense, useState } from 'react';
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

// ------------------------------------------------------------------
// Internal Content Wrapper
// This component must be inside CursorModeProvider to access context
// ------------------------------------------------------------------
function AppContent({ loading }: { loading: boolean }) {
  // Bridge the cursor context into the Canvas
  // This must be called in a component that is a child of the Provider
  const ContextBridge = useContextBridge(CursorModeContext);

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
           {/* 
              Additional 3D content can go here (e.g. Tornado).
              For now, we have just the DOM scroll content.
            */}
            {/* <Tornado /> Placeholder */}

            <ScrollControls pages={4.5} damping={0.2}>
                {/* 
                  We use <Scroll html> to render our DOM sections inside the scroll container.
                  This allows them to move in sync with the R3F scroll.
                */}
                <Scroll html style={{ width: '100%', height: '100%' }}>
                  <Hero />
                  <CapabilitiesSection />
                  <ContactSection />
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
