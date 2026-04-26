import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleSystem({ positions, resolution }) {
  const pointsRef = useRef();
  const particleCount = 4000;

  // Initialize particles with random u, v coordinates
  const particles = useMemo(() => {
    const data = new Float32Array(particleCount * 2); // u, v
    for (let i = 0; i < particleCount; i++) {
      data[i * 2] = Math.random() * resolution;
      data[i * 2 + 1] = Math.random() * resolution;
    }
    return data;
  }, [resolution]);

  const { posBuffer, colorBuffer } = useMemo(() => {
    return {
      posBuffer: new Float32Array(particleCount * 3),
      colorBuffer: new Float32Array(particleCount * 3)
    };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const colAttr = pointsRef.current.geometry.attributes.color;

    const res1 = resolution + 1;

    for (let p = 0; p < particleCount; p++) {
      let u = particles[p * 2];
      let v = particles[p * 2 + 1];

      // Add a flowing vector field effect. We can use a curl-like noise or simple flow.
      // Flow downhill or along a diagonal.
      const flowU = Math.sin(v * 0.1 + time * 0.5) * 0.2 + 0.1;
      const flowV = Math.cos(u * 0.1 + time * 0.5) * 0.2 + 0.1;

      u += flowU;
      v += flowV;

      // Wrap around
      if (u < 0) u += resolution;
      if (u >= resolution) u -= resolution;
      if (v < 0) v += resolution;
      if (v >= resolution) v -= resolution;

      particles[p * 2] = u;
      particles[p * 2 + 1] = v;

      // Bilinear interpolation
      const ui = Math.floor(u);
      const vi = Math.floor(v);
      const uf = u - ui;
      const vf = v - vi;

      const ui1 = Math.min(ui + 1, resolution);
      const vi1 = Math.min(vi + 1, resolution);

      const idx00 = (ui * res1 + vi) * 3;
      const idx10 = (ui1 * res1 + vi) * 3;
      const idx01 = (ui * res1 + vi1) * 3;
      const idx11 = (ui1 * res1 + vi1) * 3;

      // Interpolate X, Y, Z
      for (let c = 0; c < 3; c++) {
        const c00 = positions[idx00 + c];
        const c10 = positions[idx10 + c];
        const c01 = positions[idx01 + c];
        const c11 = positions[idx11 + c];

        const c0 = c00 + uf * (c10 - c00);
        const c1 = c01 + uf * (c11 - c01);
        const val = c0 + vf * (c1 - c0);

        posBuffer[p * 3 + c] = val;
        
        // Base color on height (Y axis) or simply make them glowing cyan
        if (c === 0) colAttr.array[p * 3 + c] = 0.2; // R
        if (c === 1) colAttr.array[p * 3 + c] = 0.8; // G
        if (c === 2) colAttr.array[p * 3 + c] = 1.0; // B
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={posBuffer}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colorBuffer}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
