import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className={`
        w-11 h-6 bg-bg-tertiary rounded-full transition-all duration-200 relative
        ${checked ? 'bg-accent-primary' : 'bg-bg-tertiary'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}>
        <div className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </div>
    </label>
  );
};

export default ToggleSwitch; 