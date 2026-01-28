/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'; // Added RefreshCw icon
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State for 2FA
  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN');
  const [tempUserId, setTempUserId] = useState('');
  
  // OTP Inputs
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 👇 NEW: Timer State
  const [timer, setTimer] = useState(40);
  const [canResend, setCanResend] = useState(false);

  const { register, handleSubmit } = useForm();

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first box on step change
  useEffect(() => {
    if (step === 'OTP') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // --- STEP 1: CREDENTIALS ---
  const onLogin = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      
      if (res.data.require_otp) {
        setTempUserId(res.data.userId);
        setStep('OTP');
        
        // Reset Timer
        setTimer(40);
        setCanResend(false);
        
        toast.info("OTP sent to your email");
        setLoading(false);
        return; 
      }

      AuthService.setToken(res.data.token);
      AuthService.setUser(res.data.user);
      toast.success("Welcome back!");
      handleRedirect(res.data.user.role);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleVerifyClick = async () => {
    const finalOtp = otpValues.join('');
    if (finalOtp.length !== 6) return toast.error("Please enter the full 6-digit code");
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        userId: tempUserId,
        otp: finalOtp
      });

      AuthService.setToken(res.data.token);
      AuthService.setUser(res.data.user);
      
      toast.success("Admin verification successful!");
      router.push('/admin');

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      setLoading(false);
    }
  };

  // 👇 NEW: RESEND HANDLER
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    // Reset UI immediately
    setCanResend(false);
    setTimer(40);
    setOtpValues(['', '', '', '', '', '']); // Clear inputs
    inputRefs.current[0]?.focus(); // Refocus first box

    try {
      await api.post('/auth/resend-otp', { userId: tempUserId });
      toast.success("New code sent to your email");
    } catch (error) {
      toast.error("Failed to resend code");
      setCanResend(true); // Re-enable if failed
      setTimer(0);
    }
  };

  // ... (Keep handleOtpChange, handleKeyDown, handlePaste, handleRedirect same as before)
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
      const newOtp = [...otpValues];
      pastedData.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
      setOtpValues(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleRedirect = (role: string) => {
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'VENDOR') router.push('/vendor');
    else router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 'LOGIN' ? 'Sign in to Nexus' : 'Security Verification'}
          </CardTitle>
          <CardDescription>
            {step === 'LOGIN' 
              ? 'Enter your email and password to access your account.' 
              : 'Please enter the 6-digit code sent to your email.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {step === 'LOGIN' && (
            <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register('email', { required: true })} placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...register('password', { required: true })} />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Sign In
              </Button>
            </form>
          )}

          {step === 'OTP' && (
            <div className="space-y-6">
              <div className="flex justify-center my-4">
                 <div className="bg-blue-50 p-4 rounded-full animate-in zoom-in duration-300">
                    <ShieldCheck className="h-10 w-10 text-blue-600" />
                 </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-center block text-slate-600 mb-4">One-Time Password (OTP)</Label>
                
                <div className="flex justify-center gap-2">
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold border border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-800"
                    />
                  ))}
                </div>
              </div>

              {/* 👇 RESEND SECTION */}
              <div className="text-center text-sm">
                 {canResend ? (
                   <button 
                     onClick={handleResendOtp}
                     className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mx-auto"
                   >
                     <RefreshCw className="h-3 w-3" /> Resend Code
                   </button>
                 ) : (
                   <p className="text-slate-400">
                     Resend code in <span className="font-mono text-slate-600">{timer}s</span>
                   </p>
                 )}
              </div>

              <Button onClick={handleVerifyClick} className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                Verify & Login
              </Button>
              
              <div className="text-center">
                 <button 
                   type="button" 
                   onClick={() => { setStep('LOGIN'); setOtpValues(['','','','','','']); }} 
                   className="text-xs text-slate-500 hover:underline"
                 >
                   Back to Login
                 </button>
              </div>
            </div>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
}