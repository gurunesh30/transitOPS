import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Eye, EyeOff, AlertTriangle, ArrowRight, Loader } from 'lucide-react';

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
    lastLoginTime,
    login,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  // Errors state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pwdStrength, setPwdStrength] = useState<{ score: number; label: string; color: string }>({
    score: 0,
    label: 'Too Short',
    color: 'bg-red-500'
  });

  // Demo credential configurations
  const DEMO_EMAIL = 'manager@transitops.com';
  const DEMO_PASSWORD = 'Password123!';

  // Real-time validations
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
        setPwdStrength({ score: 1, label: 'Weak', color: 'bg-red-500 w-1/3' });
      } else {
        setPasswordError('');
        
        // Calculate password complexity strength
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (hasUpper && hasNumber && hasSpecial) {
          setPwdStrength({ score: 3, label: 'Strong', color: 'bg-emerald-500 w-full' });
        } else if (hasUpper || hasNumber || hasSpecial) {
          setPwdStrength({ score: 2, label: 'Medium', color: 'bg-amber-500 w-2/3' });
        } else {
          setPwdStrength({ score: 1, label: 'Weak', color: 'bg-red-500 w-1/3' });
        }
      }
    } else {
      setPasswordError('');
      setPwdStrength({ score: 0, label: 'Too Short', color: 'bg-red-500 w-0' });
    }
  }, [password]);

  // Form validity
  const isFormValid =
    email &&
    password &&
    !emailError &&
    !passwordError &&
    password.length >= 8 &&
    !isLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    const success = await login(email, password);
    
    if (success) {
      setSuccessAnim(true);
      setTimeout(() => {
        setSuccessAnim(false);
      }, 1500);
    }

    setLoading(false);
  };

  const fillDemoCreds = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    addToast('Demo credentials pre-filled!', 'info');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative bg-[#0F1115] overflow-hidden p-4">
      {/* Background Decorative Rings/Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[90px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Top Logo and Tagline */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/25 mb-4 border border-amber-400/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Transit<span className="text-amber-500">Ops</span>
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1.5 uppercase tracking-widest font-semibold">
            Smart Transport Operations Platform
          </p>
        </div>

        {/* Locked Overlay Warning */}
        {isLocked ? (
          <div className="glass-panel border-red-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-500/10 text-red-500 mb-2 border border-red-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white">Account Temporarily Locked</h2>
              <p className="text-sm text-white/60 leading-relaxed">
                You have exceeded the maximum of 5 failed login attempts. To safeguard fleet telemetry, this terminal has been locked.
              </p>
            </div>
            <button
              onClick={() => {
                resetFailedAttempts();
                addToast('Developer Unlock: attempts reset.', 'success');
              }}
              className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm"
            >
              Reset Security Lockout
            </button>
          </div>
        ) : (
          /* Login Card Form */
          <div className="theme-card relative overflow-hidden rounded-2xl border border-[#2A2E36] p-7 md:p-8 bg-[#1B1E24]/85 backdrop-blur-md shadow-2xl">
            {successAnim && (
              <div className="absolute inset-0 z-30 bg-[#1B1E24] flex flex-col items-center justify-center gap-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-sm font-bold text-emerald-400 animate-pulse">Launching Operations Dashboard...</span>
              </div>
            )}

            <h2 className="text-xl font-bold text-white mb-6">Security Portal</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Picker dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Authorized Role</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full theme-input p-3 text-sm font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Corporate Email</span>
                </label>
                <input
                  type="email"
                  placeholder="name@transitops.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full theme-input p-3 text-sm ${
                    emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  required
                />
                {emailError && (
                  <p className="text-xs text-red-400 flex items-center gap-1 font-medium mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Secure Access Key</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => addToast('Credential recovery is managed by your active tenant administrator.', 'warning', 'SSO Help')}
                    className="text-[10px] text-amber-500/80 hover:text-amber-400 transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter passkey"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full theme-input p-3 pr-10 text-sm ${
                      passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-400 flex items-center gap-1 font-medium mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40">Passkey Complexity:</span>
                    <span className="font-bold text-white/60">{pwdStrength.label}</span>
                  </div>
                  <div className="w-full bg-[#2A2E36] h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color}`} />
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
                  className="rounded border-[#2A2E36] text-amber-500 focus:ring-amber-500 bg-[#0F1115] w-4 h-4"
                />
                <label htmlFor="remember" className="text-xs text-white/50 cursor-pointer select-none">
                  Remember this workstation session
                </label>
              </div>

              {/* Failed attempts helper */}
              {failedAttempts > 0 && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-xs text-red-400 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Failed Attempts: {failedAttempts}/5 before lockdown.</span>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full mt-2 py-3 px-4 rounded-xl btn-primary transition-all flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Validating Passkey...</span>
                  </>
                ) : (
                  <>
                    <span>Decrypt Telemetry Node</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Assist */}
            <div className="mt-6 border-t border-white/5 pt-4 text-center">
              <button
                onClick={fillDemoCreds}
                className="text-xs text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5"
              >
                Auto-Fill Demo Credentials
              </button>
              <div className="mt-2 text-[10px] text-white/30 font-mono">
                Email: manager@transitops.com | Pwd: Password123!
              </div>
            </div>
          </div>
        )}

        {/* Security Audit footer details */}
        <div className="text-center mt-6 text-[10px] text-[#6B7280] space-y-1">
          <p>Protected by TransitOps Cryptographic Node Key Exchange.</p>
          <p>Last Successful Access: {lastLoginTime || 'No historical record for this terminal'}</p>
        </div>
      </div>
    </div>
  );
};
