"use client";

import { useState } from 'react';
import {
  useGetAllPartnershipsQuery,
  useGetAllMeetingsQuery,
} from '../../../../store/features/partnershipApi';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Grid3X3,
  List,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Handshake,
  CalendarClock,
} from 'lucide-react';

const AdminPartnershipsPage = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: partnerships = [],
    isLoading: partnershipsLoading,
    isError: partnershipsError,
    error: partnershipsErrorData,
    refetch: refetchPartnerships,
  } = useGetAllPartnershipsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: meetings = [],
    isLoading: meetingsLoading,
    isError: meetingsError,
    error: meetingsErrorData,
    refetch: refetchMeetings,
  } = useGetAllMeetingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const isLoading = partnershipsLoading || meetingsLoading;
  const isError = partnershipsError || meetingsError;
  const error = partnershipsErrorData || meetingsErrorData;

  // Combine and enrich data with type
  const allRequests = [
    ...partnerships.map(p => ({ ...p, type: 'inquiry' })),
    ...meetings.map(m => ({ 
      ...m, 
      type: 'meeting',
      // Add display fields for consistency
      message: m.message || '(No additional message)',
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const getTypeBadge = (type) => {
    if (type === 'meeting') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CalendarClock className="w-3 h-3" />
          Meeting Request
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Handshake className="w-3 h-3" />
        Partnership Inquiry
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Requests</h2>
          <p className="text-gray-600 mb-4">{error?.data?.error || 'Something went wrong'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                refetchPartnerships();
                refetchMeetings();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🤝</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Requests Yet</h2>
          <p className="text-xl text-gray-600">Partnership inquiries and meeting requests will appear here once received.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Partnership & Meeting Requests</h1>
                <p className="text-xl text-gray-600">Manage all partnership inquiries and meeting requests</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-white rounded-lg shadow-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    refetchPartnerships();
                    refetchMeetings();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              Total Requests: <span className="font-semibold text-gray-900">{allRequests.length}</span>
              {' • '}
              <span className="text-purple-700 font-medium">{partnerships.length} Inquiries</span>
              {' • '}
              <span className="text-blue-700 font-medium">{meetings.length} Meetings</span>
            </div>
          </motion.div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {allRequests.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => openModal(item)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-2">
                          {getTypeBadge(item.type)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                      {item.company && (
                        <p className="text-gray-600 flex items-center gap-2 mb-3">
                          <Building2 className="w-4 h-4" />
                          {item.company}
                        </p>
                      )}
                      <p className="text-gray-600 flex items-center gap-2 mb-4">
                        <Mail className="w-4 h-4" />
                        {item.email}
                      </p>
                      {item.type === 'meeting' && item.preferredDate && (
                        <p className="text-sm text-indigo-700 font-medium flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4" />
                          Preferred: {format(new Date(item.preferredDate), 'dd MMM yyyy')} at {item.preferredTime}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(item.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 text-center text-indigo-700 font-medium">
                      Click to view full details
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* List View (Table) */}
          {viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                    <tr>
                      <th className="px-8 py-5 text-left text-sm font-medium">Type</th>
                      <th className="px-8 py-5 text-left text-sm font-medium">Applicant</th>
                      <th className="px-8 py-5 text-left text-sm font-medium">Company</th>
                      <th className="px-8 py-5 text-left text-sm font-medium">Email</th>
                      <th className="px-8 py-5 text-left text-sm font-medium">Details</th>
                      <th className="px-8 py-5 text-left text-sm font-medium">Date</th>
                      <th className="px-8 py-5 text-center text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {allRequests.map((item, index) => (
                        <motion.tr
                          key={item._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => openModal(item)}
                        >
                          <td className="px-8 py-6">{getTypeBadge(item.type)}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{item.name}</div>
                                {item.phone && (
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {item.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-gray-900">
                            {item.company || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-8 py-6 text-gray-900">{item.email}</td>
                          <td className="px-8 py-6">
                            {item.type === 'meeting' && item.preferredDate ? (
                              <span className="text-sm text-indigo-700 font-medium">
                                {format(new Date(item.preferredDate), 'dd MMM yyyy')} @ {item.preferredTime}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">General inquiry</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-gray-600">
                            {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                              View Details →
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-auto my-8 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
                      {selectedItem.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{selectedItem.name}</h2>
                      <p className="text-indigo-100 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Submitted on {format(new Date(selectedItem.createdAt), 'dd MMMM yyyy, HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div>{getTypeBadge(selectedItem.type)}</div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {selectedItem.email}
                        </p>
                      </div>
                      {selectedItem.phone && (
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {selectedItem.phone}
                          </p>
                        </div>
                      )}
                      {selectedItem.company && (
                        <div>
                          <p className="text-sm text-gray-500">Company / Organization</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {selectedItem.company}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedItem.type === 'meeting' && selectedItem.preferredDate && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-indigo-600" />
                        Preferred Meeting Schedule
                      </h3>
                      <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="text-xl font-semibold text-blue-900">
                            {format(new Date(selectedItem.preferredDate), 'EEEE, MMMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="text-xl font-semibold text-blue-900">{selectedItem.preferredTime}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedItem.message && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      Message
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedItem.message}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-medium transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminPartnershipsPage;