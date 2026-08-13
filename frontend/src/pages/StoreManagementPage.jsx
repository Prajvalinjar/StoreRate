import React, { useState, useEffect } from 'react';
import { getStores, createStore, getUsers } from '../api/adminService';
import { Store, Plus, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, Star, AlertCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalValidationErrors, setModalValidationErrors] = useState([]);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      const response = await getStores(params);
      if (response.status === 'success') {
        setStores(response.data.stores);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [pagination.page, sort, filters]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const fetchStoreOwners = async () => {
    setLoadingOwners(true);
    try {
      const response = await getUsers({ role: 'STORE_OWNER', limit: 100 });
      if (response.status === 'success') {
        setStoreOwners(response.data.users);
        if (response.data.users.length > 0) {
          setModalFormData((prev) => ({ ...prev, ownerId: response.data.users[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch store owners:', err);
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setModalError('');
    setModalValidationErrors([]);
    fetchStoreOwners();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalFormData((prev) => ({ ...prev, [name]: value }));
    setModalError('');
    setModalValidationErrors([]);
  };

  const handleCreateStoreSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalValidationErrors([]);

    try {
      const response = await createStore(modalFormData);
      if (response.status === 'success') {
        setIsModalOpen(false);
        setModalFormData({ name: '', email: '', address: '', ownerId: '' });
        fetchStores();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setModalValidationErrors(err.response.data.errors);
      } else {
        setModalError(err.response?.data?.message || 'Failed to create store');
      }
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left text-[#171A18]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E5DF] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block">
            ADMINISTRATION
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">Store Operations</h1>
          <p className="text-xs text-[#707873]">Manage store listings, search locations, and link store owners</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-bold rounded-xl text-xs transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs">
        <input
          type="text"
          name="name"
          placeholder="Filter by Store Name..."
          value={filters.name}
          onChange={handleFilterChange}
          className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3.5 py-2.5 text-xs text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
        />
        <input
          type="text"
          name="email"
          placeholder="Filter by Store Email..."
          value={filters.email}
          onChange={handleFilterChange}
          className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3.5 py-2.5 text-xs text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
        />
        <input
          type="text"
          name="address"
          placeholder="Filter by Address..."
          value={filters.address}
          onChange={handleFilterChange}
          className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3.5 py-2.5 text-xs text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
        />
      </div>

      {/* Operations Table */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F6F1] border-b border-[#E2E5DF] text-[#707873] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th onClick={() => handleSort('name')} className="py-4 px-6 cursor-pointer hover:text-[#171A18] transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Store Name</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9CA59E]" />
                  </div>
                </th>
                <th onClick={() => handleSort('email')} className="py-4 px-6 cursor-pointer hover:text-[#171A18] transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9CA59E]" />
                  </div>
                </th>
                <th onClick={() => handleSort('address')} className="py-4 px-6 cursor-pointer hover:text-[#171A18] transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Address</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9CA59E]" />
                  </div>
                </th>
                <th className="py-4 px-6">Owner</th>
                <th onClick={() => handleSort('rating')} className="py-4 px-6 cursor-pointer hover:text-[#171A18] transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Average Rating</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9CA59E]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DF] text-[#171A18]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#707873]">
                    Loading store listings...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#707873]">
                    No matching store records found.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F6F1] transition-colors">
                    <td className="py-4 px-6 font-display font-bold text-[#171A18] text-sm">{s.name}</td>
                    <td className="py-4 px-6 font-mono text-[#707873]">{s.email}</td>
                    <td className="py-4 px-6 text-[#707873] max-w-[200px] truncate">{s.address}</td>
                    <td className="py-4 px-6">
                      {s.owner ? (
                        <div>
                          <p className="font-bold text-[#171A18]">{s.owner.name}</p>
                          <p className="text-[10px] text-[#707873] font-mono">{s.owner.email}</p>
                        </div>
                      ) : (
                        <span className="text-[#707873] italic">No owner assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center space-x-1.5 bg-[#F5E6C8]/60 border border-[#E8D4A8] px-2.5 py-1 rounded-lg text-[#9A7525] font-extrabold">
                        <Star className="w-3.5 h-3.5 fill-[#C9A24A] text-[#C9A24A]" />
                        <span>{s.averageRating}</span>
                        <span className="text-[10px] text-[#707873] font-normal">({s.totalRatings})</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-[#F7F6F1] border-t border-[#E2E5DF] flex items-center justify-between text-xs text-[#707873]">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="p-1.5 rounded-lg border border-[#E2E5DF] bg-white hover:bg-[#E7F0EB] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-[#171A18]" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="p-1.5 rounded-lg border border-[#E2E5DF] bg-white hover:bg-[#E7F0EB] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-[#171A18]" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Store Modal */}
      {isModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 relative text-left">
            <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
              <h2 className="font-display text-xl font-bold text-[#171A18]">Add New Store</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#707873] hover:text-[#171A18] p-1 rounded-lg hover:bg-[#F7F6F1]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[#9B2C2C] text-xs">
                {modalError}
              </div>
            )}

            {modalValidationErrors.length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-[#9B2C2C] text-xs">
                {modalValidationErrors.map((e, idx) => (
                  <p key={idx}>• {e.field ? `${e.field}: ` : ''}{e.message}</p>
                ))}
              </div>
            )}

            {storeOwners.length === 0 && !loadingOwners ? (
              <div className="p-4 bg-[#F5E6C8]/60 border border-[#E8D4A8] rounded-xl space-y-3 text-[#9A7525] text-xs">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#C9A24A] mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-[#171A18]">No Store Owners Available</p>
                    <p className="mt-1 text-[#707873]">
                      Stores require an assigned <span className="font-bold text-[#173D32]">STORE_OWNER</span>. There are currently no accounts with the STORE_OWNER role.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/users"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#173D32] text-white font-bold rounded-xl text-xs hover:bg-[#2F6654] transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Go to User Operations & Create STORE_OWNER</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateStoreSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">Store Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={modalFormData.name}
                    onChange={handleModalChange}
                    placeholder="e.g. Apex Electronics & Gadgets"
                    className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                  />
                </div>

                <div>
                  <label className="block text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">Store Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={modalFormData.email}
                    onChange={handleModalChange}
                    placeholder="contact@apexstore.com"
                    className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                  />
                </div>

                <div>
                  <label className="block text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">Store Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={modalFormData.address}
                    onChange={handleModalChange}
                    placeholder="456 Commerce Boulevard, Suite 200"
                    className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                  />
                </div>

                <div>
                  <label className="block text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">Assign Store Owner (STORE_OWNER role)</label>
                  <select
                    name="ownerId"
                    required
                    value={modalFormData.ownerId}
                    onChange={handleModalChange}
                    className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
                  >
                    {storeOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#E2E5DF]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-white border border-[#E2E5DF] text-[#707873] font-bold rounded-xl hover:bg-[#F7F6F1] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-extrabold rounded-xl disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {modalLoading ? 'Creating Store...' : 'Create Store'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagementPage;
