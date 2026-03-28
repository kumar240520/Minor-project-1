import { useState, useEffect, useCallback } from 'react';

export const useOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

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
    
    // Only allow numbers and max 8 digits
    const numericData = pastedData.replace(/\D/g, '').slice(0, 8);
    
    if (numericData.length === 8) {
      const newOtp = numericData.split('');
      setOtp(newOtp);
      
      // Focus on the last input
      const lastInput = document.getElementById('otp-7');
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, []);

  // Clear OTP
  const clearOtp = useCallback(() => {
    setOtp(['', '', '', '', '', '', '', '']);
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
