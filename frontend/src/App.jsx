import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import QrKioskModal from './components/QrKioskModal';

import LoginView from './views/LoginView';
import AdminDashboardView from './views/AdminDashboardView';
import StaffDashboardView from './views/StaffDashboardView';
import WeeklyScheduleView from './views/WeeklyScheduleView';
import DirectShiftSwapView from './views/DirectShiftSwapView';
import InventoryView from './views/InventoryView';
import PosReportView from './views/PosReportView';
import PayrollView from './views/PayrollView';
import EmployeeManagementView from './views/EmployeeManagementView';

export default function App() {
  const { currentUserId, currentUser, isAdmin, isManager, isStaff, setQrKioskOpen } = useApp();

  // Active Tab state
  const [activeTab, setActiveTab] = useState(() => {
    return isAdmin ? 'admin-dashboard' : 'staff-dashboard';
  });

  // Sub-tab for Staff Schedule: 'schedule' hoặc 'swap'
  const [scheduleSubTab, setScheduleSubTab] = useState('schedule');

  // Cập nhật tab khi role thay đổi
  useEffect(() => {
    if (isAdmin) {
      if (!['admin-dashboard', 'admin-employees', 'schedule-admin', 'admin-inventory', 'pos-reports', 'admin-payroll'].includes(activeTab)) {
        setActiveTab('admin-dashboard');
      }
    } else {
      if (['admin-dashboard', 'admin-employees', 'schedule-admin', 'admin-inventory', 'admin-payroll'].includes(activeTab)) {
        setActiveTab('staff-dashboard');
      }
    }
  }, [isAdmin]);

  // Nếu chưa đăng nhập (currentUserId === 0)
  if (!currentUserId || !currentUser) {
    return (
      <>
        <ToastContainer />
        <QrKioskModal />
        <LoginView setActiveTab={setActiveTab} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f5] pb-20 xl:pb-8 text-[#321c13]">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Global Real-time QR Kiosk Modal */}
      <QrKioskModal />

      {/* Top Fixed Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* ADMIN VIEWS */}
        {activeTab === 'admin-dashboard' && <AdminDashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'admin-employees' && <EmployeeManagementView />}
        {activeTab === 'schedule-admin' && <WeeklyScheduleView mode="admin" setActiveTab={setActiveTab} />}
        {activeTab === 'admin-inventory' && <InventoryView />}
        {activeTab === 'admin-payroll' && <PayrollView />}

        {/* MANAGEMENT EXCLUSIVE VIEW */}
        {activeTab === 'schedule-manager' && <WeeklyScheduleView mode="manager" setActiveTab={setActiveTab} />}

        {/* STAFF & MANAGEMENT SHARED VIEWS */}
        {activeTab === 'staff-dashboard' && <StaffDashboardView setActiveTab={setActiveTab} />}
        
        {/* Lịch Ca & Đổi Ca (Có 2 sub-tabs: Xem/Đăng ký ca tuần & Đổi ca song phương) */}
        {activeTab === 'schedule-staff' && (
          <div className="space-y-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="bg-white p-1.5 rounded-2xl border border-coffee-200 inline-flex items-center gap-1 shadow-sm">
                <button
                  onClick={() => setScheduleSubTab('schedule')}
                  className={`py-2 px-4 rounded-xl text-xs font-black transition ${
                    scheduleSubTab === 'schedule'
                      ? 'bg-coffee-900 text-white shadow-sm'
                      : 'text-coffee-700 hover:bg-coffee-100'
                  }`}
                >
                  📅 Xem & Đăng Ký Lịch Tuần
                </button>
                <button
                  onClick={() => setScheduleSubTab('swap')}
                  className={`py-2 px-4 rounded-xl text-xs font-black transition ${
                    scheduleSubTab === 'swap'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-coffee-700 hover:bg-coffee-100'
                  }`}
                >
                  🔄 Đổi Ca Song Phương Cho Nhau
                </button>
              </div>
            </div>

            {scheduleSubTab === 'schedule' ? (
              <WeeklyScheduleView mode="staff" setActiveTab={setActiveTab} />
            ) : (
              <DirectShiftSwapView />
            )}
          </div>
        )}

        {/* Chấm Công QR (Mở Kiosk) */}
        {activeTab === 'qr-attendance' && (
          <div className="max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
            <h2 className="text-xl font-black text-coffee-950">Chấm Công Mã QR Tại Quầy</h2>
            <p className="text-xs text-coffee-600">Nhấn nút bên dưới để mở giao diện Kiosk Quầy Thu Ngân toàn màn hình</p>
            <button
              onClick={() => setQrKioskOpen(true)}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-coffee-800 text-white font-black text-sm shadow-xl"
            >
              Mở Kiosk Quét QR Ngay
            </button>
          </div>
        )}

        {/* Báo Cáo POS Cuối Ngày */}
        {activeTab === 'pos-reports' && <PosReportView />}

        {/* Lương & Giờ Làm Cá Nhân */}
        {activeTab === 'staff-payroll' && <PayrollView />}
      </main>
    </div>
  );
}
