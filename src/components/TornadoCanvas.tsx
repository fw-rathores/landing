'use client';

import React, { useRef, useMemo, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useScroll, ScrollControls, Scroll } from '@react-three/drei';
import * as THREE from 'three';
import { siteConfig } from '@/siteConfig';

// Creates a sheared ribbon segment geometry to follow the spiral slope
function createRibbonSegmentGeometry(
  width: number, 
  height: number, 
  radius: number, 
  slope: number, // Vertical rise per radian
  thetaStart: number,
  segments: number = 32
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const thetaLength = width / radius;
  
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  
  for (let j = 0; j <= 1; j++) { // 2 rows (bottom and top)
    const yBase = (j - 0.5) * height;
    
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const theta = thetaStart + u * thetaLength; // Absolute theta
      
      const x = Math.sin(theta) * radius;
      // Vertically offset based on theta to match spiral slope
      const y = yBase + theta * slope; 
      const z = Math.cos(theta) * radius;
      
      positions.push(x, y, z);
      uvs.push(u, j);
    }
  }
  
  for (let i = 0; i < segments; i++) {
    const a = i;
    const b = i + 1;
    const c = i + segments + 1;
    const d = i + segments + 2;
    
    indices.push(a, c, b);
    indices.push(b, c, d);
  }
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  
  return geometry;
}

function RibbonCard({ 
  url, index, width, height, radius, slope, thetaStart, hoveredIndex, setHoveredIndex 
}: {
  url: string;
  index: number;
  width: number;
  height: number;
  radius: number;
  slope: number;
  thetaStart: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const frontMeshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  const isFrontFacingRef = useRef(true);
  
  // Clone texture for back side to allow independent material settings
  const backTexture = useMemo(() => {
    const cloned = texture.clone();
    cloned.needsUpdate = true;
    return cloned;
  }, [texture]);
  
  const geometry = useMemo(() => 
    createRibbonSegmentGeometry(width, height, radius, slope, thetaStart), 
    [width, height, radius, slope, thetaStart]
  );

  const isHovered = hoveredIndex === index;
  const isGlobalHover = hoveredIndex !== null;

  useFrame((state) => {
    if (!groupRef.current || !frontMeshRef.current) return;

    // Check if the card is facing the camera by checking if its center is on the camera side
    // The camera is at Z=10, so cards with positive world Z (after rotation) are visible
    const meshWorldPos = new THREE.Vector3();
    frontMeshRef.current.getWorldPosition(meshWorldPos);
    
    // Get the center of this card segment in local coordinates
    const thetaCenter = thetaStart + (width / radius) / 2;
    
    // Get parent's world rotation
    const parent = groupRef.current.parent;
    if (parent) {
      parent.updateWorldMatrix(true, false);
    }
    const parentRotationY = parent ? parent.rotation.y : 0;
    
    // Calculate where this card's center would be after rotation
    const rotatedTheta = thetaCenter + parentRotationY;
    // The card faces outward - if cos(rotatedTheta) > 0, it's facing toward +Z (camera)
    isFrontFacingRef.current = Math.cos(rotatedTheta) > 0;

    // 1. Calculate Targets
    let targetZ = 0;
    // Use color as a brightness multiplier - full white = full brightness
    let targetColor = new THREE.Color(1, 1, 1); 

    if (isGlobalHover) {
      if (isHovered) {
        targetZ = 0.5; // Pop out forward
        // Hovered card stays at full brightness
        targetColor = new THREE.Color(1, 1, 1);
      } else {
        // Non-hovered cards: dim colors but keep full opacity
        targetColor = new THREE.Color(0.4, 0.4, 0.4);
      }
    }

    // 2. Apply smooth animations
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
    
    // Apply color changes to the front mesh
    const mat = frontMeshRef.current.material as THREE.MeshBasicMaterial;
    if (mat.color) {
      mat.color.lerp(targetColor, 0.1);
    }
  });

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    // Only allow hover if the card is front-facing
    if (isFrontFacingRef.current) {
      setHoveredIndex(index);
    }
  };

  const handlePointerOut = () => {
    setHoveredIndex(null);
  };

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* VISIBLE SIDE (Full Brightness - faces camera, uses BackSide due to geometry normals) */}
      <mesh ref={frontMeshRef} geometry={geometry}>
        <meshBasicMaterial map={texture} color={new THREE.Color(1, 1, 1)} side={THREE.BackSide} />
      </mesh>

      {/* HIDDEN SIDE (Dimmed - faces away from camera, uses FrontSide) */}
      <mesh geometry={geometry}>
        <meshBasicMaterial 
          map={backTexture}
          color={new THREE.Color(0.25, 0.25, 0.25)}
          side={THREE.FrontSide} 
        />
      </mesh>
    </group>
  );
}

