import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="ds-toggle">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`
        ds-toggle-track
        ${checked ? 'ds-toggle-track-enabled' : 'ds-toggle-track-disabled'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}>
        <div className={`
          ds-toggle-thumb
          ${checked ? 'ds-toggle-thumb-enabled' : 'ds-toggle-thumb-disabled'}
        `} />
      </div>
    </label>
  );
};

export default ToggleSwitch; 