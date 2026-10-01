import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, X, CheckCircle2, KeyRound } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

const DEFAULT_PIN = '1234';

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  if (!isOpen) return null;

  const currentAdminPin = localStorage.getItem('teacher_admin_pin') || DEFAULT_PIN;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === currentAdminPin) {
      sounds.playCelebration();
      setError(null);
      setPin('');
      onUnlockSuccess();
    } else {
      sounds.playNegativeBeep();
      setError('Mã PIN không đúng! Vui lòng thử lại. (Mặc định: 1234)');
      setPin('');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setError('Mã PIN mới phải có ít nhất 4 ký tự!');
      return;
    }
    if (newPin !== confirmNewPin) {
      setError('Mã PIN nhập lại không khớp!');
      return;
    }

    localStorage.setItem('teacher_admin_pin', newPin);
    setChangeSuccess(true);
    setError(null);
    sounds.playPraiseChime();
    setTimeout(() => {
      setChangeSuccess(false);
      setIsChangingPin(false);
      setNewPin('');
      setConfirmNewPin('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in font-['Nunito',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border-4 border-purple-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-heading">
                Xác Thực Quyền Giáo Viên
              </h3>
              <p className="text-xs text-purple-200 font-semibold">
                Chỉ dành riêng cho Giáo viên / Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isChangingPin ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 mx-auto flex items-center justify-center mb-2 border border-purple-100">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-800">
                  Nhập mã PIN để về Trang Giáo Viên
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Học sinh không có mã PIN sẽ không thể truy cập giao diện quản trị bài học.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Mã PIN Giáo Viên
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError(null);
                    }}
                    placeholder="Nhập mã PIN (Mặc định: 1234)"
                    maxLength={10}
                    autoFocus
                    className="w-full text-center tracking-widest text-lg font-black p-3.5 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none bg-slate-50 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold mt-1 text-center">
                  💡 Gợi ý: Mã PIN mặc định hệ thống là <strong className="text-purple-600 font-bold">1234</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                >
                  Hủy / Tiếp Tục Học
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer active:scale-95"
                >
                  Xác Thực & Về Admin
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsChangingPin(true);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Đổi mã PIN Giáo viên mới</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePin} className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-slate-800">
                  Cài Đặt Mã PIN Mới
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Thiết lập mã PIN riêng để bảo vệ trang quản lý của bạn.
                </p>
              </div>

              {changeSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đổi mã PIN thành công!</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Mã PIN Mới (Tối thiểu 4 số)
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Nhập mã PIN mới..."
                    maxLength={10}
                    className="w-full text-center text-base font-bold p-3 rounded-2xl border border-slate-300 focus:border-purple-600 focus:outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Xác Nhận Mã PIN Mới
                  </label>
                  <input
                    type="password"
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="Nhập lại mã PIN mới..."
                    maxLength={10}
                    className="w-full text-center text-base font-bold p-3 rounded-2xl border border-slate-300 focus:border-purple-600 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsChangingPin(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Lưu Mã PIN Mới
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