export function TornadoStrip() {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const spiralHeight = 4.5; 
  const radiusTop = 1.5; 
  const radiusBottom = 1.0;
  const cardWidth = 1.0;
  const cardHeight = 1.0;

  const cards = useMemo(() => {
    const items: any[] = [];
    const images = siteConfig.images;
    const numImages = images.length;
    
    // 1. Calculate total theta
    let totalTheta = 0;
    for (let i = 0; i < numImages; i++) {
        const t = i / (numImages - 1);
        const r = radiusBottom + (radiusTop - radiusBottom) * t;
        totalTheta += (cardWidth / r);
    }
    
    const slope = spiralHeight / totalTheta;

    // 2. Generate items
    let currentTheta = 0;
    images.forEach((img, i) => {
      const t = i / (numImages - 1);
      const r = radiusBottom + (radiusTop - radiusBottom) * t;
      
      items.push({
        id: img.id,
        url: img.url,
        thetaStart: currentTheta,
        radius: r,
        slope: slope,
        width: cardWidth,
        height: cardHeight,
      });
      
      currentTheta += cardWidth / r;
    });

    return items;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    // 1. Mouse Tilt logic
    const targetTiltX = -state.mouse.y * 0.1;
    const targetTiltZ = state.mouse.x * 0.1;
    
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetTiltX, 0.1);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetTiltZ, 0.1);

    // 2. Constant Spiral + Scroll
    const autoSpeed = delta * 0.02;
    group.current.rotation.y += autoSpeed + (scroll.delta * 2);

    // 3. Vertical Travel
    // Start significantly below the viewport top to clear the header
    // Viewport height at z=5 is approx 3 units. Top is ~1.5. Bottom is ~-1.5.
    // We set top of spiral to start near the bottom of the screen.
    const targetTopY = -0.5;
    const startY = targetTopY - spiralHeight;
    // Move upwards as we scroll
    group.current.position.y = startY + (scroll.offset * spiralHeight * 3);
  });

  return (
    <group ref={group}>
      {cards.map((card, i) => (
        <RibbonCard 
          key={card.id || i}
          index={i} 
          hoveredIndex={hoveredIndex} 
          setHoveredIndex={setHoveredIndex} 
          {...card} 
        />
      ))}
    </group>
  );
}

export default function TornadoCanvas({ children }: { children?: React.ReactNode }) {
  const [pages, setPages] = useState(3);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const updatePages = () => {
      if (contentRef.current) {
        const height = contentRef.current.offsetHeight;
        const vh = window.innerHeight;
        // Calculate pages, ensure at least 1, add a tiny buffer for safety
        const newPages = Math.max(height / vh, 1);
        
        // Only update if difference is significant (> 1% change) to avoid infinite loops or jitter
        setPages(prev => Math.abs(prev - newPages) > 0.01 ? newPages : prev);
      }
    };

    // Initial check
    // Delay slightly to ensure children layout is stable
    const timeout = setTimeout(updatePages, 100);

    const resizeObserver = new ResizeObserver(updatePages);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    // Also listen to window resize
    window.addEventListener('resize', updatePages);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePages);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-30">
      <Canvas camera={{ position: [0, 0, 10], fov: 35 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={2} />
        <directionalLight position={[0, 5, 5]} intensity={1.2} />
        <ScrollControls pages={pages} damping={0.2}>
          <Suspense fallback={null}>
            <TornadoStrip />
          </Suspense>
          <Scroll html style={{ width: '100%', pointerEvents: 'none', zIndex: -1 }}>
             {/* Wrap children to measure height and restore pointer events */}
            <div ref={contentRef} style={{ width: '100%', pointerEvents: 'auto' }}>
              {children}
            </div>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
