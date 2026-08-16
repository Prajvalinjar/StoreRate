import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerDashboard } from '../api/ownerService';
import axiosInstance from '../api/axiosInstance';
import SafeImage from '../components/SafeImage';
import StarRating from '../components/StarRating';
import { 
  Store, MapPin, Mail, Calendar, CheckCircle2, Clock, XCircle, 
  ExternalLink, Star, Award, TrendingUp, RefreshCw, AlertCircle, Edit3, Save, Phone, Globe
} from 'lucide-react';
import { STORE_CATEGORIES } from '../constants/categories';

const OwnerStoreDetailsPage = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit Form State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kolhapur');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const fetchStoreDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOwnerDashboard();
      if (response.status === 'success') {
        const store = response.data.store;
        setStoreData(store);
        if (store) {
          setName(store.name || '');
          setCategory(store.category || 'General');
          setDescription(store.description || '');
          setAddress(store.address || '');
          setCity(store.city || 'Kolhapur');
          setPhone(store.phone || '');
          setImageUrl(store.imageUrl || '');
        }
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

  const handleSaveStore = async (e) => {
    e.preventDefault();
    if (!storeData) return;

    if (!name.trim() || !address.trim()) {
      setSaveError('Store name and address are required.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const response = await axiosInstance.put(`/owner/stores/${storeData.id}`, {
        name: name.trim(),
        category,
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        imageUrl: imageUrl.trim(),
      });

      if (response.data.status === 'success') {
        setSaveSuccess('Store listing details updated successfully!');
        setIsEditing(false);
        await fetchStoreDetails();
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update store details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
                STORE MANAGEMENT PORTAL
              </span>
              <h1 className="font-display text-3xl font-bold text-[#171A18]">{storeData.name}</h1>
              <p className="text-xs text-[#707873] flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9CA59E] shrink-0" />
                <span>{storeData.address}, {storeData.city || 'Kolhapur'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-white hover:bg-[#F7F6F1] text-[#173D32] border border-[#E2E5DF] text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C9A24A]" />
                  <span>Edit Store Profile</span>
                </button>
              )}

              {storeData.status === 'APPROVED' && (
                <Link
                  to={`/stores/${storeData.id}`}
                  className="px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <span>View Public Store</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C9A24A]" />
                </Link>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-[#9B2C2C] text-xs font-semibold rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Edit Form / View Grid */}
          {isEditing ? (
            <form onSubmit={handleSaveStore} className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-display text-base font-bold text-[#171A18] border-b border-[#E2E5DF] pb-3">
                Edit Store Listing Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Store Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#E2E5DF] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-[#E2E5DF] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                  >
                    {STORE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Business Description / About</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your products, specialty dishes, services, opening hours..."
                  className="w-full bg-white border border-[#E2E5DF] rounded-xl p-3 text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-[#E2E5DF] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kolhapur"
                    className="w-full bg-white border border-[#E2E5DF] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Contact Phone (Optional)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-[#E2E5DF] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider">Store Banner Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-[#E2E5DF] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#173D32]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2E5DF]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-white text-[#707873] border border-[#E2E5DF] rounded-xl text-xs font-semibold hover:bg-[#F7F6F1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#C9A24A]" />
                  <span>{saving ? 'Saving Changes...' : 'Save Store Details'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Business Details Grid */
            <div className="space-y-6">
              {storeData.description && (
                <div className="p-5 bg-[#F7F6F1] border border-[#E2E5DF] rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">About Business</span>
                  <p className="text-xs text-[#171A18] font-normal leading-relaxed">{storeData.description}</p>
                </div>
              )}

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
                  <span className="text-[10px] font-extrabold text-[#707873] uppercase tracking-wider block">Location / City</span>
                  <p className="text-xs font-bold text-[#171A18]">{storeData.city || 'Kolhapur'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerStoreDetailsPage;
