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
}) {
  const [activeCategory, setActiveCategory] = useState('waves');
  const categorySurfaces = SURFACE_DEFS.filter((s) => s.category === activeCategory);

  return (
    <div className="control-panel">
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
      <div className="control-group">
        <label className="control-label">
          Surface
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

      {/* Display Mode */}
      <div className="control-group">
        <label className="control-label">Display</label>
        <div className="mode-toggle">
          {DISPLAY_MODES.map((m) => (
            <button
              key={m.value}
              className={`mode-btn ${displayMode === m.value ? 'active' : ''}`}
              onClick={() => setDisplayMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div className="control-group">
        <label className="control-label">Color</label>
        <div className="color-chips">
          {Object.entries(COLOR_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`color-chip ${colorScheme === key ? 'active' : ''}`}
              onClick={() => setColorScheme(key)}
              title={label}
            >
              <span className={`chip-swatch swatch-${key}`} />
              <span className="chip-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Auto Rotate */}
      <div className="control-group control-row">
        <label className="control-label">Auto Rotate</label>
        <button
          className={`toggle-btn ${autoRotate ? 'on' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          <span className="toggle-knob" />
        </button>
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
  );
}
