import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildSurface } from '../surfaces';
import ParticleSystem from './ParticleSystem';

export default function SurfaceMesh({
  surfaceId,
  resolution,
  colorScheme,
  displayMode,
  animationSpeed,
  params,
  clipPlaneY,
  colorMapAxis,
  material = 'matte',
  showContours = false,
  showParticles = false,
}) {
  const solidRef = useRef();
  const wireRef = useRef();
  const prevDataRef = useRef(null);
  const morphProgress = useRef(1);

  const data = useMemo(
    () => buildSurface(surfaceId, resolution, colorScheme, params, colorMapAxis),
    [surfaceId, resolution, colorScheme, params, colorMapAxis]
  );

  const clipPlanes = useMemo(() => {
    if (clipPlaneY >= 9.9) return [];
    return [new THREE.Plane(new THREE.Vector3(0, -1, 0), clipPlaneY)];
  }, [clipPlaneY]);

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

  const showSolid = displayMode === 'solid' || displayMode === 'both';
  const showWire = displayMode === 'wireframe' || displayMode === 'both';

  // Material handling
  const handleBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      `void main() {`,
      `varying vec3 vLocalPos;\nvoid main() {`
    ).replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>\nvLocalPos = position;`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      `void main() {`,
      `varying vec3 vLocalPos;\nvoid main() {`
    ).replace(
      `#include <color_fragment>`,
      `#include <color_fragment>
      float contour = fract(vLocalPos.y * 8.0);
      float thickness = 0.05;
      if (contour < thickness || contour > 1.0 - thickness) {
        diffuseColor.rgb *= 0.15; // darken significantly to draw contour lines
      }
      `
    );
  };

  const materialProps = {
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: displayMode === 'both' ? 0.35 : 0.85,
    clippingPlanes: clipPlanes,
    onBeforeCompile: showContours ? handleBeforeCompile : undefined,
  };
  // Changing the key forces the material to remount and recompile its shader
  const materialKey = `${material}-${showContours}-${displayMode}`;

  const renderSolidMaterial = () => {
    switch (material) {
      case 'glass':
        return <meshPhysicalMaterial key={materialKey} {...materialProps} transmission={1} thickness={0.5} roughness={0.15} ior={1.5} />;
      case 'chrome':
        return <meshStandardMaterial key={materialKey} {...materialProps} metalness={1.0} roughness={0.1} />;
      case 'hologram':
        return <meshBasicMaterial key={materialKey} {...materialProps} blending={THREE.AdditiveBlending} depthWrite={false} opacity={displayMode === 'both' ? 0.2 : 0.6} />;
      case 'matte':
      default:
        return <meshStandardMaterial key={materialKey} {...materialProps} roughness={0.5} metalness={0.1} />;
    }
  };

  return (
    <group>
      {showSolid && (
        <mesh ref={solidRef} geometry={geometry}>
          {renderSolidMaterial()}
        </mesh>
      )}
      {showWire && (
        <mesh ref={wireRef} geometry={geometry}>
          <meshBasicMaterial
            vertexColors
            wireframe
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            clippingPlanes={clipPlanes}
          />
        </mesh>
      )}
      {showParticles && (
        <ParticleSystem positions={data.positions} resolution={resolution} />
      )}
    </group>
  );
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
