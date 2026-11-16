import React, { useState } from 'react';
import { 
  Coffee, Phone, ArrowRight, QrCode, Shield, 
  Sparkles, Users, UserCheck, CheckCircle2, Lock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginView({ setActiveTab }) {
  const { users, loginByPhone, switchUser, setQrKioskOpen } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (loginByPhone(phoneNumber)) {
      setPhoneNumber('');
    }
  };

  const loginDemo = (roleName) => {
    const target = users.find((u) => u.role === roleName);
    if (target) {
      switchUser(target.id);
      if (target.role === 'ADMIN') setActiveTab('admin-dashboard');
      else setActiveTab('staff-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-br from-[#fbf8f5] via-[#f5eee6] to-[#ebdccf] relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-coffee-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-coffee-200/80 p-6 sm:p-8 relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-coffee-800 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-950/20 mb-3">
            <Coffee className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-coffee-950 tracking-tight">
            Coffee Lab
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-800 mt-0.5 tracking-wider uppercase">
            Hệ Thống Quản Lý Nhân Sự & POS v2
          </p>
          <p className="text-xs text-coffee-600 mt-1">
            Chấm công QR • Phân ca • Đổi ca trực tiếp • Kho hàng • Doanh thu POS
          </p>
        </div>

        {/* Nút Mở Nhanh Kiosk Quét QR Chấm Công (Ngay ngoài màn hình đăng nhập) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-coffee-50 border-2 border-dashed border-amber-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-700" />
              Chấm Công Quầy Thu Ngân
            </span>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
              Kiosk Quầy
            </span>
          </div>
          <button
            onClick={() => setQrKioskOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>Mở Kiosk Quét QR Điểm Danh Ngay</span>
          </button>
        </div>

        {/* Form Đăng Nhập Bằng Số Điện Thoại */}
        <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-coffee-800 uppercase tracking-wider mb-1.5">
              Số Điện Thoại Nhân Viên:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-coffee-300 bg-coffee-50/50 text-coffee-950 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-coffee-900 hover:bg-black text-white font-extrabold text-sm shadow-lg shadow-coffee-950/20 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <span>Đăng Nhập Làm Việc</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 3 Nút Đăng Nhập Demo Nhanh Theo 3 Nhóm Quyền */}
        <div className="pt-4 border-t border-coffee-200 space-y-2.5">
          <div className="text-xs font-black text-coffee-700 uppercase tracking-wider text-center">
            Đăng Nhập Thử Nghiệm Nhanh (1-Chạm):
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => loginDemo('ADMIN')}
              className="p-2.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 text-center transition active:scale-95 shadow-sm"
            >
              <div className="text-xs font-black text-red-700">1. ADMIN</div>
              <div className="text-[10px] text-red-800 font-semibold truncate">Chủ quán</div>
            </button>

            <button
              onClick={() => loginDemo('MANAGER')}
              className="p-2.5 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-center transition active:scale-95 shadow-sm"
            >
              <div className="text-xs font-black text-amber-700">2. MANAGEMENT</div>
              <div className="text-[10px] text-amber-800 font-semibold truncate">Quản lý</div>
            </button>

            <button
              onClick={() => loginDemo('EMPLOYEE')}
              className="p-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-center transition active:scale-95 shadow-sm"
            >
              <div className="text-xs font-black text-emerald-700">3. STAFF</div>
              <div className="text-[10px] text-emerald-800 font-semibold truncate">Nhân viên</div>
            </button>
          </div>

          {/* Danh sách chọn nhanh các nhân viên khác */}
          <div className="pt-2">
            <span className="text-[11px] text-coffee-500 font-bold block mb-1">
              Hoặc chọn trực tiếp nhân sự:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    if (u.role === 'ADMIN') setActiveTab('admin-dashboard');
                    else setActiveTab('staff-dashboard');
                  }}
                  className="p-1.5 rounded-xl bg-coffee-50 hover:bg-coffee-100 border border-coffee-200 text-left flex items-center gap-1.5"
                >
                  <span>{u.avatar}</span>
                  <span className="truncate font-semibold text-coffee-900">{u.fullName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
