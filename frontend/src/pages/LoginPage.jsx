import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Store, Star, Eye, EyeOff, ArrowLeft, Info, X, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setValidationErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);

    try {
      await login(formData, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F1] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white border border-[#E2E5DF] rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Left Column: Brand Story Panel */}
        <div className="lg:col-span-5 bg-[#173D32] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-xs text-[#D0E2DB] hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to StoreRate</span>
            </Link>

            <div className="space-y-3 pt-4">
              <div className="p-3 bg-[#2F6654] border border-[#3E7D69] text-[#C9A24A] rounded-2xl w-fit">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Your experience helps others choose better.
              </h2>
              <p className="text-xs sm:text-sm text-[#D0E2DB] font-normal leading-relaxed">
                Sign in to manage your rating history, evaluate local stores, and access your role portal.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2F6654] space-y-2 relative z-10 text-xs text-[#A3C2B6]">
            <div className="flex items-center space-x-2 text-[#C9A24A] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Authentication</span>
            </div>
            <p className="text-[11px]">Protected session tokens & encrypted transmission.</p>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6 bg-white">
          <div className="space-y-1 text-left">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171A18] tracking-tight">
              Sign In to StoreRate
            </h1>
            <p className="text-xs text-[#707873]">Enter your account email and password</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-[#9B2C2C] text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-[#9B2C2C] text-xs">
              {validationErrors.map((err, index) => (
                <p key={index}>• {err.message}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-[#707873] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-[#707873] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-3 pl-10 pr-10 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707873] hover:text-[#171A18] focus:outline-none p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Utility Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E5DF] text-[#173D32] focus:ring-2 focus:ring-[#173D32]/30 accent-[#173D32] cursor-pointer"
                />
                <span className="text-[#707873] font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[#173D32] hover:text-[#2F6654] font-bold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2 text-xs sm:text-sm mt-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="text-center text-xs text-[#707873] pt-4 border-t border-[#E2E5DF]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#173D32] font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Helper Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative text-left">
            <div className="flex items-start justify-between border-b border-[#E2E5DF] pb-3">
              <div className="flex items-center space-x-2 text-[#173D32]">
                <Info className="w-5 h-5" />
                <h3 className="font-display text-base font-bold text-[#171A18]">Demo Account Credentials</h3>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="text-[#707873] hover:text-[#171A18] p-1 rounded-lg hover:bg-[#F7F6F1] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#707873]">
              <p>
                In this local demo environment, accounts are managed via pre-configured seed profiles. Select one of the seeded accounts below:
              </p>

              <div className="bg-[#F7F6F1] p-3.5 rounded-xl border border-[#E2E5DF] space-y-2.5 font-mono text-[11px]">
                <div>
                  <span className="text-[#173D32] font-bold block">Normal Consumer:</span>
                  <span className="text-[#171A18]">user@storerate.local / User@123456</span>
                </div>
                <div>
                  <span className="text-[#C9A24A] font-bold block">Store Owner:</span>
                  <span className="text-[#171A18]">owner@storerate.local / Owner@123456</span>
                </div>
                <div>
                  <span className="text-[#171A18] font-bold block">Administrator:</span>
                  <span className="text-[#171A18]">admin@storerate.local / Admin@123456</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-[#E2E5DF]">
              <button
                onClick={() => setForgotModalOpen(false)}
                className="px-5 py-2 bg-[#173D32] text-white font-bold rounded-xl text-xs hover:bg-[#2F6654] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
