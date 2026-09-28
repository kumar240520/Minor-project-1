import React, { forwardRef } from 'react';
import CodeSlots from './CodeSlots';

const OTPInput = forwardRef(({ 
  otp, 
  onChange, 
  onCodeChange,
  onKeyDown, 
  onPaste, 
  disabled = false,
  status = 'idle',
  autoFocus = true,
  onComplete,
  length = 6,
  slotSize = 46,
  gap = 8,
  radius = 12,
  className = ''
}, ref) => {
  const codeValue = Array.isArray(otp) ? otp.join('') : String(otp ?? '');

  const handleChange = (newCode) => {
    if (typeof onCodeChange === 'function') {
      onCodeChange(newCode);
    }
    if (typeof onChange === 'function') {
      const clean = String(newCode || '').replace(/\D/g, '').slice(0, length);
      for (let i = 0; i < length; i++) {
        const char = clean[i] || '';
        onChange(char, i);
      }
    }
  };

  return (
    <div className={`flex justify-center items-center w-full my-2.5 overflow-x-auto py-1 ${className}`}>
      <CodeSlots
        ref={ref}
        length={length}
        value={codeValue}
        onChange={handleChange}
        onComplete={onComplete}
        status={status}
        disabled={disabled}
        autoFocus={autoFocus}
        slotSize={slotSize}
        gap={gap}
        radius={radius}
      />
    </div>
  );
});

export { CodeSlots };
export default OTPInput;
