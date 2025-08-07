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
      className={`
        w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-5
        [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-accent-primary
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-moz-range-thumb]:w-5
        [&::-moz-range-thumb]:h-5
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:bg-accent-primary
        [&::-moz-range-thumb]:border-none
        [&::-moz-range-thumb]:cursor-pointer
        ${className}
      `}
    />
  );
};

export default RangeSlider; 