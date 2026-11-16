import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Clock, AlertTriangle, TrendingUp, 
  Package, Calendar, CheckCircle2, ChevronRight, Sparkles, Coffee 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useApp } from '../context/AppContext';

export default function AdminDashboardView({ setActiveTab }) {
  const { 
    currentUser, 
    users, 
    attendances, 
    lowStockCount, 
    posReports, 
    schedule,
    shiftTemplates 
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // 1. KPI: Nhân sự đang làm ngay lúc này
  const activeStaffList = attendances.filter((a) => !a.checkOutTime);
  const activeStaffCount = activeStaffList.length;

  // 2. KPI: Tổng giờ công & Quỹ lương dự kiến (loại trừ Admin)
  const nonAdminAttendances = attendances.filter((a) => {
    const u = users.find((x) => x.id === a.userId);
    return u && u.role !== 'ADMIN';
  });
  const totalWorkedHours = nonAdminAttendances.reduce((acc, cur) => acc + (cur.workHours || 0), 0);
  const totalPayrollFund = nonAdminAttendances.reduce((acc, cur) => acc + (cur.shiftPay || 0), 0);

  // 3. KPI: Doanh thu thực thu & Báo cáo gần nhất
  const latestApprovedReport = posReports.find((r) => r.status === 'APPROVED') || posReports[0];
  const pendingReportsCount = posReports.filter((r) => r.status === 'PENDING').length;
  const todayRevenue = latestApprovedReport ? latestApprovedReport.actualCashSubmitted : 0;

  // 4. Dữ liệu biểu đồ cột Doanh thu POS vs Chi phí (Recharts)
  const revenueChartData = posReports.slice(0, 5).reverse().map((r) => ({
    name: r.reportDate.slice(5), // MM-DD
    'Doanh thu POS': r.posMachineRevenue,
    'Chi phí phát sinh': r.totalExpenses,
    'Thực thu tiền mặt': r.actualCashSubmitted,
  }));

  // 5. Dữ liệu biểu đồ tròn Cơ cấu thanh toán
  const pieData = latestApprovedReport ? [
    { name: 'Tiền mặt nộp két', value: latestApprovedReport.actualCashSubmitted, color: '#b45309' },
    { name: 'Chuyển khoản ngân hàng', value: latestApprovedReport.bankTransferAmount, color: '#2563eb' },
    { name: 'App giao hàng (Grab/Shopee)', value: latestApprovedReport.appDeliveryRevenue, color: '#16a34a' },
    { name: 'Chi phí mua ngoài', value: latestApprovedReport.totalExpenses, color: '#dc2626' },
  ] : [
    { name: 'Tiền mặt', value: 2200000, color: '#b45309' },
    { name: 'Chuyển khoản', value: 4300000, color: '#2563eb' },
    { name: 'App giao hàng', value: 1850000, color: '#16a34a' },
  ];

  // 6. Trạng thái ca làm việc hôm nay
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAssignments = schedule.assignments.filter((a) => a.workDate === todayStr);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Welcome & Admin Banner */}
      <div className="bg-gradient-to-r from-coffee-950 via-coffee-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-widest mb-1.5">
              <span>Bảng Điều Hành Chủ Cửa Hàng (Admin)</span>
              <span>•</span>
              <span className="font-mono">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Coffee Lab - Tổng Quan Vận Hành
            </h1>
            <p className="text-coffee-200 text-xs sm:text-sm mt-1 max-w-xl">
              Giám sát nhân sự thời gian thực, đối soát quỹ lương & phân tích doanh thu POS tự động.
              <span className="block text-amber-300 font-bold mt-0.5">
                * Chủ cửa hàng hưởng chính sách Lương = 0 ₫ (loại trừ khỏi danh sách bảng lương nhân viên).
              </span>
            </p>
          </div>

          {/* Clock Widget */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-3 self-start md:self-center">
            <Clock className="w-6 h-6 text-amber-300 animate-pulse" />
            <div>
              <div className="text-[10px] text-coffee-200 uppercase font-bold">Giờ hệ thống</div>
              <div className="text-xl font-black font-mono tracking-wider text-amber-200">
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock & Pending POS Banners if any */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lowStockCount > 0 && (
          <div 
            onClick={() => setActiveTab('admin-inventory')}
            className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 hover:bg-amber-100/70 transition cursor-pointer flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                <Package className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-950">
                  CẢNH BÁO KHO: Có {lowStockCount} mặt hàng dưới ngưỡng an toàn!
                </div>
                <div className="text-[11px] text-amber-800">
                  Nhấn để vào trang Quản Lý Kho và kiểm tra nguyên vật liệu sắp hết.
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-700" />
          </div>
        )}

        {pendingReportsCount > 0 && (
          <div 
            onClick={() => setActiveTab('pos-reports')}
            className="p-4 rounded-3xl bg-purple-50 border-2 border-purple-300 hover:bg-purple-100/70 transition cursor-pointer flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-200 text-purple-900 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5 text-purple-800" />
              </div>
              <div>
                <div className="text-xs font-black text-purple-950">
                  Có {pendingReportsCount} Báo Cáo Doanh Thu POS chờ bạn duyệt!
                </div>
                <div className="text-[11px] text-purple-800">
                  Nhấn để đối soát tiền mặt thực tế và phê duyệt báo cáo cuối ngày.
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-700" />
          </div>
        )}
      </div>

      {/* 4 Core Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Nhân sự đang làm */}
        <div className="bg-white rounded-3xl p-5 border border-coffee-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-coffee-600 uppercase tracking-wider block">
              Nhân sự đang trong ca
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-coffee-950 font-mono">
                {activeStaffCount}
              </span>
              <span className="text-xs text-emerald-700 font-bold">người trực</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tổng giờ công */}
        <div className="bg-white rounded-3xl p-5 border border-coffee-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-coffee-600 uppercase tracking-wider block">
              Tổng giờ công ghi nhận
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900 font-mono">
                {totalWorkedHours.toFixed(1)}h
              </span>
              <span className="text-xs text-coffee-600 font-semibold">tổng ca</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Quỹ lương dự kiến */}
        <div className="bg-white rounded-3xl p-5 border border-coffee-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-coffee-600 uppercase tracking-wider block">
              Quỹ lương nhân sự
            </span>
            <span className="text-xl font-black text-coffee-950 font-mono">
              {formatCurrency(totalPayrollFund)}
            </span>
          </div>
        </div>

        {/* KPI 4: Thực thu tiền mặt */}
        <div className="bg-white rounded-3xl p-5 border border-coffee-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-coffee-600 uppercase tracking-wider block">
              Thực thu POS gần nhất
            </span>
            <span className="text-xl font-black text-purple-900 font-mono">
              {formatCurrency(todayRevenue)}
            </span>
          </div>
        </div>

      </div>

      {/* Visual Recharts Analytics: Biểu đồ cột & Biểu đồ tròn */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Biểu đồ cột: Doanh thu POS vs Chi phí */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-coffee-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-coffee-950">
                Đối Soát Doanh Thu POS & Chi Phí Phát Sinh
              </h3>
              <p className="text-xs text-coffee-600">
                Số liệu thực thu tiền mặt sau khi trừ chuyển khoản, ứng dụng và chi phí mua ngoài
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Recharts Visual
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#8c5539" fontSize={11} />
                <YAxis stroke="#8c5539" fontSize={11} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #ebdccf', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Doanh thu POS" fill="#a76d49" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Thực thu tiền mặt" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Chi phí phát sinh" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn: Cơ cấu dòng tiền thanh toán */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-coffee-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-coffee-950">
              Cơ Cấu Dòng Tiền POS
            </h3>
            <p className="text-xs text-coffee-600">
              Tỷ trọng phương thức thanh toán tại quán
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-1 border-t border-coffee-100">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-coffee-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="font-bold font-mono text-coffee-950">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Trạng thái ca làm việc hôm nay */}
      <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-coffee-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-700" />
              Lịch Trực Ca Hôm Nay ({todayStr})
            </h3>
            <p className="text-xs text-coffee-600">
              Giám sát nhân sự phân công cho 3 ca chuẩn trong ngày (S1, C1, T1)
            </p>
          </div>

          <button
            onClick={() => setActiveTab('schedule-admin')}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            <span>Quản lý định mức ca</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftTemplates.map((tpl) => {
            const assignedInTpl = todayAssignments.filter((a) => a.shiftTemplateId === tpl.id);
            const isFull = assignedInTpl.length >= tpl.minEmployees;

            return (
              <div
                key={tpl.id}
                className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                  isFull ? 'bg-coffee-50/70 border-coffee-200' : 'bg-orange-50 border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sm font-extrabold text-coffee-950">{tpl.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isFull ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-200 text-orange-950'
                  }`}>
                    {assignedInTpl.length} / {tpl.minEmployees} người
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-coffee-600 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{tpl.startTime} - {tpl.endTime}</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-coffee-200">
                  <span className="text-[10px] text-coffee-500 font-bold uppercase">Nhân sự xếp ca:</span>
                  {assignedInTpl.length === 0 ? (
                    <div className="text-coffee-400 italic">Chưa xếp người</div>
                  ) : (
                    assignedInTpl.map((ass) => {
                      const u = users.find((x) => x.id === ass.userId);
                      return (
                        <div key={ass.id} className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-coffee-200">
                          <span className="font-bold text-coffee-900">{u?.fullName || 'Nhân viên'}</span>
                          <span className="text-[10px] text-coffee-500">{u?.position}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
