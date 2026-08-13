import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, createUser } from '../api/adminService';
import { Users, UserPlus, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, AlertCircle, CheckCircle2, Eye } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalValidationErrors, setModalValidationErrors] = useState([]);

  const fetchUsers = async () => {
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
      if (filters.role) params.role = filters.role;

      const response = await getUsers(params);
      if (response.status === 'success') {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalValidationErrors([]);

    try {
      const response = await createUser(modalFormData);
      if (response.status === 'success') {
        setIsModalOpen(false);
        setModalFormData({ name: '', email: '', address: '', password: '', role: 'USER' });
        fetchUsers();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setModalValidationErrors(err.response.data.errors);
      } else {
        setModalError(err.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setModalLoading(false);
    }
  };

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
    <div className="space-y-6 max-w-6xl mx-auto text-left text-[#171A18]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E5DF] pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block">
            ADMINISTRATION
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">User Operations</h1>
          <p className="text-xs text-[#707873]">Manage system accounts, filter directories, and create users</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white font-bold rounded-xl text-xs transition-colors shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-xs">
        <input
          type="text"
          name="name"
          placeholder="Filter by Name..."
          value={filters.name}
          onChange={handleFilterChange}
          className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3.5 py-2.5 text-xs text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
        />
        <input
          type="text"
          name="email"
          placeholder="Filter by Email..."
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
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl px-3.5 py-2.5 text-xs text-[#171A18] focus:outline-none focus:border-[#173D32]"
        >
          <option value="">All System Roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
        </select>
      </div>

      {/* Operations Table */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F6F1] border-b border-[#E2E5DF] text-[#707873] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th onClick={() => handleSort('name')} className="py-4 px-6 cursor-pointer hover:text-[#171A18] transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
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
                <th onClick={() => handleSort('role')} className="py-4 px-6 cursor-pointer hover:text-[#171A18] transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Role</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9CA59E]" />
                  </div>
                </th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DF] text-[#171A18]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#707873]">
                    Loading account records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#707873]">
                    No matching user records found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7F6F1] transition-colors">
                    <td className="py-4 px-6 font-bold text-[#171A18]">{u.name}</td>
                    <td className="py-4 px-6 font-mono text-[#707873]">{u.email}</td>
                    <td className="py-4 px-6 text-[#707873] max-w-[200px] truncate">{u.address}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="inline-flex items-center space-x-1 text-xs text-[#173D32] hover:underline font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
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

      {/* Create User Modal */}
      {isModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E2E5DF] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 relative text-left">
            <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
              <h2 className="font-display text-xl font-bold text-[#171A18]">Create Platform User</h2>
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

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">
                  <label>Full Name</label>
                  <span className="font-mono text-[#707873]">{modalFormData.name.length} / 20–60 chars</span>
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={modalFormData.name}
                  onChange={handleModalChange}
                  placeholder="e.g. Jonathan Alexander Smith"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                />
              </div>

              <div>
                <label className="block text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={modalFormData.email}
                  onChange={handleModalChange}
                  placeholder="user@example.com"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">
                  <label>Address</label>
                  <span className="font-mono text-[#707873]">{modalFormData.address.length} / max 400 chars</span>
                </div>
                <input
                  type="text"
                  name="address"
                  required
                  value={modalFormData.address}
                  onChange={handleModalChange}
                  placeholder="123 Main Street, Cityville"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                />
              </div>

              <div>
                <label className="block text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">Role</label>
                <select
                  name="role"
                  value={modalFormData.role}
                  onChange={handleModalChange}
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] focus:outline-none focus:border-[#173D32]"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STORE_OWNER">STORE_OWNER</option>
                </select>
              </div>

              <div>
                <label className="block text-[#707873] font-bold mb-1 uppercase tracking-wider text-[10px]">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={modalFormData.password}
                  onChange={handleModalChange}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl py-2.5 px-3.5 text-[#171A18] placeholder-[#9CA59E] focus:outline-none focus:border-[#173D32]"
                />
                <p className="text-[10px] text-[#707873] mt-1">8–16 chars, 1 uppercase, 1 special char</p>
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
                  {modalLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
