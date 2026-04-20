import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildSurface } from '../surfaces';

export default function SurfaceMesh({
  surfaceId,
  resolution,
  colorScheme,
  displayMode,
  animationSpeed,
}) {
  const solidRef = useRef();
  const wireRef = useRef();
  const prevDataRef = useRef(null);
  const morphProgress = useRef(1);

  const data = useMemo(
    () => buildSurface(surfaceId, resolution, colorScheme),
    [surfaceId, resolution, colorScheme]
  );

  // Store previous positions for morphing
  useEffect(() => {
    if (prevDataRef.current && prevDataRef.current.positions.length === data.positions.length) {
      morphProgress.current = 0;
    } else {
      morphProgress.current = 1;
    }
  }, [surfaceId]);

  // Animate morph between surfaces and add subtle continuous movement
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    let isMorphing = morphProgress.current < 1;
    
    if (isMorphing) {
      morphProgress.current = Math.min(1, morphProgress.current + delta * (animationSpeed * 1.5));
    }
    
    const t = easeInOutCubic(morphProgress.current);
    const prev = prevDataRef.current;
    const canMorph = prev && prev.positions.length === data.positions.length;

    const refs = [solidRef, wireRef];
    refs.forEach((ref) => {
      if (!ref.current) return;
      const posAttr = ref.current.geometry.attributes.position;
      const colAttr = ref.current.geometry.attributes.color;
      
      for (let i = 0; i < posAttr.count; i++) {
        const idx3 = i * 3;
        
        let bx, by, bz;
        if (isMorphing && canMorph) {
          bx = prev.positions[idx3] + (data.positions[idx3] - prev.positions[idx3]) * t;
          by = prev.positions[idx3+1] + (data.positions[idx3+1] - prev.positions[idx3+1]) * t;
          bz = prev.positions[idx3+2] + (data.positions[idx3+2] - prev.positions[idx3+2]) * t;
          
          if (colAttr) {
            colAttr.array[idx3] = prev.colors[idx3] + (data.colors[idx3] - prev.colors[idx3]) * t;
            colAttr.array[idx3+1] = prev.colors[idx3+1] + (data.colors[idx3+1] - prev.colors[idx3+1]) * t;
            colAttr.array[idx3+2] = prev.colors[idx3+2] + (data.colors[idx3+2] - prev.colors[idx3+2]) * t;
          }
        } else {
          bx = data.positions[idx3];
          by = data.positions[idx3+1];
          bz = data.positions[idx3+2];
        }

        // Add subtle life-like animation: a gentle breathing/ripple effect
        const dist = Math.sqrt(bx * bx + bz * bz);
        // We use animationSpeed to scale the effect slightly and the speed
        const animOffset = Math.sin(time * 2.0 * (0.5 + animationSpeed) - dist * 0.5) * 0.1 * (0.5 + animationSpeed);
        
        posAttr.array[idx3] = bx;
        posAttr.array[idx3+1] = by + animOffset;
        posAttr.array[idx3+2] = bz;
      }
      
      posAttr.needsUpdate = true;
      if (isMorphing && canMorph && colAttr) {
        colAttr.needsUpdate = true;
      }
      
      // Always recompute normals so lighting reacts dynamically to the movement
      ref.current.geometry.computeVertexNormals();
    });
  });

  // Save current data as prev when surfaceId or colorScheme changes
  useEffect(() => {
    return () => {
      prevDataRef.current = { ...data };
    };
  }, [data]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions.slice(), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(data.colors.slice(), 3));
    geo.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [data]);

  const wireGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.positions.slice(), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(data.colors.slice(), 3));
    geo.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geo.computeVertexNormals();
    return geo;
  }, [data]);

  const showSolid = displayMode === 'solid' || displayMode === 'both';
  const showWire = displayMode === 'wireframe' || displayMode === 'both';

  return (
    <group>
      {showSolid && (
        <mesh ref={solidRef} geometry={geometry}>
          <meshStandardMaterial
            vertexColors
            side={THREE.DoubleSide}
            transparent
            opacity={displayMode === 'both' ? 0.35 : 0.85}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      )}
      {showWire && (
        <mesh ref={wireRef} geometry={wireGeometry}>
          <meshBasicMaterial
            vertexColors
            wireframe
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
