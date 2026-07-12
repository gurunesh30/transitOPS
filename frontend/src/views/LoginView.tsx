import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Eye, EyeOff, Lock, Mail, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';

export const LoginView: React.FC = () => {
  const {
    setCurrentUser,
    selectedRole,
    setSelectedRole,
    failedAttempts,
    incrementFailedAttempts,
    resetFailedAttempts,
    isLocked,
    addToast,
    addLog,
    lastLoginTime
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pwdStrength, setPwdStrength] = useState<{ score: number; label: string; color: string }>({
    score: 0,
    label: 'Too Short',
    color: 'bg-brand-danger w-0'
  });

  const DEMO_EMAIL = 'manager@transitops.com';
  const DEMO_PASSWORD = 'Password123!';

  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters long.');
        setPwdStrength({ score: 1, label: 'Weak', color: 'bg-brand-danger w-1/3' });
      } else {
        setPasswordError('');

        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (hasUpper && hasNumber && hasSpecial) {
          setPwdStrength({ score: 3, label: 'Strong', color: 'bg-brand-success w-full' });
        } else if (hasUpper || hasNumber || hasSpecial) {
          setPwdStrength({ score: 2, label: 'Medium', color: 'bg-brand-warning w-2/3' });
        } else {
          setPwdStrength({ score: 1, label: 'Weak', color: 'bg-brand-danger w-1/3' });
        }
      }
    } else {
      setPasswordError('');
      setPwdStrength({ score: 0, label: 'Too Short', color: 'bg-brand-danger w-0' });
    }
  }, [password]);

  const isFormValid =
    email &&
    password &&
    !emailError &&
    !passwordError &&
    password.length >= 8 &&
    !isLocked;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    setTimeout(() => {
      if (password !== DEMO_PASSWORD) {
        setLoading(false);
        incrementFailedAttempts();
        addToast('Invalid password credentials. Please try again.', 'danger', 'Login Failed');
        addLog('alert', `Failed authentication attempt using email ${email}`, 'warning');
      } else {
        setLoading(false);
        setSuccessAnim(true);
        addToast(`Welcome back, ${selectedRole}!`, 'success', 'Login Successful');
        addLog('vehicle', `User logged in with role: ${selectedRole}`, 'success');

        setTimeout(() => {
          setCurrentUser({
            id: 'u1',
            name: 'Alex Mercer',
            email,
            role: selectedRole
          });
        }, 1000);
      }
    }, 1500);
  };

  const fillDemoCreds = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    addToast('Demo credentials pre-filled!', 'info');
  };

  if (isLocked) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center relative bg-bg-primary overflow-hidden p-4">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-primary/10 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-secondary/10 blur-[90px]" />

        <div className="w-full max-w-md relative z-10">
          <Card variant="elevated" className="p-7 md:p-8 bg-bg-secondary/85 backdrop-blur-md border border-brand-danger/30 shadow-2xl">
            <div className="text-center mb-8 animate-scale-up">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-brand-danger/10 text-brand-danger mb-4 border border-brand-danger/20">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Account Temporarily Locked</h2>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                You have exceeded the maximum of 5 failed login attempts. To safeguard fleet telemetry, this terminal has been locked.
              </p>
            </div>
            <Button
              onClick={() => {
                resetFailedAttempts();
                addToast('Developer Unlock: attempts reset.', 'success');
              }}
              variant="danger"
              className="w-full"
              size="lg"
            >
              Reset Security Lockout
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative bg-bg-primary overflow-hidden p-4">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-primary/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-secondary/10 blur-[90px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-primary-hover shadow-xl shadow-brand-primary/25 mb-4 border border-brand-primary/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Transit<span className="text-brand-primary">Ops</span>
          </h1>
          <p className="text-xs text-text-muted mt-1.5 uppercase tracking-widest font-semibold">
            Smart Transport Operations Platform
          </p>
        </div>

        <Card variant="elevated" className="relative overflow-hidden rounded-2xl border border-border-primary p-7 md:p-8 bg-bg-secondary/85 backdrop-blur-md shadow-2xl">
          {successAnim && (
            <div className="absolute inset-0 z-30 bg-bg-secondary flex flex-col items-center justify-center gap-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full border-4 border-brand-success border-t-transparent animate-spin" />
              <span className="text-sm font-bold text-brand-success animate-pulse">Launching Operations Dashboard...</span>
            </div>
          )}

          <h2 className="text-xl font-bold text-text-primary mb-6">Security Portal</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Picker dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Authorized Role</span>
              </label>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                options={[
                  { value: 'Fleet Manager', label: 'Fleet Manager' },
                  { value: 'Dispatcher', label: 'Dispatcher' },
                  { value: 'Safety Officer', label: 'Safety Officer' },
                  { value: 'Financial Analyst', label: 'Financial Analyst' },
                ]}
                className="w-full"
              />
            </div>

            {/* Email field */}
            <Input
              type="email"
              placeholder="name@transitops.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Corporate Email"
              leftIcon={<Mail className="w-3.5 h-3.5" />}
              error={emailError}
              required
            />

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Secure Access Key</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addToast('Credential recovery is managed by your active tenant administrator.', 'warning', 'SSO Help')}
                >
                  Forgot Password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter passkey"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={passwordError}
                  required
                />
              </div>
              {passwordError && (
                <p className="text-xs text-brand-danger flex items-center gap-1 font-medium mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-muted">Passkey Complexity:</span>
                  <span className="font-bold text-text-secondary">{pwdStrength.label}</span>
                </div>
                <div className="w-full bg-bg-tertiary h-1.5 rounded-full overflow-hidden">
                  <div className={`${pwdStrength.color} h-full rounded-full transition-all duration-300`} />
                </div>
              </div>
            )}

            {/* Remember Me checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={isRemembered}
                onChange={(e) => setIsRemembered(e.target.checked)}
                className="rounded border-border-primary text-brand-primary focus:ring-brand-primary bg-bg-primary w-4 h-4"
              />
              <label htmlFor="remember" className="text-xs text-text-secondary cursor-pointer select-none">
                Remember this workstation session
              </label>
            </div>

            {/* Failed attempts helper */}
            {failedAttempts > 0 && (
              <div className="p-3 bg-brand-danger/5 border border-brand-danger/20 rounded-xl flex items-center gap-2.5 text-xs text-brand-danger font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Failed Attempts: {failedAttempts}/5 before lockdown.</span>
              </div>
            )}

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full mt-2"
              size="lg"
              loading={loading}
              leftIcon={!loading && <ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Validating Passkey...' : 'Decrypt Telemetry Node'}
            </Button>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fillDemoCreds}
              className="w-full"
            >
              Auto-Fill Demo Credentials
            </Button>
            <div className="mt-2 text-[10px] text-text-muted font-mono">
              Email: manager@transitops.com | Pwd: Password123!
            </div>
          </div>
        </Card>

        {/* Security Audit footer details */}
        <div className="text-center mt-6 text-[10px] text-text-muted space-y-1">
          <p>Protected by TransitOps Cryptographic Node Key Exchange.</p>
          <p>Last Successful Access: {lastLoginTime || 'No historical record for this terminal'}</p>
        </div>
      </div>
    </div>
  );
};