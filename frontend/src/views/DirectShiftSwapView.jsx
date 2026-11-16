import React, { useState } from 'react';
import { 
  ArrowLeftRight, CheckCircle2, XCircle, Clock, 
  Send, User, AlertCircle, Trash2, Calendar, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DirectShiftSwapView() {
  const { 
    currentUser, 
    users, 
    schedule, 
    shiftTemplates, 
    exchangeRequests, 
    createDirectSwap, 
    respondDirectSwap, 
    cancelDirectSwap,
    addToast 
  } = useApp();

  // Ca làm việc sắp tới của chính currentUser trên lịch chính thức
  const todayStr = new Date().toISOString().split('T')[0];
  const myUpcomingAssignments = schedule.assignments.filter(
    (a) => a.userId === currentUser?.id && a.workDate >= todayStr
  );

  // Form State đổi ca song phương
  const [selectedMyAssId, setSelectedMyAssId] = useState(
    myUpcomingAssignments[0]?.id ? String(myUpcomingAssignments[0].id) : ''
  );
  const [selectedColleagueId, setSelectedColleagueId] = useState('');
  const [selectedColleagueAssId, setSelectedColleagueAssId] = useState('');
  const [swapReason, setSwapReason] = useState('');

  // Danh sách đồng nghiệp khác
  const otherStaff = users.filter((u) => u.id !== currentUser?.id && u.role !== 'ADMIN');

  // Ca làm việc sắp tới của đồng nghiệp đã chọn
  const colleagueAssignments = schedule.assignments.filter(
    (a) => a.userId === Number(selectedColleagueId) && a.workDate >= todayStr
  );

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!selectedMyAssId) {
      addToast('Vui lòng chọn 1 ca làm của bạn cần đổi!', 'warning');
      return;
    }
    if (!selectedColleagueId) {
      addToast('Vui lòng chọn đồng nghiệp muốn đổi ca cùng!', 'warning');
      return;
    }
    if (!selectedColleagueAssId) {
      addToast('Vui lòng chọn ca của đồng nghiệp bạn muốn đổi lấy!', 'warning');
      return;
    }

    const myAss = schedule.assignments.find((a) => a.id === Number(selectedMyAssId));
    const colleague = users.find((u) => u.id === Number(selectedColleagueId));
    const colleagueAss = schedule.assignments.find((a) => a.id === Number(selectedColleagueAssId));

    if (!myAss || !colleague || !colleagueAss) {
      addToast('Thông tin ca đổi không hợp lệ!', 'error');
      return;
    }

    createDirectSwap({
      senderAssignment: myAss,
      receiverUser: colleague,
      receiverAssignment: colleagueAss,
      reason: swapReason.trim(),
    });

    setSwapReason('');
  };

  // Danh sách lời mời gửi đến currentUser
  const receivedInvites = exchangeRequests.filter(
    (r) => r.receiverId === currentUser?.id
  );

  // Danh sách lời mời do currentUser gửi đi
  const sentInvites = exchangeRequests.filter(
    (r) => r.senderId === currentUser?.id
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
            <ArrowLeftRight className="w-4 h-4 text-amber-600" />
            <span>Cơ Chế Đổi Ca Song Phương Trực Tiếp</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-coffee-950 mt-0.5">
            Đổi Ca Cho Nhau (Tối Giản & Tự Động)
          </h2>
          <p className="text-xs text-coffee-600 mt-0.5">
            Đổi ca 2 chiều giữa 2 nhân viên có ca làm chính thức. <strong>Không cần quản lý duyệt</strong>: Khi đồng nghiệp bấm Đồng Ý, hệ thống hoán đổi lịch ngay lập tức!
          </p>
        </div>
      </div>

      {/* FORM: Tạo Lời Mời Đổi Ca Song Phương */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-coffee-200 shadow-lg space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-coffee-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-base font-extrabold text-coffee-950">
            Gửi Lời Mời Đổi Ca Sang Đồng Nghiệp
          </h3>
        </div>

        <form onSubmit={handleSendInvite} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bước 1: Chọn ca của mình */}
            <div className="p-4 rounded-2xl bg-coffee-50/70 border border-coffee-200 space-y-2">
              <label className="block text-xs font-black text-coffee-800 uppercase tracking-wide">
                1. Ca làm việc của bạn muốn đổi đi:
              </label>

              {myUpcomingAssignments.length === 0 ? (
                <div className="p-3 bg-white rounded-xl text-xs text-coffee-500 italic">
                  Bạn không có ca làm việc nào sắp tới trên lịch để đổi.
                </div>
              ) : (
                <select
                  value={selectedMyAssId}
                  onChange={(e) => setSelectedMyAssId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-white font-bold text-xs text-coffee-900 focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {myUpcomingAssignments.map((a) => {
                    const tpl = shiftTemplates.find((t) => t.id === a.shiftTemplateId);
                    return (
                      <option key={a.id} value={a.id}>
                        {tpl?.name} — Ngày {a.workDate} ({tpl?.startTime}-{tpl?.endTime})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Bước 2 & 3: Chọn đồng nghiệp và ca muốn đổi lấy */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <label className="block text-xs font-black text-amber-950 uppercase tracking-wide">
                2. Chọn đồng nghiệp & ca muốn đổi lấy:
              </label>

              <select
                value={selectedColleagueId}
                onChange={(e) => {
                  setSelectedColleagueId(e.target.value);
                  setSelectedColleagueAssId('');
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-amber-300 bg-white font-bold text-xs text-coffee-900 focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">-- Chọn đồng nghiệp đổi ca --</option>
                {otherStaff.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.avatar} {u.fullName} ({u.position})
                  </option>
                ))}
              </select>

              {selectedColleagueId && (
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-coffee-700 mb-1">
                    Ca sắp tới của đồng nghiệp:
                  </label>
                  {colleagueAssignments.length === 0 ? (
                    <div className="p-2 bg-white rounded-xl text-xs text-coffee-500 italic">
                      Đồng nghiệp này hiện không có ca làm sắp tới trên lịch.
                    </div>
                  ) : (
                    <select
                      value={selectedColleagueAssId}
                      onChange={(e) => setSelectedColleagueAssId(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-white font-bold text-xs text-coffee-900 focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">-- Chọn ca bạn muốn đổi lấy --</option>
                      {colleagueAssignments.map((a) => {
                        const tpl = shiftTemplates.find((t) => t.id === a.shiftTemplateId);
                        return (
                          <option key={a.id} value={a.id}>
                            {tpl?.name} — Ngày {a.workDate} ({tpl?.startTime}-{tpl?.endTime})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Lời nhắn */}
          <div>
            <label className="block text-xs font-bold text-coffee-800 uppercase mb-1">
              Lời Nhắn Cho Đồng Nghiệp (Tùy chọn):
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Bạn ơi mai mình có việc bận, đổi ca này giúp mình nhé..."
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-coffee-300 bg-coffee-50/50 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={myUpcomingAssignments.length === 0 || !selectedColleagueAssId}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white font-black text-sm shadow-lg shadow-amber-950/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Gửi Lời Mời Đổi Ca Song Phương</span>
          </button>

        </form>
      </div>

      {/* SECTION 2: LỜI MỜI ĐỔI CA GỬI ĐẾN BẠN (CẦN PHẢN HỒI) */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-coffee-950 flex items-center gap-2">
          <span>Lời Mời Đổi Ca Đang Chờ Bạn Phản Hồi</span>
          <span className="text-xs bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full font-black">
            {receivedInvites.filter((r) => r.status === 'PENDING').length}
          </span>
        </h3>

        {receivedInvites.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-coffee-200 text-center text-xs text-coffee-500">
            Hiện không có lời mời đổi ca nào gửi đến bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receivedInvites.map((inv) => (
              <div
                key={inv.id}
                className={`p-5 rounded-3xl border shadow-md space-y-4 ${
                  inv.status === 'PENDING'
                    ? 'bg-amber-50/80 border-amber-300'
                    : inv.status === 'ACCEPTED'
                    ? 'bg-emerald-50/80 border-emerald-300 opacity-90'
                    : 'bg-coffee-50/80 border-coffee-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-coffee-200">
                  <div className="text-xs font-bold text-coffee-950">
                    Từ: <strong className="text-sm font-black text-coffee-900">{inv.senderName}</strong>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    inv.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inv.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-200 text-amber-950'
                  }`}>
                    {inv.status === 'PENDING' ? 'Đang chờ bạn phản hồi' : inv.status === 'ACCEPTED' ? '✓ Đã đồng ý đổi ca' : '✕ Đã từ chối'}
                  </span>
                </div>

                {/* Thẻ hiển thị 2 ca */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-coffee-200">
                    <span className="text-[10px] text-coffee-500 font-bold block">Ca của bạn:</span>
                    <strong className="text-coffee-950 block mt-0.5">{inv.receiverShiftName}</strong>
                    <span className="font-mono text-coffee-600 block mt-0.5">{inv.receiverShiftDate}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-coffee-200">
                    <span className="text-[10px] text-emerald-700 font-bold block">Đổi lấy ca:</span>
                    <strong className="text-coffee-950 block mt-0.5">{inv.senderShiftName}</strong>
                    <span className="font-mono text-emerald-800 block mt-0.5">{inv.senderShiftDate}</span>
                  </div>
                </div>

                {inv.reason && (
                  <p className="text-[11px] text-coffee-700 italic bg-white/70 p-2 rounded-xl">
                    "{inv.reason}"
                  </p>
                )}

                {/* 2 Nút phản hồi nếu PENDING */}
                {inv.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => respondDirectSwap(inv.id, 'REJECT')}
                      className="py-2 px-3 rounded-xl border border-coffee-300 text-coffee-700 font-bold text-xs hover:bg-white"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => respondDirectSwap(inv.id, 'ACCEPT')}
                      className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md"
                    >
                      Đồng Ý Đổi Ca
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: LỜI MỜI BẠN ĐÃ GỬI ĐI */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-coffee-950">
          Lời Mời Đổi Ca Bạn Đã Gửi Đi
        </h3>

        {sentInvites.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-coffee-200 text-center text-xs text-coffee-500">
            Bạn chưa gửi lời mời đổi ca nào.
          </div>
        ) : (
          <div className="space-y-3">
            {sentInvites.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-2xl p-4 border border-coffee-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-extrabold text-coffee-950">
                    Gửi đến đồng nghiệp: <span className="text-amber-800">{inv.receiverName}</span>
                  </div>
                  <div className="text-coffee-600 mt-0.5">
                    Đổi: <strong>{inv.senderShiftName} ({inv.senderShiftDate})</strong> ➔ Lấy: <strong>{inv.receiverShiftName} ({inv.receiverShiftDate})</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    inv.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : inv.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {inv.status === 'PENDING' ? 'Chờ đồng nghiệp đồng ý' : inv.status === 'ACCEPTED' ? '✓ Đã hoán đổi' : '✕ Đã hủy/từ chối'}
                  </span>

                  {inv.status === 'PENDING' && (
                    <button
                      onClick={() => cancelDirectSwap(inv.id)}
                      className="p-1.5 rounded-lg text-coffee-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hủy lời mời"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
