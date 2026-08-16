import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationService';
import { 
  Bell, CheckCircle2, XCircle, Star, MessageSquare, CornerDownRight, 
  Flag, EyeOff, Eye, Store, CheckCheck, RefreshCw, ChevronRight, Sparkles 
} from 'lucide-react';

const NotificationPopover = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const popoverRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await getNotifications();
      if (response.status === 'success') {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll every 30 seconds for live notification updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    if (!open) {
      fetchNotifications();
    }
    setOpen((prev) => !prev);
  };

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
    setOpen(false);
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
      console.error('Failed to mark all notifications read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'OWNER_REPLY':
        return <CornerDownRight className="w-4 h-4 text-[#C9A24A]" />;
      case 'NEW_RATING':
      case 'NEW_REVIEW':
        return <Star className="w-4 h-4 text-emerald-600" />;
      case 'STORE_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'STORE_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'NEW_STORE_SUBMISSION':
        return <Store className="w-4 h-4 text-amber-600" />;
      case 'REVIEW_REPORTED':
        return <Flag className="w-4 h-4 text-rose-600" />;
      case 'REVIEW_HIDDEN':
        return <EyeOff className="w-4 h-4 text-purple-600" />;
      case 'REVIEW_RESTORED':
        return <Eye className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#173D32]" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-[#707873] hover:text-[#171A18] hover:bg-[#F7F6F1] rounded-xl transition-colors cursor-pointer border border-[#E2E5DF]"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full shadow-xs border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E5DF] rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-[#F7F6F1] border-b border-[#E2E5DF] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-display text-sm font-bold text-[#171A18]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold text-[#173D32] bg-[#E7F0EB] px-2 py-0.5 rounded-full border border-[#CDE0D5]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[11px] font-bold text-[#173D32] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3 text-[#C9A24A]" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E5DF]/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-6 h-6 text-[#9CA59E] mx-auto opacity-50" />
                <p className="text-xs font-bold text-[#171A18]">No notifications</p>
                <p className="text-[11px] text-[#707873]">You're all caught up with your StoreRate activity.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start space-x-3 text-left ${
                    item.isRead
                      ? 'bg-white hover:bg-[#F7F6F1]'
                      : 'bg-[#E7F0EB]/60 hover:bg-[#E7F0EB]'
                  }`}
                >
                  <div className="p-2 bg-white border border-[#E2E5DF] rounded-xl shrink-0 mt-0.5 shadow-xs">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${item.isRead ? 'font-bold text-[#171A18]' : 'font-extrabold text-[#173D32]'}`}>
                        {item.title}
                      </p>
                      <span className="text-[9px] text-[#707873] font-mono shrink-0 ml-2">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#707873] leading-snug line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  {!item.isRead && (
                    <span className="w-2 h-2 bg-[#C9A24A] rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="p-3 bg-[#F7F6F1] border-t border-[#E2E5DF] text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#173D32] hover:underline"
            >
              <span>View all notifications</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C9A24A]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
