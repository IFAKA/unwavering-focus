import React from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  step?: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ 
  min, 
  max, 
  value, 
  onChange, 
  className = '', 
  step = 1 
}) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      step={step}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className={`ds-range ${className}`}
    />
  );
};

export default RangeSlider; 