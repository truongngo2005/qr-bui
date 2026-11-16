import React from 'react';
import { Smartphone, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DeviceRememberModal() {
  const { showRememberModal, confirmRememberDevice, pendingPhone } = useAuth();

  if (!showRememberModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-coffee-200 transform transition-all animate-scale-up">
        {/* Header icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-inner mb-4">
          <Smartphone className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-center text-coffee-950 mb-2">
          Lưu số điện thoại trên máy này?
        </h3>

        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 mb-5 text-sm text-coffee-800 space-y-2">
          <p className="font-semibold text-amber-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Số điện thoại của bạn: <span className="font-mono text-base font-bold text-coffee-900">{pendingPhone}</span>
          </p>
          <p className="text-xs text-coffee-700 leading-relaxed">
            Sau này bạn chỉ cần <strong>1 chạm</strong> để đăng nhập nhanh và <strong>tự động điền số điện thoại</strong> khi mở màn hình Quét mã QR ca làm việc tại quầy!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => confirmRememberDevice(false)}
            className="w-full py-3 px-4 rounded-xl border border-coffee-300 font-semibold text-coffee-700 hover:bg-coffee-50 active:scale-98 transition flex items-center justify-center gap-1.5 text-sm"
          >
            <X className="w-4 h-4" />
            Không lưu
          </button>
          <button
            onClick={() => confirmRememberDevice(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-coffee-700 text-white font-semibold shadow-lg shadow-amber-900/20 hover:from-amber-700 hover:to-coffee-800 active:scale-98 transition flex items-center justify-center gap-1.5 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Đồng ý lưu máy
          </button>
        </div>
      </div>
    </div>
  );
}
