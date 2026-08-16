import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerDashboard } from '../api/ownerService';
import SafeImage from '../components/SafeImage';
import StarRating from '../components/StarRating';
import { 
  Store, MapPin, Mail, Calendar, CheckCircle2, Clock, XCircle, 
  ExternalLink, Star, Award, TrendingUp, RefreshCw, AlertCircle 
} from 'lucide-react';

const OwnerStoreDetailsPage = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStoreDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOwnerDashboard();
      if (response.status === 'success') {
        setStoreData(response.data.store);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load business store details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-[#707873] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
        <p className="text-xs font-medium">Loading store details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-[#E7F0EB] text-[#173D32] rounded-2xl flex items-center justify-center mx-auto border border-[#CDE0D5]">
            <Store className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-[#171A18]">Your store isn't listed yet.</h2>
            <p className="text-xs text-[#707873] max-w-sm mx-auto font-normal">
              Submit your business listing from the Owner Overview dashboard to get verified.
            </p>
          </div>
          <Link
            to="/owner"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs shadow-xs"
          >
            <span>Go to Owner Overview →</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18] text-left">
      {/* Banner & Header */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl overflow-hidden shadow-xs space-y-6">
        <div className="relative h-48 sm:h-56 w-full bg-[#173D32] overflow-hidden">
          <SafeImage
            src={storeData.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'}
            alt={storeData.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white z-10">
            <span className="text-[10px] font-extrabold text-[#C9A24A] uppercase tracking-widest bg-[#173D32]/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#3E7D69]">
              🏪 {storeData.category || 'General'}
            </span>

            {storeData.status === 'APPROVED' ? (
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-600 text-white px-3.5 py-1.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>APPROVED & LIVE</span>
              </span>
            ) : storeData.status === 'PENDING' ? (
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-white px-3.5 py-1.5 rounded-full flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>PENDING APPROVAL</span>
              </span>
            ) : (
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-rose-600 text-white px-3.5 py-1.5 rounded-full flex items-center space-x-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>LISTING REJECTED</span>
              </span>
            )}
          </div>
        </div>

        {/* Business Identity */}
        <div className="p-6 sm:p-8 pt-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5DF] pb-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
                BUSINESS LISTING PROFILE
              </span>
              <h1 className="font-display text-3xl font-bold text-[#171A18]">{storeData.name}</h1>
              <p className="text-xs text-[#707873] flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9CA59E] shrink-0" />
                <span>{storeData.address}</span>
              </p>
            </div>

            {storeData.status === 'APPROVED' && (
              <Link
                to={`/stores/${storeData.id}`}
                className="px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
              >
                <span>View Public Store</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C9A24A]" />
              </Link>
            )}
          </div>

          {/* Business Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">Average Rating</span>
              <div className="flex items-center space-x-1.5 text-xl font-black text-[#C9A24A]">
                <Star className="w-4 h-4 fill-[#C9A24A]" />
                <span>{Number(storeData.averageRating || 0).toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">Total Reviews</span>
              <div className="text-xl font-black text-[#173D32]">
                {storeData.totalRatings || 0} reviews
              </div>
            </div>

            <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">Business Contact Email</span>
              <p className="text-xs font-bold text-[#171A18] truncate" title={storeData.email}>{storeData.email}</p>
            </div>

            <div className="p-4 bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">Listing Created</span>
              <p className="text-xs font-bold text-[#171A18]">{formatDate(storeData.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerStoreDetailsPage;
