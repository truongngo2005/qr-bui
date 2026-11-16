import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, QrCode, Clock, Sparkles, CheckCircle2, 
  RotateCw, UserCheck, ShieldCheck, Coffee, Smartphone 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function QrKioskModal() {
  const { 
    qrKioskOpen, 
    setQrKioskOpen, 
    users, 
    currentUser, 
    performCheckIn, 
    performCheckOut, 
    attendances,
    addToast
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState(currentUser?.id || 3);
  const [customPhone, setCustomPhone] = useState('');

  // Clock tick
  useEffect(() => {
    if (!qrKioskOpen) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [qrKioskOpen]);

  useEffect(() => {
    if (currentUser?.id) setSelectedStaffId(currentUser.id);
  }, [currentUser]);

  if (!qrKioskOpen) return null;

  const targetUser = users.find((u) => u.id === Number(selectedStaffId)) || users[2];
  const activeAtt = attendances.find((a) => a.userId === targetUser?.id && !a.checkOutTime);
  const isInShift = Boolean(activeAtt);

  // Dynamic QR payload changing every 30s
  const epoch30 = Math.floor(Date.now() / 30000);
  const qrPayload = `COFFEELAB_KIOSK_TOKEN:${epoch30}:${currentTime.toISOString().slice(0, 10)}`;

  const handleAction = () => {
    if (isInShift) {
      performCheckOut(targetUser.id);
    } else {
      performCheckIn(targetUser.id);
    }
  };

  const handlePhoneCheck = () => {
    const found = users.find((u) => u.phoneNumber === customPhone.trim());
    if (found) {
      setSelectedStaffId(found.id);
      addToast(`Đã nhận diện: ${found.fullName}`, 'info');
      setCustomPhone('');
    } else {
      addToast('Không tìm thấy nhân viên với số điện thoại này!', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-coffee-200 relative overflow-hidden animate-scale-up space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-coffee-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-coffee-800 flex items-center justify-center text-white shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Kiosk Quầy Thu Ngân
              </div>
              <h2 className="text-xl font-extrabold text-coffee-950">
                Chấm Công QR & Điểm Danh Ca Làm
              </h2>
            </div>
          </div>

          <button
            onClick={() => setQrKioskOpen(false)}
            className="p-2 rounded-2xl bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Clock & Dynamic QR Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Left: Dynamic QR Code with pulsating frame */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-coffee-950 to-coffee-900 rounded-3xl text-white text-center space-y-3 shadow-inner">
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG value={qrPayload} size={180} level="H" includeMargin={false} />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
            </div>

            <div className="text-[11px] text-coffee-300 max-w-[200px] leading-tight">
              Mã QR quầy đổi tự động mỗi 30s chống chụp ảnh giả mạo
            </div>
          </div>

          {/* Right: 1-Touch Check-in / Check-out Panel */}
          <div className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-coffee-700 uppercase tracking-wider mb-1.5">
                Chọn nhân viên điểm danh:
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-xl border border-coffee-300 bg-coffee-50 font-bold text-sm text-coffee-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.avatar} {u.fullName} ({u.position}) - {u.role === 'ADMIN' ? 'Admin' : `${u.hourlyRate.toLocaleString('vi-VN')} ₫/h`}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick SĐT lookup */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Hoặc nhập SĐT nhân viên..."
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="flex-1 py-2 px-3 rounded-xl border border-coffee-300 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handlePhoneCheck}
                className="px-3 py-2 rounded-xl bg-coffee-800 text-white font-bold text-xs hover:bg-coffee-900"
              >
                Tìm
              </button>
            </div>

            {/* Status Card for Selected User */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              isInShift
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Trạng thái hiện tại:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${
                  isInShift ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isInShift ? '● ĐANG TRONG CA' : '○ CHƯA VÀO CA'}
                </span>
              </div>
              {isInShift ? (
                <div>
                  <div className="text-emerald-800">
                    Đã vào ca lúc: <strong className="font-mono">{activeAtt.checkInTime}</strong>
                  </div>
                  <div className="text-emerald-700 text-[11px] mt-0.5">
                    Hệ thống sẽ tự động tính tổng phút và quy ra tiền lương khi bấm Ra Ca!
                  </div>
                </div>
              ) : (
                <div className="text-amber-800">
                  Sẵn sàng ghi nhận ca làm việc tại quầy. Bấm nút bên dưới để bắt đầu ca!
                </div>
              )}
            </div>

            {/* 1-Touch Action Button */}
            <button
              onClick={handleAction}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition ${
                isInShift
                  ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-900/20'
                  : 'bg-gradient-to-r from-amber-600 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white shadow-amber-900/20'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>{isInShift ? 'XÁC NHẬN RA CA (CHECK-OUT)' : 'XÁC NHẬN VÀO CA (CHECK-IN)'}</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
