import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, MapPin, Lock, AlertCircle, CheckCircle2, Store, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setValidationErrors([]);
  };

  // Real-time checks
  const isNameLengthValid = formData.name.length >= 20 && formData.name.length <= 60;
  const isAddressValid = formData.address.length > 0 && formData.address.length <= 400;
  const isPasswordLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F1] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white border border-[#E2E5DF] rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
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
                Join the trusted rating community.
              </h2>
              <p className="text-xs sm:text-sm text-[#D0E2DB] font-normal leading-relaxed">
                Create your StoreRate account to discover local stores, share ratings, and help fellow consumers.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2F6654] space-y-2 relative z-10 text-xs text-[#A3C2B6]">
            <div className="flex items-center space-x-2 text-[#C9A24A] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Authentic Reviews Only</span>
            </div>
            <p className="text-[11px]">Strict 1 rating per store rule per registered account.</p>
          </div>
        </div>

        {/* Right Column: Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5 bg-white">
          <div className="space-y-1 text-left">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171A18] tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-[#707873]">Enter your details to register as a StoreRate member</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-[#9B2C2C] text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-[#9B2C2C] text-xs text-left">
              <p className="font-bold mb-1">Please correct the following errors:</p>
              {validationErrors.map((err, index) => (
                <p key={index}>• {err.field ? `${err.field}: ` : ''}{err.message}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-left">
            {/* Full Name */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-bold text-[#707873] uppercase tracking-wider">
                <label>Full Name</label>
                <span className={`font-mono text-[10px] ${isNameLengthValid ? 'text-[#173D32] font-bold' : 'text-[#707873]'}`}>
                  {formData.name.length} / 20–60 chars
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Johnathan Alexander Smith"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
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
                  placeholder="johnathan@example.com"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-bold text-[#707873] uppercase tracking-wider">
                <label>Address</label>
                <span className={`font-mono text-[10px] ${formData.address.length <= 400 ? 'text-[#707873]' : 'text-[#9B2C2C]'}`}>
                  {formData.address.length} / max 400 chars
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-3" />
                <textarea
                  name="address"
                  required
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street, Kolhapur, Maharashtra 416001"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
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
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-colors"
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

              {/* Password Validation Indicator */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                <div className={`flex items-center space-x-1 ${isPasswordLengthValid ? 'text-[#173D32] font-bold' : 'text-[#707873]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>8–16 Chars</span>
                </div>
                <div className={`flex items-center space-x-1 ${hasUppercase ? 'text-[#173D32] font-bold' : 'text-[#707873]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 Uppercase</span>
                </div>
                <div className={`flex items-center space-x-1 ${hasSpecialChar ? 'text-[#173D32] font-bold' : 'text-[#707873]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 Special Char</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2 text-xs sm:text-sm mt-3"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-[#707873] pt-3 border-t border-[#E2E5DF]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#173D32] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
