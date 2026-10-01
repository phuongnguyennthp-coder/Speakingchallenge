import React, { useState, useEffect } from 'react';
import {
  Key,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import {
  GEMINI_MODEL_LIST,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
} from '../utils/geminiClient';
import { sounds } from '../utils/soundEffects';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
  isMandatory?: boolean; // When opened automatically because no key exists
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  isMandatory = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestStatus('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();

    if (!cleanKey) {
      setErrorMessage('Vui lòng nhập Gemini API Key của bạn để tiếp tục.');
      setTestStatus('error');
      return;
    }

    setTestStatus('testing');
    setErrorMessage(null);

    try {
      // Test key by sending a tiny test ping to Google AI Studio
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${cleanKey}`;
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const rawMessage =
          errorData?.error?.message || `Lỗi kết nối API (HTTP ${res.status})`;
        throw new Error(rawMessage);
      }

      // Success!
      setStoredApiKey(cleanKey);
      setStoredModel(selectedModel);
      setTestStatus('success');
      sounds.playCelebrationFanfare();

      setTimeout(() => {
        if (onKeySaved) onKeySaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.warn('API Key test error:', err);
      setTestStatus('error');
      setErrorMessage(err?.message || 'API key không hợp lệ hoặc đã hết hạn mức.');
      sounds.playPraiseChime();
    }
  };

  const handleQuickSaveWithoutTest = () => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setErrorMessage('Vui lòng nhập API Key.');
      return;
    }
    setStoredApiKey(cleanKey);
    setStoredModel(selectedModel);
    sounds.playPraiseChime();
    if (onKeySaved) onKeySaved();
    onClose();
  };

  const handleClearKey = () => {
    if (confirm('Bạn có chắc chắn muốn xóa API Key hiện tại khỏi trình duyệt?')) {
      setStoredApiKey('');
      setApiKey('');
      setTestStatus('idle');
      setErrorMessage(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://aistudio.google.com/api-keys');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in font-['Nunito',sans-serif]">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-purple-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-sm">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-lg">
                  AI Configuration
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-pink-500 px-2 py-0.5 rounded-lg">
                  Designed by Tím
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-heading">
                Thiết Lập Model AI & Gemini API Key
              </h2>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Guide Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-pink-50 rounded-2xl p-4 border border-amber-300/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Chưa có Gemini API Key? Lấy miễn phí tại Google AI Studio</span>
              </span>

              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black shadow-xs transition-all active:scale-95"
              >
                <span>Mở AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              Truy cập{' '}
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-purple-700 font-bold underline hover:text-purple-900"
              >
                https://aistudio.google.com/api-keys
              </a>
              , đăng nhập tài khoản Google và bấm <strong>"Create API key"</strong>. Sao chép và dán vào ô bên dưới.
            </p>

            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[11px] font-bold text-slate-500 hover:text-purple-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã copy đường dẫn!' : 'Copy link: https://aistudio.google.com/api-keys'}</span>
            </button>
          </div>

          <form onSubmit={handleTestAndSave} className="space-y-5">
            {/* API Key Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-purple-600" />
                  <span>Google Gemini API Key (*)</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Lưu trữ cục bộ an toàn trên trình duyệt của bạn (localStorage)
                </span>
              </label>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  placeholder="Dán API Key bắt đầu bằng AIzaSy..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus('idle');
                    setErrorMessage(null);
                  }}
                  className="w-full pl-4 pr-24 py-3 bg-white border-2 border-purple-200 focus:border-purple-600 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 outline-none shadow-xs font-mono"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg transition-colors cursor-pointer"
                    title={showKey ? 'Ẩn key' : 'Hiện key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {apiKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="px-2 py-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Model Selection Cards (as required in AI_INSTRUCTIONS.md) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Chọn Model AI Mặc Định</span>
                </label>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                  Tự động chuyển đổi nếu quá tải
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {GEMINI_MODEL_LIST.map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-200 shadow-md scale-102'
                          : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${model.badgeColor}`}
                          >
                            {model.badge}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 font-heading">
                          {model.name}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                          {model.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fallback & Retry Info Note */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-slate-600 font-medium flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cơ chế Tự Động Retry & Fallback:</strong> Nếu model hiện tại gặp lỗi API (như{' '}
                <code className="text-rose-600 font-mono text-[11px] font-bold">429 RESOURCE_EXHAUSTED</code>
                ), hệ thống sẽ <strong>tự động chuyển ngay</strong> sang model tiếp theo trong chuỗi:{' '}
                <em>gemini-3-flash-preview ➔ gemini-3-pro-preview ➔ gemini-2.5-flash</em>.
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3.5 text-rose-700 text-xs font-bold flex items-start gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>Lỗi kết nối Gemini API:</span>
                  <div className="font-mono text-[11px] bg-white p-2 rounded-xl border border-rose-200 break-all text-rose-800">
                    {errorMessage}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message Display */}
            {testStatus === 'success' && (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>API Key hợp lệ! Đã lưu cấu hình và kết nối thành công.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickSaveWithoutTest}
                className="text-xs font-bold text-slate-600 hover:text-purple-700 underline cursor-pointer"
              >
                Lưu nhanh không kiểm tra
              </button>

              <div className="flex items-center gap-2">
                {!isMandatory && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Đóng
                  </button>
                )}

                <button
                  type="submit"
                  disabled={testStatus === 'testing'}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-200 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  {testStatus === 'testing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang Kiểm Tra Key...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kiểm Tra & Lưu Cấu Hình</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>API Key được lưu riêng trên trình duyệt, không chia sẻ lên GitHub.</span>
          <span className="font-bold text-pink-600">Designed by Tím</span>
        </div>
      </div>
    </div>
  );
};
