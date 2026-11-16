import React, { useState, useEffect } from 'react';
import { 
  Coffee, Clock, QrCode, Calendar, ArrowRight, 
  CheckCircle, AlertTriangle, TrendingUp, Shield, Users, DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DashboardView({ setActiveTab }) {
  const { user, role } = useAuth();
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [myShifts, setMyShifts] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [activeRes, shiftsRes, historyRes] = await Promise.all([
          api.getActiveStatus().catch(() => ({ data: null })),
          api.getMyShifts().catch(() => ({ data: [] })),
          api.getMyAttendance().catch(() => ({ data: [] })),
        ]);
        setActiveCheckIn(activeRes?.data || null);
        setMyShifts(shiftsRes?.data || []);
        setMyHistory(historyRes?.data || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayShift = myShifts.find(s => s.workDate === todayStr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Welcome Banner with Real-time Clock */}
      <div className="bg-gradient-to-r from-coffee-900 via-coffee-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Coffee Bean background illustration */}
        <div className="absolute right-0 -bottom-10 opacity-10 pointer-events-none">
          <Coffee className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <span>The Rustic Bean Coffee</span>
              <span>•</span>
              <span className="font-mono">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Xin chào, {user?.fullName}! 👋
            </h1>
            <p className="text-coffee-200 text-sm mt-1 max-w-xl">
              Vị trí: <strong>{user?.position}</strong> | Mức lương theo giờ: <strong>{formatCurrency(user?.hourlyRate)}/giờ</strong>
            </p>
          </div>

          {/* Real-time Clock Widget */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 self-start md:self-center">
            <Clock className="w-7 h-7 text-amber-300 animate-pulse" />
            <div>
              <div className="text-xs text-coffee-200 font-medium">Đồng hồ thời gian thực</div>
              <div className="text-2xl font-black font-mono tracking-wider text-amber-200">
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Card: Real-time Attendance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status Box */}
        <div className={`p-6 rounded-3xl border shadow-md flex flex-col justify-between ${
          activeCheckIn 
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Trạng thái làm việc</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                activeCheckIn ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
              }`}>
                <span className={`w-2 h-2 rounded-full ${activeCheckIn ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`} />
                {activeCheckIn ? 'ĐANG TRONG CA' : 'CHƯA VÀO CA'}
              </span>
            </div>

            {activeCheckIn ? (
              <div className="space-y-1.5">
                <div className="text-xl font-black text-emerald-900">
                  Đã Check-in vào ca
                </div>
                <div className="text-sm text-emerald-800">
                  Lúc: <strong className="font-mono">{new Date(activeCheckIn.checkInTime).toLocaleTimeString('vi-VN')}</strong>
                </div>
                <div className="text-xs text-emerald-700 bg-emerald-100/70 p-2 rounded-xl mt-2">
                  Trạng thái: <strong>{activeCheckIn.status === 'ON_TIME' ? 'Đúng giờ' : 'Đi muộn'}</strong>
                  {activeCheckIn.notes && ` (${activeCheckIn.notes})`}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xl font-black text-amber-950">
                  Sẵn sàng vào ca
                </div>
                <p className="text-xs text-amber-800">
                  Hãy quét mã QR tại quầy thu ngân khi bạn đến quán để ghi nhận giờ làm chính xác.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`w-full mt-5 py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition ${
              activeCheckIn
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/20'
                : 'bg-gradient-to-r from-amber-600 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white shadow-amber-900/20'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>{activeCheckIn ? 'Quét QR để Check-out (Ra ca)' : 'Quét mã QR Chấm công ngay'}</span>
          </button>
        </div>

        {/* Today's Shift Card */}
        <div className="p-6 rounded-3xl bg-white border border-coffee-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-coffee-600 uppercase tracking-wider">Lịch phân ca hôm nay</span>
              <Calendar className="w-4 h-4 text-coffee-400" />
            </div>

            {todayShift ? (
              <div className="space-y-2">
                <div className="text-lg font-bold text-coffee-950">
                  {todayShift.shiftTemplate?.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-coffee-700 font-mono">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{todayShift.shiftTemplate?.startTime} - {todayShift.shiftTemplate?.endTime}</span>
                </div>
                {todayShift.notes && (
                  <div className="text-xs text-coffee-600 bg-coffee-50 p-2 rounded-xl">
                    Ghi chú: {todayShift.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <div className="text-coffee-400 text-sm">Hôm nay bạn không có lịch phân ca</div>
                <span className="text-xs text-coffee-500 block mt-1">Nghỉ ngơi hoặc đăng ký đổi ca</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('schedule')}
            className="w-full mt-4 py-3 px-4 rounded-2xl border border-coffee-300 hover:bg-coffee-50 text-coffee-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Xem toàn bộ lịch tuần</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick KPI Stat Card */}
        <div className="p-6 rounded-3xl bg-white border border-coffee-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-coffee-600 uppercase tracking-wider">Tổng kết cá nhân</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
                <span className="text-xs text-coffee-600">Lương theo giờ:</span>
                <span className="text-sm font-bold text-coffee-900">{formatCurrency(user?.hourlyRate)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
                <span className="text-xs text-coffee-600">Số ca gần đây:</span>
                <span className="text-sm font-bold text-coffee-900">{myHistory.length} ca</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-coffee-600">Thiết bị lưu số:</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {user?.phoneNumber}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('payroll')}
            className="w-full mt-4 py-3 px-4 rounded-2xl border border-coffee-300 hover:bg-coffee-50 text-coffee-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Xem chi tiết bảng lương</span>
          </button>
        </div>

      </div>

      {/* Recent Attendance History Table */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-coffee-950">Lịch sử chấm công gần nhất</h2>
            <p className="text-xs text-coffee-600">Ghi nhận vào ca / ra ca tự động qua quét mã QR</p>
          </div>
          <button
            onClick={() => setActiveTab('attendance')}
            className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
          >
            Mở quét QR <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myHistory.length === 0 ? (
          <div className="py-8 text-center text-sm text-coffee-500">
            Chưa có lịch sử chấm công nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-coffee-200 text-coffee-500 uppercase font-bold">
                  <th className="py-3 px-3">Thời gian Vào</th>
                  <th className="py-3 px-3">Thời gian Ra</th>
                  <th className="py-3 px-3">Tổng giờ làm</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {myHistory.slice(0, 5).map((att) => (
                  <tr key={att.id} className="hover:bg-coffee-50/50 transition">
                    <td className="py-3 px-3 font-mono font-medium text-coffee-900">
                      {att.checkInTime ? new Date(att.checkInTime).toLocaleString('vi-VN') : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-coffee-900">
                      {att.checkOutTime ? new Date(att.checkOutTime).toLocaleString('vi-VN') : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Đang làm</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-800">
                      {att.workHours ? `${att.workHours} giờ` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        att.status === 'ON_TIME'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.status === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {att.status === 'ON_TIME' ? 'Đúng giờ' : att.status === 'LATE' ? 'Đi muộn' : att.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-coffee-600 max-w-xs truncate">
                      {att.notes || '—'}
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
