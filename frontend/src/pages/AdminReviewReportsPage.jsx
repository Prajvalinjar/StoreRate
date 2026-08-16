import React, { useState, useEffect } from 'react';
import { getReviewReports, dismissReviewReport, hideReportedReview, restoreReportedReview } from '../api/adminService';
import StarRating from '../components/StarRating';
import { 
  ShieldAlert, CheckCircle2, EyeOff, Eye, RefreshCw, AlertCircle, Calendar, Flag, User, Store, ArrowRight
} from 'lucide-react';

const AdminReviewReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReviewReports();
      if (response.status === 'success') {
        setReports(response.data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch review reports:', err);
      setError(err.response?.data?.message || 'Failed to load review reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDismiss = async (reportId) => {
    setActionId(reportId);
    try {
      await dismissReviewReport(reportId);
      await fetchReports();
    } catch (err) {
      console.error('Failed to dismiss report:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleHide = async (reportId) => {
    setActionId(reportId);
    try {
      await hideReportedReview(reportId);
      await fetchReports();
    } catch (err) {
      console.error('Failed to hide review:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (reportId) => {
    setActionId(reportId);
    try {
      await restoreReportedReview(reportId);
      await fetchReports();
    } catch (err) {
      console.error('Failed to restore review:', err);
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getReasonBadge = (reason) => {
    switch (reason) {
      case 'SPAM': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'OFFENSIVE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HARASSMENT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MISLEADING': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-[#707873] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#173D32]" />
        <p className="text-xs font-medium">Loading review moderation queue...</p>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === 'PENDING');
  const resolvedReports = reports.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-[#171A18] text-left">
      {/* Header Banner */}
      <div className="border-b border-[#E2E5DF] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-extrabold text-[#173D32] uppercase tracking-widest bg-[#E7F0EB] px-3.5 py-1.5 rounded-full inline-block border border-[#CDE0D5]">
            ADMINISTRATOR MODERATION
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#171A18] tracking-tight">
          Review Moderation & Flagged Reports
        </h1>
        <p className="text-xs sm:text-sm text-[#707873] max-w-2xl font-normal">
          Inspect customer review reports, dismiss invalid flags, or hide inappropriate review text from public store profiles.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#9B2C2C] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Total Reports</span>
          <div className="text-3xl font-black text-[#171A18]">{reports.length}</div>
        </div>
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Pending Action</span>
          <div className="text-3xl font-black text-rose-600">{pendingReports.length}</div>
        </div>
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider block">Resolved Reports</span>
          <div className="text-3xl font-black text-emerald-700">{resolvedReports.length}</div>
        </div>
      </div>

      {/* Reports Queue */}
      {reports.length === 0 ? (
        <div className="bg-white border border-[#E2E5DF] rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#171A18]">No Review Reports</h3>
            <p className="text-xs text-[#707873]">No customer reviews are currently flagged for administrator moderation.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E5DF] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E2E5DF] flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#171A18] flex items-center space-x-2">
                <Flag className="w-5 h-5 text-rose-600" />
                <span>Review Moderation Reports ({reports.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-[#E2E5DF]">
              {reports.map((report) => {
                const rating = report.rating;
                const isHidden = rating?.reviewStatus === 'HIDDEN';

                return (
                  <div key={report.id} className="p-6 space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E5DF]/60 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getReasonBadge(report.reason)}`}>
                            {report.reason}
                          </span>
                          <span className="text-[10px] font-bold text-[#707873] uppercase tracking-wider">
                            Status: <strong className={report.status === 'PENDING' ? 'text-rose-600' : 'text-emerald-700'}>{report.status}</strong>
                          </span>
                          {isHidden && (
                            <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              REVIEW HIDDEN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#707873] flex items-center space-x-1 pt-0.5">
                          <Store className="w-3.5 h-3.5 text-[#173D32]" />
                          <span className="font-bold text-[#171A18]">{rating?.store?.name}</span>
                          <span>•</span>
                          <span>Reported on {formatDate(report.createdAt)}</span>
                        </p>
                      </div>

                      <div className="text-xs text-[#707873]">
                        Reported by: <strong className="text-[#171A18]">{report.reporter?.name}</strong> ({report.reporter?.email})
                      </div>
                    </div>

                    {/* Reported Review Content */}
                    <div className="bg-[#F7F6F1] border border-[#E2E5DF] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <StarRating value={rating?.rating || 5} readOnly size="xs" />
                          <span className="text-xs font-bold text-[#C9A24A]">{rating?.rating}.0 ★</span>
                          <span className="text-xs text-[#707873]">by <strong>{rating?.user?.name}</strong></span>
                        </div>
                      </div>

                      {rating?.review ? (
                        <p className="text-xs text-[#171A18] font-normal leading-relaxed bg-white p-3 rounded-lg border border-[#E2E5DF] whitespace-pre-wrap">
                          "{rating.review}"
                        </p>
                      ) : (
                        <p className="text-xs text-[#9CA59E] italic">No written text in review.</p>
                      )}

                      {report.description && (
                        <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                          Reporter Note: "{report.description}"
                        </p>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      {report.status === 'PENDING' && (
                        <button
                          type="button"
                          disabled={actionId === report.id}
                          onClick={() => handleDismiss(report.id)}
                          className="px-4 py-2 bg-white hover:bg-[#F7F6F1] text-[#707873] border border-[#E2E5DF] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Dismiss Report
                        </button>
                      )}

                      {isHidden ? (
                        <button
                          type="button"
                          disabled={actionId === report.id}
                          onClick={() => handleRestore(report.id)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Restore Review</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionId === report.id}
                          onClick={() => handleHide(report.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Written Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewReportsPage;
