import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import SurfaceMesh from './SurfaceMesh';

/* ─── MATLAB-style 3D grid walls (no box edges) ──────────────────── */

const BOX = { x: [-4, 4], y: [-4, 4], z: [-4, 4] };
const TICKS_XZ = [-4, -2, 0, 2, 4];
const TICKS_Y = [-4, -2, 0, 2, 4];

function MatlabBox({ theme }) {
  const [xLo, xHi] = BOX.x;
  const [yLo, yHi] = BOX.y;
  const [zLo, zHi] = BOX.z;

  // MATLAB uses the same subtle gray for ALL lines
  const lineColor = theme === 'dark' ? '#3a3a4a' : '#a0a0ac';
  const lineOpacity = theme === 'dark' ? 0.35 : 0.6;

  // Grid lines on bottom wall (y = yLo)
  const bottomGrid = [];
  TICKS_XZ.forEach(v => {
    bottomGrid.push([[v, yLo, zLo], [v, yLo, zHi]]);
    bottomGrid.push([[xLo, yLo, v], [xHi, yLo, v]]);
  });

  // Grid lines on back-left wall (x = xLo)
  const leftWallGrid = [];
  TICKS_XZ.forEach(v => {
    leftWallGrid.push([[xLo, yLo, v], [xLo, yHi, v]]);
  });
  TICKS_Y.forEach(v => {
    leftWallGrid.push([[xLo, v, zLo], [xLo, v, zHi]]);
  });

  // Grid lines on back wall (z = zLo)
  const backWallGrid = [];
  TICKS_XZ.forEach(v => {
    backWallGrid.push([[v, yLo, zLo], [v, yHi, zLo]]);
  });
  TICKS_Y.forEach(v => {
    backWallGrid.push([[xLo, v, zLo], [xHi, v, zLo]]);
  });

  const allGridLines = [...bottomGrid, ...leftWallGrid, ...backWallGrid];

  // Solid edges only for the axes where labels are placed
  const axisColor = theme === 'dark' ? '#888899' : '#111111';
  const axisOpacity = theme === 'dark' ? 0.8 : 0.9;
  const boxEdges = [
    // X-axis edge (front-bottom edge)
    [[xLo, yLo, zHi], [xHi, yLo, zHi]],
    // Z-axis edge (right-bottom edge)
    [[xHi, yLo, zLo], [xHi, yLo, zHi]],
    // Z-axis edge (left-front vertical edge)
    [[xLo, yLo, zHi], [xLo, yHi, zHi]],
  ];

  // Faint lines to close off the remaining bounding box faces
  const faintBoxEdges = [
    // Bottom remaining
    [[xLo, yLo, zLo], [xHi, yLo, zLo]], // back
    [[xLo, yLo, zLo], [xLo, yLo, zHi]], // left
    // Top all 4 edges
    [[xLo, yHi, zLo], [xHi, yHi, zLo]], // back
    [[xLo, yHi, zLo], [xLo, yHi, zHi]], // left
    [[xLo, yHi, zHi], [xHi, yHi, zHi]], // front
    [[xHi, yHi, zLo], [xHi, yHi, zHi]], // right
    // Vertical remaining
    [[xLo, yLo, zLo], [xLo, yHi, zLo]], // back-left
    [[xHi, yLo, zLo], [xHi, yHi, zLo]], // back-right
    [[xHi, yLo, zHi], [xHi, yHi, zHi]], // front-right
  ];

  // Protruding tick lines for each axis
  const tickLines = [];
  const tickLength = 0.25;

  // X-axis ticks (protruding along +Z)
  TICKS_XZ.forEach(v => {
    tickLines.push([[v, yLo, zHi], [v, yLo, zHi + tickLength]]);
  });

  // Y-axis ticks (protruding along +X)
  TICKS_XZ.forEach(v => {
    tickLines.push([[xHi, yLo, v], [xHi + tickLength, yLo, v]]);
  });

  // Z-axis ticks (protruding along -X)
  TICKS_Y.forEach(v => {
    tickLines.push([[xLo, v, zHi], [xLo - tickLength, v, zHi]]);
  });

  const labelStyle = {
    color: theme === 'dark' ? 'rgba(160,170,210,0.65)' : 'rgba(30,30,40,0.8)',
    fontSize: '10px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: theme === 'dark' ? 500 : 600,
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <group>
      {/* Grid lines only */}
      {allGridLines.map((pts, i) => (
        <Line
          key={`g-${i}`}
          points={pts}
          color={lineColor}
          lineWidth={0.5}
          transparent
          opacity={lineOpacity}
        />
      ))}

      {/* Faint bounding box edges */}
      {faintBoxEdges.map((pts, i) => (
        <Line
          key={`fb-${i}`}
          points={pts}
          color={lineColor}
          lineWidth={0.5}
          transparent
          opacity={lineOpacity * 0.8}
        />
      ))}

      {/* Solid box edge lines (axes borders) */}
      {boxEdges.map((pts, i) => (
        <Line
          key={`e-${i}`}
          points={pts}
          color={axisColor}
          lineWidth={1.5}
          transparent
          opacity={axisOpacity}
        />
      ))}

      {/* Protruding tick lines */}
      {tickLines.map((pts, i) => (
        <Line
          key={`t-${i}`}
          points={pts}
          color={axisColor}
          lineWidth={1.5}
          transparent
          opacity={axisOpacity}
        />
      ))}

      {/* X-axis tick labels — along front-bottom edge (z = zHi) */}
      {TICKS_XZ.map(v => (
        <Html key={`xl-${v}`} position={[v, yLo - 0.1, zHi + 0.5]} center style={labelStyle}>
          {v}
        </Html>
      ))}
      <Html position={[0, yLo - 0.1, zHi + 1.0]} center style={{ ...labelStyle, fontSize: '12px', fontStyle: 'italic' }}>
        X
      </Html>

      {/* Y-axis (Math Y, Three.js Z) tick labels — along right-bottom edge (x = xHi) */}
      {TICKS_XZ.map(v => (
        <Html key={`zl-${v}`} position={[xHi + 0.5, yLo - 0.1, v]} center style={labelStyle}>
          {v}
        </Html>
      ))}
      <Html position={[xHi + 1.0, yLo - 0.1, 0]} center style={{ ...labelStyle, fontSize: '12px', fontStyle: 'italic' }}>
        Y
      </Html>

      {/* Z-axis (Math Z, Three.js Y) tick labels — along left-front vertical edge */}
      {TICKS_Y.map(v => (
        <Html key={`yl-${v}`} position={[xLo - 0.5, v, zHi]} center style={labelStyle}>
          {v}
        </Html>
      ))}
      <Html position={[xLo - 1.0, 0, zHi]} center style={{ ...labelStyle, fontSize: '12px', fontStyle: 'italic' }}>
        Z
      </Html>
    </group>
  );
}

/* ── Scene content ───────────────────────────────────────────────────── */

function SceneContent({
  surfaceId, resolution, colorScheme, displayMode,
  autoRotate, animationSpeed, theme,
  params, clipPlaneY, colorMapAxis,
  setSurfaceId,
  material, showContours, surfaceId2, colorScheme2, showParticles
}) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    // Shift the rendering frustum to center the graph in the available view space
    if (state.camera.setViewOffset) {
      const isMobile = state.size.width <= 768;
      // On desktop, the panel takes ~384px on the left, so we shift the graph RIGHT by 192px.
      const shiftX = isMobile ? 0 : -192;
      // On mobile, the panel is at the bottom, so we shift the graph UP by ~125px.
      const shiftY = isMobile ? 125 : 0;
      state.camera.setViewOffset(state.size.width, state.size.height, shiftX, shiftY, state.size.width, state.size.height);
    }

    if (autoRotate && groupRef.current) {
      const speed = animationSpeed * 0.3;
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={theme === 'dark' ? 0.5 : 0.7} color={theme === 'dark' ? '#b8c4ff' : '#ffffff'} />
      <directionalLight position={[8, 10, 5]} intensity={theme === 'dark' ? 0.7 : 0.9} color="#ffffff" />
      <directionalLight position={[-5, 5, -5]} intensity={0.25} color={theme === 'dark' ? '#8090ff' : '#b0c0ff'} />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={6}
        maxDistance={200}
        maxPolarAngle={Math.PI * 0.85}
      />

      {/* Surface + grid in rotating group */}
      <group ref={groupRef}>
        <SurfaceMesh
          surfaceId={surfaceId}
          resolution={resolution}
          colorScheme={colorScheme}
          displayMode={displayMode}
          animationSpeed={animationSpeed}
          params={params}
          clipPlaneY={clipPlaneY}
          colorMapAxis={colorMapAxis}
          material={material}
          showContours={showContours}
          showParticles={showParticles}
        />
        {surfaceId2 !== 'none' && (
          <SurfaceMesh
            surfaceId={surfaceId2}
            resolution={resolution}
            colorScheme={colorScheme2}
            displayMode={displayMode}
            animationSpeed={animationSpeed}
            params={params}
            clipPlaneY={clipPlaneY}
            colorMapAxis={colorMapAxis}
            material={material}
            showContours={showContours}
            showParticles={showParticles}
          />
        )}
        <MatlabBox theme={theme} />
      </group>

      {/* Bloom only in dark mode */}
      {theme === 'dark' && (
        <EffectComposer>
          <Bloom intensity={0.1} luminanceThreshold={0.4} luminanceSmoothing={0.9} radius={0.6} />
        </EffectComposer>
      )}
    </>
  );
}

/* ── Main Scene ──────────────────────────────────────────────────────── */

export default function Scene({
  surfaceId, resolution, colorScheme, displayMode,
  autoRotate, animationSpeed, theme,
  params, clipPlaneY, colorMapAxis,
  setSurfaceId,
  material, showContours, surfaceId2, colorScheme2, showParticles
}) {
  const bgColor = theme === 'dark' ? '#0c0c14' : '#f0f1f5';

  return (
    <Canvas
      camera={{
        position: [39.40, 22.56, 21.08],
        fov: 20,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
        localClippingEnabled: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: theme === 'dark' ? 1.2 : 1.6,
      }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <color attach="background" args={[bgColor]} />

      <SceneContent
        surfaceId={surfaceId}
        resolution={resolution}
        colorScheme={colorScheme}
        displayMode={displayMode}
        autoRotate={autoRotate}
        animationSpeed={animationSpeed}
        theme={theme}
        params={params}
        clipPlaneY={clipPlaneY}
        colorMapAxis={colorMapAxis}
        setSurfaceId={setSurfaceId}
        material={material}
        showContours={showContours}
        surfaceId2={surfaceId2}
        colorScheme2={colorScheme2}
        showParticles={showParticles}
      />
    </Canvas>
  );
}
