import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRatings } from '../api/userStoreService';
import StarRating from '../components/StarRating';
import { User, Shield, Calendar, KeyRound, CheckCircle2, Star, Activity, LogOut, RefreshCw, Compass } from 'lucide-react';

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await getMyRatings();
        if (response.status === 'success') {
          setRatings(response.data.ratings || []);
        }
      } catch (err) {
        console.error('Failed to load user profile ratings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'SR';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'August 2026';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'August 2026';
    }
  };

  const totalRatingsGiven = ratings.length;
  const averageGiven = totalRatingsGiven > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatingsGiven).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18] text-left">
      {/* Header Profile Identity */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          <div className="w-16 h-16 bg-[#173D32] text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-xs border border-[#2F6654]">
            {getInitials(user.name)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171A18] tracking-tight">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold border border-[#CDE0D5] bg-[#E7F0EB] text-[#173D32] uppercase tracking-wide self-center sm:self-auto">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-[#707873] font-mono">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/user/ratings"
            className="px-4 py-2 bg-[#E7F0EB] hover:bg-[#D8E6DE] text-[#173D32] font-bold rounded-xl text-xs transition-colors border border-[#CDE0D5] flex items-center space-x-1.5"
          >
            <Star className="w-3.5 h-3.5 fill-[#C9A24A] text-[#C9A24A]" />
            <span>My Ratings</span>
          </Link>
        </div>
      </div>

      {/* Activity Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
            STORES RATED
          </span>
          <div className="text-3xl font-black text-[#173D32]">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin text-[#173D32]" /> : totalRatingsGiven}
          </div>
          <span className="text-[11px] text-[#707873]">Total submissions</span>
        </div>

        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
            AVERAGE GIVEN
          </span>
          <div className="text-3xl font-black text-[#C9A24A]">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin text-[#C9A24A]" /> : `${averageGiven} ★`}
          </div>
          <span className="text-[11px] text-[#707873]">Rating scale mean</span>
        </div>

        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">
            ACCOUNT STATUS
          </span>
          <div className="text-xl font-bold text-[#173D32] flex items-center space-x-1.5 pt-1">
            <CheckCircle2 className="w-5 h-5 text-[#173D32]" />
            <span>Verified User</span>
          </div>
          <span className="text-[11px] text-[#707873]">1 rating per store limit</span>
        </div>
      </div>

      {/* Information & Recent Activity Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Account Details */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E2E5DF] pb-3 flex items-center space-x-2">
            <User className="w-4 h-4 text-[#173D32]" />
            <h2 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">Account Credentials</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Full Name
              </span>
              <p className="font-bold text-[#171A18]">{user.name}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Email Address
              </span>
              <p className="font-mono text-[#171A18]">{user.email}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Physical Address
              </span>
              <p className="text-[#171A18]">{user.address || 'Not provided'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
                Registration Date
              </span>
              <div className="flex items-center space-x-1.5 text-[#707873]">
                <Calendar className="w-3.5 h-3.5 text-[#9CA59E]" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E2E5DF] pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#173D32]" />
              <h2 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">Recent Activity</h2>
            </div>
            {totalRatingsGiven > 0 && (
              <Link to="/user/ratings" className="text-[11px] font-bold text-[#173D32] hover:underline">
                View All ({totalRatingsGiven})
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-[#707873]">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#173D32]" />
            </div>
          ) : ratings.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs font-bold text-[#171A18]">No activity records yet</p>
              <p className="text-[11px] text-[#707873]">Start reviewing local businesses to see your activity timeline.</p>
              <Link
                to="/user/stores"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#173D32] hover:underline pt-1"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Stores</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ratings.slice(0, 3).map((r) => (
                <div key={r.id} className="bg-[#F7F6F1] p-3 rounded-xl border border-[#E2E5DF] flex items-center justify-between text-xs">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <p className="font-bold text-[#171A18] truncate">{r.store?.name}</p>
                    <p className="text-[10px] text-[#707873] font-mono">{formatDate(r.updatedAt || r.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <StarRating value={r.rating} readOnly size="sm" />
                    <span className="font-bold text-[#C9A24A]">{r.rating}.0</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security & Logout Actions */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 shadow-xs space-y-4 text-left">
        <div className="border-b border-[#E2E5DF] pb-3 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#173D32]" />
          <h2 className="text-xs font-bold text-[#171A18] uppercase tracking-wider">Security & Session</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block mb-0.5">
              Account Password
            </span>
            <p className="font-mono text-[#707873]">••••••••••••</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/change-password"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#F7F6F1] hover:bg-[#E7F0EB] text-[#173D32] font-bold rounded-xl text-xs transition-colors border border-[#E2E5DF]"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#173D32]" />
              <span>Change Password</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#9B2C2C] font-bold rounded-xl text-xs transition-colors border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

