import { useState } from 'react';
import { SURFACE_DEFS, CATEGORIES } from '../surfaces';

const COLOR_LABELS = {
  matlab: 'MATLAB',
  viridis: 'Viridis',
  plasma: 'Plasma',
  coolwarm: 'Cool-Warm',
  ocean: 'Ocean',
};

const DISPLAY_MODES = [
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'solid', label: 'Solid' },
  { value: 'both', label: 'Both' },
];

export default function ControlPanel({
  surfaceId, setSurfaceId,
  resolution, setResolution,
  colorScheme, setColorScheme,
  displayMode, setDisplayMode,
  autoRotate, setAutoRotate,
  animationSpeed, setAnimationSpeed,
  theme, setTheme,
  params, setParams,
  clipPlaneY, setClipPlaneY,
  colorMapAxis, setColorMapAxis,
  material, setMaterial,
  showContours, setShowContours,
  surfaceId2, setSurfaceId2,
  colorScheme2, setColorScheme2,
  showParticles, setShowParticles
}) {
  const [activeCategory, setActiveCategory] = useState('waves');
  const categorySurfaces = SURFACE_DEFS.filter((s) => s.category === activeCategory);

  return (
    <div className="control-panel">
      <div className="panel-scroll-container">
        <div className="panel-header">
          <div className="panel-left">
          <div className="panel-icon">◈</div>
          <h2>Surface Explorer</h2>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="control-group">
        <label className="control-label">Category</label>
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Surface Selector */}
      {/* Primary Surface Selector */}
      <div className="control-group">
        <label className="control-label">
          Primary Surface
          <span className="control-value">{categorySurfaces.length}</span>
        </label>
        <div className="surface-tabs">
          {categorySurfaces.map((s) => (
            <button
              key={s.id}
              className={`surface-tab ${surfaceId === s.id ? 'active' : ''}`}
              onClick={() => setSurfaceId(s.id)}
              title={s.name}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Surface Selector */}
      <div className="control-group">
        <label className="control-label">
          Secondary Layer
        </label>
        <div className="surface-tabs">
          <button
            className={`surface-tab ${surfaceId2 === 'none' ? 'active' : ''}`}
            onClick={() => setSurfaceId2('none')}
          >
            None
          </button>
          {categorySurfaces.map((s) => (
            <button
              key={s.id + '_2'}
              className={`surface-tab ${surfaceId2 === s.id ? 'active' : ''}`}
              onClick={() => setSurfaceId2(s.id)}
              title={s.name}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="control-group">
        <label className="control-label">Parameters (a, b, c)</label>
        <div className="params-sliders" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['a', 'b', 'c'].map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{p}</span>
              <input 
                type="range" min="0" max="10" step="0.1" 
                value={params[p]} 
                onChange={(e) => setParams({ ...params, [p]: Number(e.target.value) })}
                className="slider" style={{ flex: 1 }}
              />
              <span style={{ fontSize: '10px', minWidth: '20px' }}>{params[p]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div className="control-group">
        <label className="control-label">
          Resolution
          <span className="control-value">{resolution}</span>
        </label>
        <input
          type="range" min="20" max="120" step="5"
          value={resolution}
          onChange={(e) => setResolution(Number(e.target.value))}
          className="slider"
        />
      </div>

      {/* Render Mode & Material */}
      <div className="control-row" style={{ display: 'flex', gap: '10px' }}>
        <div className="control-group" style={{ flex: 1 }}>
          <label className="control-label">Style</label>
          <div className="mode-toggle">
            {['solid', 'wire', 'both'].map(mode => (
              <button
                key={mode}
                className={`mode-btn ${displayMode === mode ? 'active' : ''}`}
                onClick={() => setDisplayMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group" style={{ flex: 1 }}>
          <label className="control-label">Material</label>
          <select 
            value={material} 
            onChange={(e) => setMaterial(e.target.value)}
            style={{ width: '100%', padding: '6px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '4px', outline: 'none' }}
          >
            <option value="matte">Matte</option>
            <option value="glass">Frosted Glass</option>
            <option value="chrome">Liquid Chrome</option>
            <option value="hologram">Neon Hologram</option>
          </select>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="control-group">
        <label className="control-label">Primary Color</label>
        <div className="color-chips">
          {Object.entries(COLOR_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`color-chip ${colorScheme === key ? 'active' : ''}`}
              onClick={() => setColorScheme(key)}
            >
              <div className={`chip-swatch swatch-${key}`} />
              <span className="chip-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {surfaceId2 !== 'none' && (
        <div className="control-group">
          <label className="control-label">Secondary Color</label>
          <div className="color-chips">
            {Object.entries(COLOR_LABELS).map(([key, label]) => (
              <button
                key={key + '_2'}
                className={`color-chip ${colorScheme2 === key ? 'active' : ''}`}
                onClick={() => setColorScheme2(key)}
              >
                <div className={`chip-swatch swatch-${key}`} />
                <span className="chip-label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mode-toggle" style={{ marginTop: '8px' }}>
        {['x', 'y', 'z', 'radial'].map((axis) => (
          <button
            key={axis}
            className={`mode-btn ${colorMapAxis === axis ? 'active' : ''}`}
            onClick={() => setColorMapAxis(axis)}
            style={{ padding: '4px', fontSize: '11px' }}
          >
            {axis.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Clipping Plane */}
      <div className="control-group">
        <label className="control-label">
          Y-Clipping Plane
          <span className="control-value">{clipPlaneY < 9.9 ? clipPlaneY.toFixed(1) : 'Off'}</span>
        </label>
        <input
          type="range" min="-5" max="10" step="0.1"
          value={clipPlaneY}
          onChange={(e) => setClipPlaneY(Number(e.target.value))}
          className="slider"
        />
      </div>

      {/* Toggles */}
      <div className="control-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div className="control-group">
          <label className="control-label">Auto Rotate</label>
          <button className={`toggle-btn ${autoRotate ? 'on' : ''}`} onClick={() => setAutoRotate(!autoRotate)}>
            <div className="toggle-knob" />
          </button>
        </div>
        <div className="control-group">
          <label className="control-label">Contours</label>
          <button className={`toggle-btn ${showContours ? 'on' : ''}`} onClick={() => setShowContours(!showContours)}>
            <div className="toggle-knob" />
          </button>
        </div>
        <div className="control-group">
          <label className="control-label">Particles</label>
          <button className={`toggle-btn ${showParticles ? 'on' : ''}`} onClick={() => setShowParticles(!showParticles)}>
            <div className="toggle-knob" />
          </button>
        </div>
      </div>

      {/* Speed */}
      <div className="control-group">
        <label className="control-label">
          Speed
          <span className="control-value">{animationSpeed.toFixed(1)}×</span>
        </label>
        <input
          type="range" min="0.1" max="3" step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(Number(e.target.value))}
          className="slider"
        />
        </div>
      </div>
    </div>
  );
}
