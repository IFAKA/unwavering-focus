import React from 'react';

interface ColorInputProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorInput: React.FC<ColorInputProps> = ({ value, onChange, className = '' }) => {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-8 h-8 rounded border-none cursor-pointer ${className}`}
      style={{ backgroundColor: value }}
    />
  );
};

export default ColorInput; 