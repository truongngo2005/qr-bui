import React, { useState } from 'react';
import { 
  DollarSign, Calendar, Clock, Award, AlertTriangle, 
  Download, CheckCircle2, User, FileText 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PayrollView() {
  const { currentUser, isAdmin, users, attendances } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('2026-11');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Lọc danh sách nhân sự được tính lương (LOẠI TRỪ ADMIN - Admin lương = 0đ)
  const payableStaff = users.filter((u) => u.role !== 'ADMIN');

  // Tính lương cho từng nhân sự
  const payrollSummary = payableStaff.map((staff) => {
    const staffAtts = attendances.filter((a) => a.userId === staff.id);
    const totalHours = staffAtts.reduce((sum, a) => sum + (a.workHours || 0), 0);
    const shiftCount = staffAtts.length;
    const lateCount = staffAtts.filter((a) => a.status === 'LATE').length;

    // Lương cơ bản = tổng giờ * lương/giờ
    const baseSalary = Math.round(totalHours * staff.hourlyRate);

    // Phụ cấp chuyên cần: 200,000đ nếu không đi muộn lần nào
    const allowance = lateCount === 0 && shiftCount > 0 ? 200000 : 0;

    // Khấu trừ phạt đi muộn: 30,000đ/lần
    const lateDeduction = lateCount * 30000;

    const netSalary = Math.max(0, baseSalary + allowance - lateDeduction);

    return {
      staff,
      shiftCount,
      totalHours: Number(totalHours.toFixed(2)),
      baseSalary,
      allowance,
      lateDeduction,
      netSalary,
      attendances: staffAtts,
    };
  });

  // Dành cho cá nhân đang đăng nhập (nếu không phải Admin)
  const myPayroll = payrollSummary.find((p) => p.staff.id === currentUser?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Quyết Toán Lương & Giờ Làm Việc</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-coffee-950 mt-0.5">
            {isAdmin ? 'Quản Lý Bảng Lương Toàn Cửa Hàng' : 'Bảng Lương & Giờ Làm Cá Nhân'}
          </h2>
          <p className="text-xs text-coffee-600 mt-0.5">
            Tính lương tự động = Số giờ công × Lương/giờ + Phụ cấp chuyên cần − Khấu trừ phạt
            <span className="block text-amber-800 font-bold mt-0.5">
              * Chính sách: Chủ cửa hàng (Admin) lương = 0 ₫, tự động loại trừ khỏi quyết toán bảng lương.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-2 px-3 rounded-xl border border-coffee-300 font-mono text-xs font-bold bg-white"
          />

          <button
            onClick={() => window.print()}
            className="py-2 px-3.5 rounded-xl border border-coffee-300 hover:bg-coffee-50 text-coffee-800 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>In Bảng Lương</span>
          </button>
        </div>
      </div>

      {/* ADMIN VIEW: Bảng Lương Toàn Bộ Nhân Sự (Loại trừ Admin) */}
      {isAdmin ? (
        <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-coffee-950">
              Danh Sách Quyết Toán Lương Nhân Sự Tháng {selectedMonth}
            </h3>
            <span className="text-xs text-coffee-500 font-bold">
              Tổng nhân sự hưởng lương: {payrollSummary.length} người
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-coffee-200 text-coffee-600 uppercase font-bold bg-coffee-50/70">
                  <th className="py-3 px-3 rounded-l-xl">Nhân Viên</th>
                  <th className="py-3 px-3">Chức Vụ</th>
                  <th className="py-3 px-3">Mức Lương/h</th>
                  <th className="py-3 px-3">Số Ca</th>
                  <th className="py-3 px-3">Tổng Giờ Công</th>
                  <th className="py-3 px-3">Lương Giờ</th>
                  <th className="py-3 px-3">Phụ Cấp</th>
                  <th className="py-3 px-3">Khấu Trừ</th>
                  <th className="py-3 px-3 rounded-r-xl text-right font-black">Thực Lĩnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {payrollSummary.map((item) => (
                  <tr key={item.staff.id} className="hover:bg-coffee-50/50 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-coffee-950 flex items-center gap-1.5">
                        <span>{item.staff.avatar}</span>
                        <span>{item.staff.fullName}</span>
                      </div>
                      <div className="text-[10px] text-coffee-500 font-mono">{item.staff.phoneNumber}</div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-coffee-700">{item.staff.position}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-coffee-800">
                      {formatCurrency(item.staff.hourlyRate)}
                    </td>
                    <td className="py-3.5 px-3 font-mono">{item.shiftCount} ca</td>
                    <td className="py-3.5 px-3 font-mono font-black text-amber-900">{item.totalHours}h</td>
                    <td className="py-3.5 px-3 font-mono text-coffee-900">{formatCurrency(item.baseSalary)}</td>
                    <td className="py-3.5 px-3 font-mono text-emerald-800 font-bold">{formatCurrency(item.allowance)}</td>
                    <td className="py-3.5 px-3 font-mono text-rose-700 font-bold">{formatCurrency(item.lateDeduction)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <strong className="text-sm font-black font-mono text-emerald-900">
                        {formatCurrency(item.netSalary)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STAFF & MANAGEMENT VIEW: Phiếu lương cá nhân */
        <div className="space-y-6">
          {myPayroll && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-coffee-200 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-coffee-100 gap-2">
                <div>
                  <h3 className="text-lg font-black text-coffee-950">
                    Phiếu Lương Cá Nhân Tháng {selectedMonth}
                  </h3>
                  <p className="text-xs text-coffee-600">
                    Họ tên: <strong>{currentUser?.fullName}</strong> ({currentUser?.position})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-coffee-500 uppercase font-bold block">Tổng thu nhập thực lĩnh</span>
                  <span className="text-2xl font-black font-mono text-emerald-900">
                    {formatCurrency(myPayroll.netSalary)}
                  </span>
                </div>
              </div>

              {/* 4 Summary Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-coffee-50 rounded-2xl border border-coffee-200">
                  <span className="text-coffee-500 font-bold block text-[10px] uppercase">Lương Theo Giờ:</span>
                  <span className="text-base font-black font-mono text-coffee-950 mt-1 block">
                    {formatCurrency(myPayroll.baseSalary)}
                  </span>
                  <span className="text-[10px] text-coffee-600">({myPayroll.totalHours} giờ × {formatCurrency(currentUser?.hourlyRate)})</span>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-emerald-800 font-bold block text-[10px] uppercase">+ Phụ Cấp Chuyên Cần:</span>
                  <span className="text-base font-black font-mono text-emerald-950 mt-1 block">
                    {formatCurrency(myPayroll.allowance)}
                  </span>
                  <span className="text-[10px] text-emerald-700">Không đi muộn</span>
                </div>

                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
                  <span className="text-rose-800 font-bold block text-[10px] uppercase">- Khấu Trừ Phạt:</span>
                  <span className="text-base font-black font-mono text-rose-950 mt-1 block">
                    {formatCurrency(myPayroll.lateDeduction)}
                  </span>
                  <span className="text-[10px] text-rose-700">Đi muộn</span>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-amber-800 font-bold block text-[10px] uppercase">Tổng Số Ca Làm:</span>
                  <span className="text-base font-black font-mono text-amber-950 mt-1 block">
                    {myPayroll.shiftCount} ca
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono">{myPayroll.totalHours} giờ công</span>
                </div>
              </div>

              {/* Chi tiết từng ca đã chấm công */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-coffee-800">
                  Chi Tiết Từng Ca Đã Chấm Công QR:
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-coffee-200 text-coffee-600 uppercase font-bold bg-coffee-50/70">
                        <th className="py-2.5 px-3 rounded-l-xl">Ngày Làm</th>
                        <th className="py-2.5 px-3">Ca</th>
                        <th className="py-2.5 px-3">Giờ Vào</th>
                        <th className="py-2.5 px-3">Giờ Ra</th>
                        <th className="py-2.5 px-3">Giờ Công</th>
                        <th className="py-2.5 px-3 rounded-r-xl text-right font-black">Lương Ca</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-100">
                      {myPayroll.attendances.map((att) => (
                        <tr key={att.id} className="hover:bg-coffee-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold">{att.workDate}</td>
                          <td className="py-2.5 px-3 font-semibold">{att.shiftName}</td>
                          <td className="py-2.5 px-3 font-mono text-coffee-600">{att.checkInTime}</td>
                          <td className="py-2.5 px-3 font-mono text-coffee-600">{att.checkOutTime || 'Đang làm'}</td>
                          <td className="py-2.5 px-3 font-mono font-black text-amber-900">{att.workHours}h</td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                            {formatCurrency(att.shiftPay)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
