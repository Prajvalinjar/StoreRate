import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationService';
import { 
  Bell, CheckCircle2, XCircle, Star, MessageSquare, CornerDownRight, 
  Flag, EyeOff, Eye, Store, CheckCheck, RefreshCw, Sparkles, Filter, Calendar
} from 'lucide-react';

const NotificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications();
      if (response.status === 'success') {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleItemClick = async (item) => {
    try {
      if (!item.isRead) {
        await markNotificationAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'OWNER_REPLY':
        return <CornerDownRight className="w-5 h-5 text-[#C9A24A]" />;
      case 'NEW_RATING':
      case 'NEW_REVIEW':
        return <Star className="w-5 h-5 text-emerald-600" />;
      case 'STORE_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'STORE_REJECTED':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'NEW_STORE_SUBMISSION':
        return <Store className="w-5 h-5 text-amber-600" />;
      case 'REVIEW_REPORTED':
        return <Flag className="w-5 h-5 text-rose-600" />;
      case 'REVIEW_HIDDEN':
        return <EyeOff className="w-5 h-5 text-purple-600" />;
      case 'REVIEW_RESTORED':
        return <Eye className="w-5 h-5 text-blue-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#173D32]" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F6F1] flex flex-col items-center justify-center p-6 text-[#707873] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
        <p className="text-xs font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-[#171A18] text-left">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5DF] pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
              NOTIFICATION CENTER
            </span>
            <h1 className="font-display text-3xl font-bold text-[#171A18] tracking-tight">Account Activity & Updates</h1>
            <p className="text-xs sm:text-sm text-[#707873]">
              Stay updated with activity related to your StoreRate account ({user?.role}).
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="px-4 py-2.5 bg-[#173D32] hover:bg-[#2F6654] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#C9A24A]" />
              <span>{markingAll ? 'Marking...' : 'Mark All as Read'}</span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 text-xs font-bold pt-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#173D32] text-white shadow-xs'
                : 'text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1]'
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#173D32] text-white shadow-xs'
                : 'text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white border border-[#E2E5DF] rounded-2xl shadow-xs overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-[#9CA59E] mx-auto opacity-50" />
            <h3 className="font-bold text-base text-[#171A18]">No notifications found</h3>
            <p className="text-xs text-[#707873] max-w-sm mx-auto">
              {filter === 'unread'
                ? 'You have read all your notifications!'
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E5DF]">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-5 transition-colors cursor-pointer flex items-start space-x-4 text-left ${
                  item.isRead
                    ? 'bg-white hover:bg-[#F7F6F1]'
                    : 'bg-[#E7F0EB]/60 hover:bg-[#E7F0EB]'
                }`}
              >
                <div className="p-3 bg-white border border-[#E2E5DF] rounded-xl shrink-0 mt-0.5 shadow-xs">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className={`text-sm ${item.isRead ? 'font-bold text-[#171A18]' : 'font-extrabold text-[#173D32]'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-[#707873] font-mono flex items-center space-x-1 shrink-0">
                      <Calendar className="w-3 h-3 text-[#9CA59E]" />
                      <span>{formatDate(item.createdAt)}</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#707873] leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {!item.isRead && (
                  <span className="w-2.5 h-2.5 bg-[#C9A24A] rounded-full shrink-0 mt-2" title="Unread" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
