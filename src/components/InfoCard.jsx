import { SURFACE_DEFS } from '../surfaces';

export default function InfoCard({ surfaceId }) {
  const surface = SURFACE_DEFS.find((s) => s.id === surfaceId);
  if (!surface) return null;

  return (
    <div className="info-card">
      <div className="info-name">{surface.name}</div>
      <div className="info-formula">
        <code>{surface.formula}</code>
      </div>
      <div className="info-description">{surface.description}</div>
      <div className="info-hint">
        <span className="hint-icon">↻</span>
        Drag to rotate · Scroll to zoom · Right-drag to pan
      </div>
    </div>
  );
}
