import React, { useState, useEffect } from 'react';
import { 
  Coffee, Clock, QrCode, Calendar, ArrowLeftRight, 
  DollarSign, CheckCircle2, XCircle, AlertCircle, Sparkles, ChevronRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StaffDashboardView({ setActiveTab }) {
  const { 
    currentUser, 
    role, 
    isManager, 
    isInShift, 
    activeCheckIn, 
    performCheckIn, 
    performCheckOut, 
    attendances, 
    exchangeRequests, 
    respondDirectSwap, 
    schedule, 
    shiftTemplates,
    setQrKioskOpen 
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Ca hôm nay của currentUser
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayAssignment = schedule.assignments.find(
    (a) => a.userId === currentUser?.id && a.workDate === todayStr
  );
  const myTodayTemplate = myTodayAssignment
    ? shiftTemplates.find((t) => t.id === myTodayAssignment.shiftTemplateId)
    : null;

  // Lời mời đổi ca đang chờ phản hồi từ đồng nghiệp gửi đến currentUser
  const pendingInvitations = exchangeRequests.filter(
    (r) => r.receiverId === currentUser?.id && r.status === 'PENDING'
  );

  // Lịch sử chấm công cá nhân
  const myAttendances = attendances.filter((a) => a.userId === currentUser?.id);
  const totalWorkedHours = myAttendances.reduce((acc, cur) => acc + (cur.workHours || 0), 0);
  const totalEarned = myAttendances.reduce((acc, cur) => acc + (cur.shiftPay || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-coffee-900 via-coffee-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-widest mb-1.5">
              <span>Cổng Nhân Viên • Coffee Lab</span>
              <span>•</span>
              <span className="font-mono">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Xin chào, {currentUser?.fullName}! 👋
            </h1>
            <p className="text-coffee-200 text-xs sm:text-sm mt-1">
              Chức vụ: <strong>{currentUser?.position}</strong> | Mức lương tính giờ: <strong>{formatCurrency(currentUser?.hourlyRate)}/h</strong>
            </p>
          </div>

          {/* Clock & In-Shift Status Card */}
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-4 self-start md:self-center">
            <Clock className="w-7 h-7 text-amber-300 animate-pulse" />
            <div>
              <div className="text-[10px] text-coffee-200 uppercase font-bold">Giờ thực tế</div>
              <div className="text-xl font-black font-mono tracking-wider text-amber-200">
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 HIGHLIGHTED BANNER: LỜI MỜI ĐỔI CA SONG PHƯƠNG ĐANG CHỜ PHẢN HỒI (NẾU CÓ) */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-rose-800 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Có {pendingInvitations.length} Lời Mời Đổi Ca Song Phương Cần Bạn Xác Nhận</span>
          </div>

          {pendingInvitations.map((inv) => (
            <div
              key={inv.id}
              className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-400 shadow-xl space-y-4 animate-scale-up"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-200 text-rose-900 flex items-center justify-center font-black">
                    <ArrowLeftRight className="w-5 h-5 text-rose-700" />
                  </div>
                  <div>
                    <span className="text-xs text-rose-900 font-bold block">
                      Đồng nghiệp <strong className="text-base text-coffee-950">{inv.senderName}</strong> gửi lời mời đổi ca:
                    </span>
                    <span className="text-[11px] text-coffee-600 italic">"{inv.reason}"</span>
                  </div>
                </div>

                <span className="text-xs font-black bg-rose-200 text-rose-900 px-3 py-1 rounded-full self-start sm:self-center">
                  Tự động hoán đổi khi bạn đồng ý
                </span>
              </div>

              {/* So sánh 2 ca đổi nhau */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-2xl border border-rose-200 shadow-sm">
                  <span className="text-coffee-500 font-bold uppercase block text-[10px]">Ca làm việc của bạn:</span>
                  <div className="font-extrabold text-coffee-950 mt-1">{inv.receiverShiftName}</div>
                  <div className="font-mono text-amber-800 mt-0.5">Ngày: {inv.receiverShiftDate}</div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-300 shadow-sm">
                  <span className="text-emerald-700 font-bold uppercase block text-[10px]">Đổi lấy ca của đồng nghiệp:</span>
                  <div className="font-extrabold text-coffee-950 mt-1">{inv.senderShiftName}</div>
                  <div className="font-mono text-emerald-800 mt-0.5">Ngày: {inv.senderShiftDate}</div>
                </div>
              </div>

              {/* 2 Nút phản hồi tối giản */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => respondDirectSwap(inv.id, 'REJECT')}
                  className="py-2.5 px-4 rounded-xl border border-coffee-300 text-coffee-700 hover:bg-white font-bold text-xs transition"
                >
                  ✕ Từ Chối
                </button>
                <button
                  onClick={() => respondDirectSwap(inv.id, 'ACCEPT')}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-coffee-800 hover:from-emerald-700 hover:to-coffee-900 text-white font-black text-xs shadow-lg shadow-emerald-950/20 active:scale-98 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đồng Ý Đổi Ca (Hoán Đổi Ngay)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Quick Operation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Chấm công QR 1-Chạm */}
        <div className={`p-6 rounded-3xl border shadow-md flex flex-col justify-between ${
          isInShift ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider">Trạng thái điểm danh</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                isInShift ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isInShift ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`} />
                {isInShift ? 'ĐANG TRONG CA' : 'CHƯA VÀO CA'}
              </span>
            </div>

            {isInShift ? (
              <div className="space-y-1">
                <div className="text-lg font-black text-emerald-900">
                  {activeCheckIn?.shiftName}
                </div>
                <div className="text-xs text-emerald-800">
                  Đã vào ca lúc: <strong className="font-mono">{activeCheckIn?.checkInTime}</strong>
                </div>
                <p className="text-[11px] text-emerald-700 mt-2">
                  Bấm nút bên dưới khi hết ca để ghi nhận giờ làm thực tế và tính tiền lương.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-lg font-black text-amber-950">
                  Sẵn sàng ghi nhận ca
                </div>
                <p className="text-xs text-amber-800">
                  Quét QR trạm quầy hoặc bấm nút 1-chạm để điểm danh giờ vào ca của bạn.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-5">
            <button
              onClick={() => isInShift ? performCheckOut() : performCheckIn()}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition ${
                isInShift
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span>{isInShift ? 'Xác Nhận Ra Ca (Check-out)' : 'Xác Nhận Vào Ca (Check-in)'}</span>
            </button>

            <button
              onClick={() => setQrKioskOpen(true)}
              className="w-full py-2 text-xs font-bold text-coffee-700 hover:text-coffee-950 underline text-center"
            >
              Mở Kiosk Quét QR Quầy Thu Ngân
            </button>
          </div>
        </div>

        {/* Card 2: Lịch ca hôm nay */}
        <div className="p-6 rounded-3xl bg-white border border-coffee-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-coffee-600 uppercase tracking-wider">Ca làm hôm nay</span>
              <Calendar className="w-4 h-4 text-coffee-400" />
            </div>

            {myTodayTemplate ? (
              <div className="space-y-2">
                <div className="text-lg font-black text-coffee-950">
                  {myTodayTemplate.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-coffee-700 font-mono font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{myTodayTemplate.startTime} - {myTodayTemplate.endTime}</span>
                </div>
                <div className="text-[11px] text-coffee-600 bg-coffee-50 p-2.5 rounded-xl border border-coffee-200">
                  Định mức: {myTodayTemplate.minEmployees} người • Hệ số: {myTodayTemplate.salaryMultiplier}x
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-coffee-400">
                Hôm nay bạn không có ca trên lịch chính thức
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('schedule-staff')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl border border-coffee-300 hover:bg-coffee-50 text-coffee-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Xem lịch tuần & Đổi ca</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Thu nhập & Giờ công gần đây */}
        <div className="p-6 rounded-3xl bg-white border border-coffee-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-coffee-600 uppercase tracking-wider">Tổng kết công & lương</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
                <span className="text-coffee-600">Mức lương theo giờ:</span>
                <span className="font-bold text-coffee-950">{formatCurrency(currentUser?.hourlyRate)}/h</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
                <span className="text-coffee-600">Tổng giờ đã làm:</span>
                <span className="font-bold text-amber-900 font-mono">{totalWorkedHours.toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-coffee-600 font-bold">Tạm tính thực lĩnh:</span>
                <span className="font-black text-emerald-800 text-sm font-mono">{formatCurrency(totalEarned)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('staff-payroll')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl border border-coffee-300 hover:bg-coffee-50 text-coffee-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Chi tiết bảng lương tháng</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Lịch sử ca làm gần nhất */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md space-y-4">
        <h3 className="text-base font-extrabold text-coffee-950">
          Lịch Sử Chấm Công Gần Nhất Của Bạn
        </h3>

        {myAttendances.length === 0 ? (
          <div className="py-6 text-center text-xs text-coffee-500">
            Chưa có lịch sử chấm công nào được lưu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-coffee-200 text-coffee-600 uppercase font-bold bg-coffee-50/60">
                  <th className="py-3 px-3 rounded-l-xl">Ca Làm</th>
                  <th className="py-3 px-3">Giờ Vào</th>
                  <th className="py-3 px-3">Giờ Ra</th>
                  <th className="py-3 px-3">Tổng Giờ</th>
                  <th className="py-3 px-3 rounded-r-xl text-right">Tiền Lương Ca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {myAttendances.map((att) => (
                  <tr key={att.id} className="hover:bg-coffee-50/50 transition">
                    <td className="py-3 px-3 font-bold text-coffee-950">{att.shiftName}</td>
                    <td className="py-3 px-3 font-mono text-coffee-700">{att.checkInTime}</td>
                    <td className="py-3 px-3 font-mono text-coffee-700">
                      {att.checkOutTime || <span className="text-emerald-700 font-bold">Đang làm</span>}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-900">{att.workHours}h</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-800">
                      {formatCurrency(att.shiftPay)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
