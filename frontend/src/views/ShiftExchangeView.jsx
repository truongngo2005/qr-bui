import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, Calendar, UserCheck, CheckCircle2, 
  XCircle, Clock, AlertCircle, Plus, Send, ShieldCheck, X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ShiftExchangeView() {
  const { user, isManager } = useAuth();

  const [requests, setRequests] = useState([]);
  const [myShifts, setMyShifts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal tạo yêu cầu
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [requestType, setRequestType] = useState('EXCHANGE'); // EXCHANGE hoặc LEAVE
  const [senderAssignmentId, setSenderAssignmentId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Note phê duyệt của quản lý
  const [managerNoteInput, setManagerNoteInput] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, shiftsRes, usersRes] = await Promise.all([
        isManager ? api.getAllExchangeRequests() : api.getMyExchangeRequests(),
        api.getMyShifts(),
        api.getUsers(),
      ]);

      if (reqRes.success) setRequests(reqRes.data);
      if (shiftsRes.success) {
        setMyShifts(shiftsRes.data.filter(s => s.status === 'ASSIGNED'));
        if (shiftsRes.data.length > 0) setSenderAssignmentId(shiftsRes.data[0].id);
      }
      if (usersRes.success) {
        setAllUsers(usersRes.data.filter(u => u.id !== user?.id && u.isActive));
        if (usersRes.data.length > 0) setReceiverId(usersRes.data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isManager]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!senderAssignmentId) {
      setError('Bạn chưa chọn ca làm việc của mình cần đổi hoặc xin nghỉ!');
      return;
    }
    if (requestType === 'EXCHANGE' && !receiverId) {
      setError('Vui lòng chọn đồng nghiệp bạn muốn đổi ca cùng!');
      return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do đổi ca hoặc xin nghỉ!');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.createExchangeRequest({
        senderAssignmentId: Number(senderAssignmentId),
        receiverId: requestType === 'EXCHANGE' ? Number(receiverId) : null,
        receiverAssignmentId: null,
        requestType,
        reason: reason.trim(),
      });
      if (res.success) {
        setSuccess('Đã gửi yêu cầu thành công!');
        setShowCreateModal(false);
        setReason('');
        fetchData();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Đồng nghiệp phản hồi Đồng ý / Từ chối
  const handlePeerAction = async (requestId, action) => {
    try {
      const res = await api.peerAction(requestId, action);
      if (res.success) {
        setSuccess(action === 'ACCEPT' ? 'Bạn đã đồng ý đổi ca! Yêu cầu chuyển đến Quản lý phê duyệt.' : 'Bạn đã từ chối yêu cầu đổi ca.');
        fetchData();
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // Quản lý phê duyệt cuối cùng
  const handleManagerApproval = async (requestId, action) => {
    const note = managerNoteInput[requestId] || '';
    try {
      const res = await api.managerApproval(requestId, action, note);
      if (res.success) {
        setSuccess(action === 'APPROVE' ? 'Đã phê duyệt! Lịch làm việc trong hệ thống đã được tự động cập nhật.' : 'Đã từ chối yêu cầu.');
        fetchData();
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <ArrowLeftRight className="w-4 h-4 text-amber-600" />
            <span>Quy Trình Trực Tuyến</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-coffee-950 mt-0.5">
            Đổi Ca & Xin Nghỉ Phép Đột Xuất
          </h2>
          <p className="text-xs text-coffee-600 mt-0.5">
            Gửi yêu cầu đổi ca với đồng nghiệp, xác nhận 2 chiều và quản lý duyệt tự động cập nhật lịch
          </p>
        </div>

        <button
          onClick={() => { setShowCreateModal(true); setError(''); }}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-coffee-800 text-white font-bold text-xs sm:text-sm shadow-md hover:from-amber-700 hover:to-coffee-900 flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Yêu Cầu Mới</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-coffee-950 flex items-center gap-2">
          <span>Danh Sách Yêu Cầu ({requests.length})</span>
          {isManager && (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Chế độ Quản lý phê duyệt
            </span>
          )}
        </h3>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-coffee-200 text-center text-sm text-coffee-500">
            Hiện không có yêu cầu đổi ca hoặc xin nghỉ nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => {
              const isSender = req.sender?.id === user?.id;
              const isReceiver = req.receiver?.id === user?.id;
              const isPendingPeer = req.status === 'PENDING' && req.requestType === 'EXCHANGE';
              const isPendingManager = req.status === 'ACCEPTED' || req.status === 'PENDING_MANAGER';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl p-5 border border-coffee-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header: Request Type & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        req.requestType === 'EXCHANGE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        {req.requestType === 'EXCHANGE' ? 'Đổi ca với đồng nghiệp' : 'Xin nghỉ phép đột xuất'}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : req.status === 'ACCEPTED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status === 'APPROVED' ? '✓ Đã Phê Duyệt'
                          : req.status === 'REJECTED' ? '✕ Đã Từ Chối'
                          : req.status === 'ACCEPTED' ? 'Đồng nghiệp đã đồng ý (Chờ QL duyệt)'
                          : req.status === 'PENDING_MANAGER' ? 'Chờ Quản lý duyệt'
                          : 'Chờ đồng nghiệp đồng ý'}
                      </span>
                    </div>

                    {/* Sender and Target Shift info */}
                    <div className="p-3.5 rounded-2xl bg-coffee-50 border border-coffee-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-coffee-600">Người gửi yêu cầu:</span>
                        <strong className="text-coffee-950 font-bold">{req.sender?.fullName} ({req.sender?.position})</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-coffee-600">Ca làm việc của người gửi:</span>
                        <strong className="text-amber-900 font-mono">
                          {req.senderAssignment?.shiftTemplate?.name} (Ngày {req.senderAssignment?.workDate})
                        </strong>
                      </div>

                      {req.requestType === 'EXCHANGE' && (
                        <div className="flex items-center justify-between pt-1 border-t border-coffee-200">
                          <span className="text-coffee-600">Đồng nghiệp được yêu cầu:</span>
                          <strong className="text-coffee-950 font-bold">{req.receiver?.fullName || '—'}</strong>
                        </div>
                      )}

                      <div className="pt-1.5 border-t border-coffee-200">
                        <span className="text-coffee-500 block text-[11px]">Lý do:</span>
                        <p className="text-coffee-800 font-medium italic mt-0.5">"{req.reason}"</p>
                      </div>

                      {req.managerNote && (
                        <div className="pt-1 text-emerald-800 text-[11px] font-semibold">
                          Ghi chú quản lý: {req.managerNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div>
                    {/* Peer Response Buttons (cho đồng nghiệp được yêu cầu) */}
                    {isPendingPeer && isReceiver && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                        <span className="text-xs font-bold text-amber-950 block">
                          Bạn có đồng ý nhận đổi ca này không?
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handlePeerAction(req.id, 'REJECT')}
                            className="py-2 px-3 rounded-xl border border-coffee-300 font-bold text-xs text-coffee-700 hover:bg-white transition"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handlePeerAction(req.id, 'ACCEPT')}
                            className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
                          >
                            Đồng ý đổi ca
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Manager Approval Buttons */}
                    {isManager && (isPendingManager || req.status === 'PENDING') && (
                      <div className="p-3 rounded-2xl bg-coffee-100/60 border border-coffee-300 space-y-2">
                        <span className="text-xs font-bold text-coffee-950 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-coffee-800" />
                          Quản lý xem xét & Phê duyệt:
                        </span>

                        <input
                          type="text"
                          placeholder="Ghi chú phản hồi (tùy chọn)..."
                          value={managerNoteInput[req.id] || ''}
                          onChange={(e) => setManagerNoteInput({ ...managerNoteInput, [req.id]: e.target.value })}
                          className="w-full py-1.5 px-3 rounded-xl border border-coffee-300 bg-white text-xs font-medium focus:outline-none"
                        />

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleManagerApproval(req.id, 'REJECT')}
                            className="py-2 px-3 rounded-xl bg-red-100 text-red-800 hover:bg-red-200 font-bold text-xs transition"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleManagerApproval(req.id, 'APPROVE')}
                            className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
                          >
                            Phê duyệt & Đổi ca ngay
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tạo Yêu Cầu Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-coffee-200 animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-coffee-100">
              <h3 className="text-lg font-bold text-coffee-950 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-amber-600" />
                Tạo Đơn Đổi Ca / Xin Nghỉ
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-coffee-500 hover:bg-coffee-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              
              {/* Request Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase mb-2">
                  Loại Yêu Cầu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType('EXCHANGE')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition ${
                      requestType === 'EXCHANGE'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm'
                        : 'bg-coffee-50 border-coffee-200 text-coffee-700'
                    }`}
                  >
                    Đổi ca với đồng nghiệp
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('LEAVE')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition ${
                      requestType === 'LEAVE'
                        ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-sm'
                        : 'bg-coffee-50 border-coffee-200 text-coffee-700'
                    }`}
                  >
                    Xin nghỉ phép đột xuất
                  </button>
                </div>
              </div>

              {/* Ca làm cần đổi */}
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase mb-1">
                  Chọn Ca Làm Việc Của Bạn
                </label>
                {myShifts.length === 0 ? (
                  <div className="p-3 bg-coffee-50 rounded-xl text-xs text-coffee-500 italic">
                    Bạn hiện chưa có ca làm việc nào được phân công sắp tới.
                  </div>
                ) : (
                  <select
                    value={senderAssignmentId}
                    onChange={(e) => setSenderAssignmentId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-coffee-50/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {myShifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shiftTemplate?.name} — Ngày {s.workDate} ({s.shiftTemplate?.startTime.slice(0, 5)} - {s.shiftTemplate?.endTime.slice(0, 5)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Đồng nghiệp muốn đổi */}
              {requestType === 'EXCHANGE' && (
                <div>
                  <label className="block text-xs font-bold text-coffee-800 uppercase mb-1">
                    Chọn Đồng Nghiệp Muốn Đổi Ca
                  </label>
                  <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-coffee-50/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.position}) - {u.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lý do */}
              <div>
                <label className="block text-xs font-bold text-coffee-800 uppercase mb-1">
                  Lý Do Cụ Thể
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Em bận việc gia đình đột xuất, muốn nhờ bạn làm thay..."
                  className="w-full p-3 rounded-xl border border-coffee-300 bg-coffee-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-coffee-300 font-semibold text-xs text-coffee-700 hover:bg-coffee-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || myShifts.length === 0}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-coffee-800 text-white font-bold text-xs shadow-md hover:from-amber-700 hover:to-coffee-900 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
