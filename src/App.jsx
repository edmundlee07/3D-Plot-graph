import { useState, useEffect } from 'react';
import Scene from './components/Scene';
import ControlPanel from './components/ControlPanel';
import InfoCard from './components/InfoCard';
import './index.css';

export default function App() {
  const [surfaceId, setSurfaceId] = useState('sinc');
  const [resolution, setResolution] = useState(50);
  const [colorScheme, setColorScheme] = useState('matlab');
  const [displayMode, setDisplayMode] = useState('both');
  const [autoRotate, setAutoRotate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.2);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <div className="canvas-container">
        <Scene
          surfaceId={surfaceId}
          resolution={resolution}
          colorScheme={colorScheme}
          displayMode={displayMode}
          autoRotate={autoRotate}
          animationSpeed={animationSpeed}
          theme={theme}
        />
      </div>

      <ControlPanel
        surfaceId={surfaceId}
        setSurfaceId={setSurfaceId}
        resolution={resolution}
        setResolution={setResolution}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        theme={theme}
        setTheme={setTheme}
      />

      <InfoCard surfaceId={surfaceId} />

      <div className="branding">
        <span className="brand-dot" />
        Surface Lab
      </div>
    </div>
  );
}
