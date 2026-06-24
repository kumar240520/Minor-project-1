import { useState, useEffect, useCallback } from 'react';

export const OTP_LENGTH = 6;
const createEmptyOtp = () => Array(OTP_LENGTH).fill('');

export const useOTP = () => {
  const [otp, setOtp] = useState(createEmptyOtp);
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerActive) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setIsTimerActive(false);
          setCanResend(true);
          return 0;
        }

        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Start timer
  const startTimer = useCallback(() => {
    setTimer(30);
    setIsTimerActive(true);
    setCanResend(false);
  }, []);

  // Handle OTP input change
  const handleOtpChange = useCallback((value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  }, [otp]);

  // Handle OTP input keydown for auto-focus
  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  }, [otp]);

  // Handle OTP input paste
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only allow numbers and max configured OTP length
    const numericData = pastedData.replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    if (numericData.length === OTP_LENGTH) {
      const newOtp = numericData.split('');
      setOtp(newOtp);
      
      // Focus on the last input
      const lastInput = document.getElementById(`otp-${OTP_LENGTH - 1}`);
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, []);

  // Clear OTP
  const clearOtp = useCallback(() => {
    setOtp(createEmptyOtp());
  }, []);

  // Get OTP as string
  const getOtpString = useCallback(() => {
    return otp.join('');
  }, [otp]);

  // Check if OTP is complete
  const isOtpComplete = useCallback(() => {
    return otp.every(digit => digit !== '');
  }, [otp]);

  // Reset timer and allow resend
  const allowResend = useCallback(() => {
    setTimer(0);
    setIsTimerActive(false);
    setCanResend(true);
  }, []);

  return {
    otp,
    timer,
    isTimerActive,
    canResend,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    clearOtp,
    getOtpString,
    isOtpComplete,
    startTimer,
    allowResend
  };
};
