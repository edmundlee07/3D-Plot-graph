import { useState, useEffect, Component } from 'react';
import Scene from './components/Scene';
import ControlPanel from './components/ControlPanel';
import InfoCard from './components/InfoCard';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: '20px', background: 'white', zIndex: 9999, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <h1>Something went wrong.</h1>
        <pre>{this.state.error.toString()}</pre>
        <pre>{this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

export default function App() {
  const [surfaceId, setSurfaceId] = useState('sinc');
  const [resolution, setResolution] = useState(50);
  const [colorScheme, setColorScheme] = useState('matlab');
  const [displayMode, setDisplayMode] = useState('both');
  const [autoRotate, setAutoRotate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.2);
  const [theme, setTheme] = useState('light');
  
  // New features state
  const [params, setParams] = useState({ a: 1, b: 1, c: 1 });
  const [clipPlaneY, setClipPlaneY] = useState(10); // 10 means no clipping essentially
  const [colorMapAxis, setColorMapAxis] = useState('y');
  
  // Phase 2 Advanced Features
  const [material, setMaterial] = useState('matte');
  const [showContours, setShowContours] = useState(false);
  const [surfaceId2, setSurfaceId2] = useState('none');
  const [colorScheme2, setColorScheme2] = useState('plasma');
  const [showParticles, setShowParticles] = useState(false);


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <div className="canvas-container">
        <ErrorBoundary>
          <Scene
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
        </ErrorBoundary>
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
        params={params}
        setParams={setParams}
        clipPlaneY={clipPlaneY}
        setClipPlaneY={setClipPlaneY}
        colorMapAxis={colorMapAxis}
        setColorMapAxis={setColorMapAxis}
        material={material}
        setMaterial={setMaterial}
        showContours={showContours}
        setShowContours={setShowContours}
        surfaceId2={surfaceId2}
        setSurfaceId2={setSurfaceId2}
        colorScheme2={colorScheme2}
        setColorScheme2={setColorScheme2}
        showParticles={showParticles}
        setShowParticles={setShowParticles}
      />

      <InfoCard surfaceId={surfaceId} />

      <div className="branding">
        <span className="brand-dot" />
        Surface Lab
      </div>
    </div>
  );
}
