import React, { useState } from 'react';
import { 
  Coffee, Calendar, QrCode, Users, ArrowLeftRight, 
  DollarSign, Package, FileText, UserCheck, LogOut, 
  ChevronDown, Bell, Sparkles, CheckCircle2, Shield, Menu, X, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { 
    currentUser, 
    users, 
    role, 
    isAdmin, 
    isManager, 
    isStaff, 
    switchUser, 
    logout, 
    isInShift, 
    activeCheckIn,
    pendingSwapCount,
    setQrKioskOpen 
  } = useApp();

  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Danh sách Navigation items tùy theo phân quyền 3 nhóm
  let navItems = [];

  if (isAdmin) {
    navItems = [
      { id: 'admin-dashboard', label: 'Tổng Quan', icon: Coffee },
      { id: 'admin-employees', label: 'Quản Lý Nhân Viên', icon: Users },
      { id: 'schedule-admin', label: 'Lịch Ca & Định Mức', icon: Calendar },
      { id: 'admin-inventory', label: 'Quản Lý Kho', icon: Package, highlight: true },
      { id: 'pos-reports', label: 'Báo Cáo POS', icon: FileText },
      { id: 'admin-payroll', label: 'Chấm Công & Lương', icon: DollarSign },
    ];
  } else if (isManager) {
    navItems = [
      { id: 'staff-dashboard', label: 'Tổng Quan', icon: Coffee },
      { id: 'qr-attendance', label: 'Chấm Công QR', icon: QrCode },
      { id: 'schedule-staff', label: 'Lịch Ca & Đổi Ca', icon: Calendar, badge: pendingSwapCount },
      { id: 'schedule-manager', label: 'Xếp Lịch (Quản Lý)', icon: Users, special: true },
      { id: 'staff-payroll', label: 'Lương & Giờ Làm', icon: DollarSign },
      { id: 'pos-reports', label: 'Báo Cáo POS', icon: FileText },
    ];
  } else {
    // Staff (5 mục chuẩn)
    navItems = [
      { id: 'staff-dashboard', label: 'Tổng Quan', icon: Coffee },
      { id: 'qr-attendance', label: 'Chấm Công QR', icon: QrCode },
      { id: 'schedule-staff', label: 'Lịch Ca & Đổi Ca', icon: Calendar, badge: pendingSwapCount },
      { id: 'staff-payroll', label: 'Lương & Giờ Làm', icon: DollarSign },
      { id: 'pos-reports', label: 'Báo Cáo POS', icon: FileText },
    ];
  }

  const getRoleBadge = () => {
    if (isAdmin) {
      return <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-black px-2 py-0.5 rounded-full">ADMIN</span>;
    }
    if (isManager) {
      return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">QUẢN LÝ</span>;
    }
    return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">NHÂN VIÊN</span>;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-coffee-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Brand */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer shrink-0" 
              onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'staff-dashboard')}
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-coffee-800 flex items-center justify-center text-white shadow-md">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-coffee-950 text-base sm:text-lg tracking-tight block leading-tight">
                  Coffee Lab
                </span>
                <span className="text-[10px] font-bold text-amber-700 block leading-tight tracking-wider">
                  HR & POS v2
                </span>
              </div>
            </div>

            {/* In-Shift Live Status Badge (Navbar indicator) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition">
              <span className={`w-2.5 h-2.5 rounded-full ${isInShift ? 'bg-emerald-500 animate-ping' : 'bg-coffee-300'}`} />
              <span className={isInShift ? 'text-emerald-800' : 'text-coffee-600'}>
                {isInShift ? `Đang trong ca: ${activeCheckIn?.shiftName || 'Làm việc'}` : 'Chưa vào ca'}
              </span>
            </div>

            {/* Desktop Navigation Items */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-coffee-900 text-white shadow-sm'
                        : item.special
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'text-coffee-700 hover:bg-coffee-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-coffee-600'}`} />
                    <span>{item.label}</span>

                    {/* Pending Swap Badge */}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Buttons: Kiosk QR button, Demo Switcher & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Nút mở nhanh Kiosk Chấm Công QR */}
              <button
                onClick={() => setQrKioskOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                title="Mở Kiosk Chấm công QR trạm quầy"
              >
                <QrCode className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">Kiosk QR</span>
              </button>

              {/* Nút Đổi tài khoản demo */}
              <div className="relative">
                <button
                  onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                  className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-coffee-100/80 hover:bg-coffee-200 border border-coffee-300 text-coffee-900 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Đổi demo:</span>
                  <span className="truncate max-w-[80px] sm:max-w-[100px]">{currentUser?.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-coffee-500" />
                </button>

                {/* Dropdown danh sách tài khoản demo */}
                {demoSwitchOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-coffee-200 p-3 space-y-1.5 z-50 animate-scale-up">
                    <div className="text-[11px] font-bold text-coffee-500 uppercase px-2 py-1">
                      Chuyển quyền tài khoản thử nghiệm:
                    </div>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setDemoSwitchOpen(false);
                          if (u.role === 'ADMIN') setActiveTab('admin-dashboard');
                          else setActiveTab('staff-dashboard');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                          u.id === currentUser?.id ? 'bg-amber-100/70 border border-amber-300' : 'hover:bg-coffee-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{u.avatar}</span>
                          <div>
                            <div className="font-bold text-coffee-950">{u.fullName}</div>
                            <div className="text-[10px] text-coffee-600">{u.position}</div>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-800' : u.role === 'MANAGER' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Avatar & Logout */}
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-2 rounded-xl text-coffee-600 hover:text-red-700 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-coffee-800 hover:bg-coffee-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-coffee-200 bg-white p-4 space-y-2 animate-fade-in shadow-xl">
            <div className="p-3 bg-coffee-50 rounded-2xl flex items-center justify-between border border-coffee-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentUser?.avatar}</span>
                <div>
                  <div className="font-bold text-coffee-950 text-sm">{currentUser?.fullName}</div>
                  <div className="text-xs text-coffee-600 flex items-center gap-1.5 mt-0.5">
                    {getRoleBadge()}
                    <span>{currentUser?.position}</span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isInShift ? 'bg-emerald-100 text-emerald-800' : 'bg-coffee-100 text-coffee-700'
              }`}>
                {isInShift ? 'Đang làm' : 'Chưa vào ca'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold transition text-left ${
                      isActive
                        ? 'bg-coffee-900 text-white'
                        : item.special
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-coffee-50 text-coffee-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="ml-auto bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Bar for Staff & Management (Quick 5 tabs) */}
      {!isAdmin && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-coffee-200 py-1 px-2 flex justify-around items-center shadow-2xl">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center p-1 rounded-xl transition ${
                  isActive ? 'text-amber-800 font-bold' : 'text-coffee-600'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-100' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label.split(' ')[0]}</span>
                {item.badge > 0 && (
                  <span className="absolute top-0 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
