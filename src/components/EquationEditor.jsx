import { useState } from 'react';

const SHORTCUTS = [
  { label: 'sin()', insert: 'sin(' },
  { label: 'cos()', insert: 'cos(' },
  { label: 'tan()', insert: 'tan(' },
  { label: 'sqrt()', insert: 'sqrt(' },
  { label: 'ln()', insert: 'log(' },
  { label: 'e', insert: 'e' },
  { label: 'π', insert: 'pi' },
  { label: '^', insert: '^' },
  { label: 'x', insert: 'x' },
  { label: 'y', insert: 'y' },
];

export default function EquationEditor({ equation, setEquation }) {
  const [localEq, setLocalEq] = useState(equation);

  const handleApply = () => {
    setEquation(localEq);
  };

  const insertText = (text) => {
    setLocalEq(prev => prev + text);
  };

  return (
    <div className="control-group">
      <label className="control-label">Equation (z = )</label>
      <div className="equation-editor">
        <div className="shortcuts">
          {SHORTCUTS.map(sc => (
            <button 
              key={sc.label} 
              className="shortcut-btn" 
              onClick={() => insertText(sc.insert)}
              title={sc.label}
            >
              {sc.label}
            </button>
          ))}
        </div>
        <div className="equation-input-group">
          <input 
            type="text" 
            className="equation-input" 
            value={localEq} 
            onChange={e => setLocalEq(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            placeholder="e.g. sin(x) + cos(y)"
          />
          <button className="apply-btn" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
