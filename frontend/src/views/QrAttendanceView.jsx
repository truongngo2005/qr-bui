import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, Smartphone, Clock, CheckCircle2, AlertCircle, 
  RotateCw, Camera, Sparkles, ShieldCheck, ArrowRight, UserCheck, Coffee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function QrAttendanceView() {
  const { user, rememberedPhone } = useAuth();

  // Tab: 'scan' (Nhân viên quét) hoặc 'counter' (Màn hình quầy thu ngân)
  const [activeTab, setActiveTab] = useState('scan');

  // State cho Màn hình Quầy Thu Ngân (Dynamic QR)
  const [counterQr, setCounterQr] = useState(null);
  const [qrProgress, setQrProgress] = useState(100);
  const [currentTime, setCurrentTime] = useState(new Date());

  // State cho Quét QR Nhân viên (1-Chạm)
  const [phoneInput, setPhoneInput] = useState(rememberedPhone || user?.phoneNumber || '');
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [simulatedAction, setSimulatedAction] = useState('AUTO'); // AUTO, CHECK_IN, CHECK_OUT

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Counter Dynamic QR
  const fetchCounterQr = async () => {
    try {
      const res = await api.getCurrentQr();
      if (res.success) {
        setCounterQr(res.data);
      }
    } catch (err) {
      console.error("Error fetching counter QR:", err);
    }
  };

  useEffect(() => {
    fetchCounterQr();
    const interval = setInterval(fetchCounterQr, 30000); // Làm mới mỗi 30s
    return () => clearInterval(interval);
  }, []);

  // Progress bar countdown for 30 seconds
  useEffect(() => {
    const totalMs = 30000;
    const stepMs = 500;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += stepMs;
      const remaining = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setQrProgress(remaining);
      if (elapsed >= totalMs) {
        elapsed = 0;
        setQrProgress(100);
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [counterQr]);

  // Cập nhật SĐT khi rememberedPhone thay đổi
  useEffect(() => {
    if (rememberedPhone) {
      setPhoneInput(rememberedPhone);
    } else if (user?.phoneNumber) {
      setPhoneInput(user.phoneNumber);
    }
  }, [rememberedPhone, user]);

  // Xử lý Chấm công 1-chạm
  const handlePerformCheckIn = async (qrPayloadToUse) => {
    const phoneToUse = phoneInput.trim();
    if (!phoneToUse) {
      setScanError('Vui lòng nhập hoặc lưu Số điện thoại để chấm công!');
      return;
    }

    setScanError('');
    setScanning(true);
    setScanResult(null);

    const code = qrPayloadToUse || counterQr?.qrCodePayload || `COFFEE_QR:DEFAULT:${Date.now()}`;
    const actionParam = simulatedAction === 'AUTO' ? '' : simulatedAction;

    try {
      const res = await api.checkIn(phoneToUse, code, actionParam, 'Quét QR 1-chạm tại quầy');
      if (res.success) {
        setScanResult(res.data);
      }
    } catch (err) {
      setScanError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Mode Switcher (Mobile-First) */}
      <div className="bg-white rounded-3xl p-2 border border-coffee-200 shadow-sm flex items-center justify-between gap-2">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'scan'
              ? 'bg-gradient-to-r from-amber-600 to-coffee-800 text-white shadow-md'
              : 'text-coffee-700 hover:bg-coffee-100/60'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Điện Thoại Nhân Viên (Quét QR 1-Chạm)</span>
        </button>

        <button
          onClick={() => setActiveTab('counter')}
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'counter'
              ? 'bg-coffee-900 text-white shadow-md'
              : 'text-coffee-700 hover:bg-coffee-100/60'
          }`}
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>Màn Hình Quầy Thu Ngân (Mã QR Động)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: NHÂN VIÊN QUÉT MÃ QR (1-CHẠM TỰ ĐỘNG ĐIỀN SĐT) */}
      {/* ======================================================== */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Main Action Panel */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-coffee-200 shadow-xl space-y-6">
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Chấm Công Thông Minh Bằng Mã QR
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Tự động điền SĐT
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-coffee-950">
                Check-in / Check-out 1-Chạm
              </h2>
              <p className="text-xs text-coffee-600 mt-1">
                Hệ thống tự động nhận diện thiết bị và số điện thoại đã lưu của bạn để đối chiếu lịch ca làm việc.
              </p>
            </div>

            {/* Thông tin thiết bị & SĐT tự động điền */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  Số điện thoại nhân viên:
                </label>
                {rememberedPhone && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Đã lưu trên máy
                  </span>
                )}
              </div>

              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0912345678"
                className="w-full py-3 px-4 rounded-xl border border-coffee-300 font-mono text-base font-bold text-coffee-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-coffee-600">
                * Thiết bị này tự động ghi nhớ số điện thoại để bạn không cần gõ lại vào các ca sau.
              </p>
            </div>

            {/* Error Message */}
            {scanError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-tight font-medium">{scanError}</div>
              </div>
            )}

            {/* Action Buttons: 1-Touch Scan Simulation */}
            <div className="space-y-3">
              <button
                onClick={() => handlePerformCheckIn()}
                disabled={scanning}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-coffee-700 to-coffee-800 hover:from-amber-700 hover:to-coffee-900 text-white font-extrabold shadow-xl shadow-amber-950/20 active:scale-98 transition flex items-center justify-center gap-3 text-base disabled:opacity-60"
              >
                {scanning ? (
                  <RotateCw className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <QrCode className="w-6 h-6 text-amber-300" />
                    <span>Quét mã QR tại quầy (Xác nhận 1-Chạm)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-coffee-600 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="simAction"
                    value="AUTO"
                    checked={simulatedAction === 'AUTO'}
                    onChange={() => setSimulatedAction('AUTO')}
                    className="text-amber-600"
                  />
                  <span>Tự động phát hiện Vào / Ra ca</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="simAction"
                    value="CHECK_IN"
                    checked={simulatedAction === 'CHECK_IN'}
                    onChange={() => setSimulatedAction('CHECK_IN')}
                    className="text-amber-600"
                  />
                  <span>Vào ca</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="simAction"
                    value="CHECK_OUT"
                    checked={simulatedAction === 'CHECK_OUT'}
                    onChange={() => setSimulatedAction('CHECK_OUT')}
                    className="text-amber-600"
                  />
                  <span>Ra ca</span>
                </label>
              </div>
            </div>

          </div>

          {/* Result Card: Displayed right after scanning */}
          <div className="md:col-span-5">
            {scanResult ? (
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-xl space-y-4 animate-scale-up">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                    Ghi nhận chấm công thành công
                  </span>
                  <h3 className="text-xl font-extrabold text-coffee-950 mt-1">
                    {scanResult.checkOutTime ? 'ĐÃ CHECK-OUT RA CA' : 'ĐÃ CHECK-IN VÀO CA'}
                  </h3>
                  <p className="text-xs text-coffee-600 mt-0.5">
                    Nhân viên: <strong>{scanResult.user?.fullName}</strong> ({scanResult.user?.position})
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-coffee-50 border border-coffee-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Giờ vào ca:</span>
                    <strong className="font-mono text-coffee-900">
                      {scanResult.checkInTime ? new Date(scanResult.checkInTime).toLocaleTimeString('vi-VN') : '—'}
                    </strong>
                  </div>

                  {scanResult.checkOutTime && (
                    <div className="flex justify-between">
                      <span className="text-coffee-600">Giờ ra ca:</span>
                      <strong className="font-mono text-coffee-900">
                        {new Date(scanResult.checkOutTime).toLocaleTimeString('vi-VN')}
                      </strong>
                    </div>
                  )}

                  {scanResult.workHours > 0 && (
                    <div className="flex justify-between pt-1 border-t border-coffee-200">
                      <span className="text-coffee-600">Tổng giờ làm:</span>
                      <strong className="font-mono text-emerald-800 text-sm">
                        {scanResult.workHours} giờ
                      </strong>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-coffee-200">
                    <span className="text-coffee-600">Trạng thái:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      scanResult.status === 'ON_TIME'
                        ? 'bg-emerald-100 text-emerald-800'
                        : scanResult.status === 'LATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {scanResult.status === 'ON_TIME' ? 'Đúng giờ' : scanResult.status === 'LATE' ? 'Đi muộn' : scanResult.status}
                    </span>
                  </div>

                  {scanResult.notes && (
                    <div className="pt-2 text-coffee-600 text-[11px] italic bg-white p-2 rounded-xl border border-coffee-100">
                      {scanResult.notes}
                    </div>
                  )}
                </div>

                <div className="text-center text-[11px] text-coffee-500 font-mono">
                  Token: {scanResult.qrToken?.slice(0, 24)}...
                </div>
              </div>
            ) : (
              <div className="h-full bg-coffee-50/70 rounded-3xl p-6 border border-dashed border-coffee-300 flex flex-col items-center justify-center text-center text-coffee-600 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-coffee-400 shadow-sm border border-coffee-200">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-coffee-900 text-sm">Chưa có kết quả quét</div>
                  <p className="text-xs text-coffee-500 mt-1 max-w-xs">
                    Sau khi bấm nút xác nhận quét QR, kết quả giờ vào ca, trạng thái đúng giờ / đi muộn sẽ xuất hiện tại đây.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MÀN HÌNH MÃ QR ĐỘNG TẠI QUẦY THU NGÂN (TABLET)   */}
      {/* ======================================================== */}
      {activeTab === 'counter' && (
        <div className="bg-gradient-to-b from-coffee-950 via-coffee-900 to-coffee-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-coffee-800 text-center space-y-6 animate-fade-in relative overflow-hidden">
          
          {/* Header */}
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
              {counterQr?.shopName || 'The Rustic Bean Coffee'} • Quầy Thu Ngân
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Mã QR Điểm Danh Ca Làm Việc
            </h2>
            <p className="text-xs text-coffee-300 mt-1">
              Nhân viên mở app trên điện thoại và quét mã QR này để Check-in vào ca hoặc Check-out ra ca
            </p>
          </div>

          {/* Current Shift Badge & Real-time clock */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Coffee className="w-4 h-4" />
              {counterQr?.shiftName || 'Ca Hiện Tại'} ({counterQr?.shiftTime || '06:30 - 23:00'})
            </span>
            <span className="text-coffee-400">•</span>
            <span className="font-mono text-white flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              {currentTime.toLocaleTimeString('vi-VN')}
            </span>
          </div>

          {/* Dynamic QR Code Display */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-amber-500/10 border-4 border-amber-400 pulse-glow">
              {counterQr?.qrCodePayload ? (
                <QRCodeSVG
                  value={counterQr.qrCodePayload}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="w-60 h-60 flex items-center justify-center">
                  <RotateCw className="w-10 h-10 animate-spin text-coffee-700" />
                </div>
              )}
            </div>

            {/* Auto-refresh countdown bar */}
            <div className="w-72 mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-coffee-300 font-medium">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-amber-400" />
                  Mã đổi mới tự động
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  {Math.round((qrProgress / 100) * 30)}s
                </span>
              </div>
              <div className="w-full bg-coffee-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500 ease-linear"
                  style={{ width: `${qrProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-xs text-coffee-400 max-w-md mx-auto pt-2">
            * Mã QR có tính năng bảo mật động chống chụp ảnh trước. Mã được cấp mới tự động mỗi 30 giây.
          </div>

        </div>
      )}

    </div>
  );
}
