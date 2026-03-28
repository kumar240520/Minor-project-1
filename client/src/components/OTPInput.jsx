import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const OTPInput = ({ 
  otp, 
  onChange, 
  onKeyDown, 
  onPaste, 
  disabled = false 
}) => {
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  // Handle input change
  const handleChange = (value, index) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    onChange(numericValue.slice(-1), index); // Take only last character

    // Auto-focus next input
    if (numericValue && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down
  const handleKeyDown = (e, index) => {
    onKeyDown(e, index);
    
    // Move to next input on arrow right
    if (e.key === 'ArrowRight' && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Move to previous input on arrow left
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2 sm:space-x-3">
      {otp.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? onPaste : undefined}
            disabled={disabled}
            className="w-10 h-10 sm:w-11 sm:h-11 text-center text-lg sm:text-xl font-bold rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="0"
            autoComplete="off"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default OTPInput;
