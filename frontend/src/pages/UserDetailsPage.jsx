import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserById } from '../api/adminService';
import { User, Mail, MapPin, Store, Star, ArrowLeft } from 'lucide-react';

const UserDetailsPage = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserById(id);
        if (response.status === 'success') {
          setUserData(response.data.user);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-[#707873] text-xs font-medium">
        Loading user profile details...
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 text-left">
        <Link to="/admin/users" className="inline-flex items-center space-x-1.5 text-xs text-[#173D32] hover:underline font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to User Operations</span>
        </Link>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs sm:text-sm">
          {error || 'User record not found'}
        </div>
      </div>
    );
  }

  // Brand-Coherent Role Badges (NO PURPLE)
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#171A18] text-white border-[#333835]';
      case 'STORE_OWNER':
        return 'bg-[#F5E6C8] text-[#9A7525] border-[#E8D4A8]';
      case 'USER':
      default:
        return 'bg-[#E7F0EB] text-[#173D32] border-[#CDE0D5]';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left text-[#171A18]">
      <Link to="/admin/users" className="inline-flex items-center space-x-1.5 text-xs text-[#173D32] hover:underline font-bold transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to User Operations List</span>
      </Link>

      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#E7F0EB] border border-[#CDE0D5] rounded-xl text-[#173D32]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#171A18] tracking-tight">{userData.name}</h1>
              <p className="text-xs text-[#707873]">Account Telemetry & Role Profile</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getRoleBadge(userData.role)}`}>
            {userData.role}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
            <p className="text-[#707873] font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-[#9CA59E]" />
              <span>Email Address</span>
            </p>
            <p className="text-sm font-mono text-[#171A18] font-semibold">{userData.email}</p>
          </div>

          <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
            <p className="text-[#707873] font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#9CA59E]" />
              <span>Physical Address</span>
            </p>
            <p className="text-xs text-[#171A18] font-semibold">{userData.address}</p>
          </div>
        </div>

        {/* If STORE_OWNER: display owned stores */}
        {userData.role === 'STORE_OWNER' && (
          <div className="pt-4 border-t border-[#E2E5DF] space-y-4">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-[#173D32]" />
              <h2 className="font-display text-sm font-bold text-[#171A18] uppercase tracking-wider">
                Assigned Stores ({userData.stores?.length || 0})
              </h2>
            </div>

            {!userData.stores || userData.stores.length === 0 ? (
              <p className="text-xs text-[#707873] italic">No stores currently assigned to this Store Owner.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.stores.map((store) => (
                  <div key={store.id} className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold text-[#171A18] text-sm">{store.name}</p>
                      <div className="flex items-center space-x-1 bg-[#F5E6C8]/60 border border-[#E8D4A8] px-2 py-0.5 rounded text-[#9A7525] font-extrabold text-[11px]">
                        <Star className="w-3 h-3 fill-[#C9A24A] text-[#C9A24A]" />
                        <span>{store.averageRating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#707873] font-mono text-[11px]">{store.email}</p>
                    <p className="text-xs text-[#707873]">{store.address}</p>
                    <p className="text-[10px] text-[#707873] pt-2 border-t border-[#E2E5DF]">
                      Total Customer Ratings: <strong className="text-[#171A18]">{store.totalRatings}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsPage;
