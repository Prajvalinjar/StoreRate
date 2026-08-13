import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const ChangePasswordPage = () => {
  const { changePassword } = useAuth();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    setValidationErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors([]);

    try {
      const response = await changePassword(formData);
      if (response.status === 'success') {
        setSuccess('Password updated successfully!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F1] flex flex-col items-center justify-center p-6 text-[#171A18]">
      <div className="max-w-md w-full bg-white border border-[#E2E5DF] rounded-2xl p-8 sm:p-10 shadow-xs space-y-6 text-left">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#E7F0EB] border border-[#CDE0D5] text-[#173D32] rounded-2xl flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171A18] tracking-tight">Change Password</h1>
          <p className="text-xs text-[#707873]">Update your account credentials and maintain security</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-[#9B2C2C] text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl flex items-center space-x-3 text-[#173D32] text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-[#9B2C2C] text-xs">
            {validationErrors.map((err, index) => (
              <p key={index}>• {err.message}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#707873] uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="oldPassword"
                required
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#707873] uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="newPassword"
                required
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] transition-colors"
              />
            </div>
            <p className="text-[10px] text-[#707873]">8–16 chars, 1 uppercase, 1 special char</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#707873] uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA59E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold py-3 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2 text-xs sm:text-sm mt-2"
          >
            {loading ? (
              <span>Updating password...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
