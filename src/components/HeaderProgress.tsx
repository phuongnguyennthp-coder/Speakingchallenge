import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Share2,
  Palette,
  Maximize,
  Minimize,
  Key,
  Globe,
} from 'lucide-react';
import { ACCENT_OPTIONS, SpeechAccent, speechService } from '../utils/speech';

interface HeaderProgressProps {
  currentStep: number;
  unlockedStep: number;
  onSelectStep: (step: number) => void;
  unitNumber: string;
  unitTitle: string;
  onOpenTeacherModal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isStudentMode?: boolean;
  onBackToDashboard?: () => void;
  onQuickShare?: () => void;
  onOpenApiKeyModal?: () => void;
  onRequestAdminLogin?: () => void;
}

const STEP_NAMES = [
  { num: 1, name: 'Video', icon: '🎥' },
  { num: 2, name: 'Mindmap', icon: '🧠' },
  { num: 3, name: 'Expressions', icon: '💬' },
  { num: 4, name: 'Practice', icon: '🤖' },
  { num: 5, name: 'Challenge', icon: '🎤' },
  { num: 6, name: 'Feedback', icon: '⭐' },
];

export const HeaderProgress: React.FC<HeaderProgressProps> = ({
  currentStep,
  unlockedStep,
  onSelectStep,
  unitNumber,
  unitTitle,
  onOpenTeacherModal,
  soundEnabled,
  onToggleSound,
  isStudentMode = false,
  onBackToDashboard,
  onQuickShare,
  onOpenApiKeyModal,
  onRequestAdminLogin,
}) => {
  const percent = Math.round((currentStep / 6) * 100);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [accent, setAccent] = useState<SpeechAccent>(() => speechService.getAccent());

  React.useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleCycleAccent = () => {
    const list: SpeechAccent[] = ['en-US', 'en-GB', 'en-AU'];
    const nextIdx = (list.indexOf(accent) + 1) % list.length;
    const next = list[nextIdx];
    setAccent(next);
    speechService.setAccent(next);
  };

  const currentAccentOpt = ACCENT_OPTIONS.find((a) => a.id === accent) || ACCENT_OPTIONS[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs border-b border-amber-100 px-3 sm:px-6 py-1.5 sm:py-2 transition-all font-['Nunito',sans-serif]">
      <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
        {/* Top row: App branding + Unit badge + Action buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Branding & Back to Dashboard */}
          <div className="flex items-center gap-2">
            {!isStudentMode && onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 transition-colors cursor-pointer mr-1"
                title="Quay lại danh sách Unit của Giáo viên"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-400 flex items-center justify-center text-white shadow-md shadow-pink-200 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Global Success 5
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 shadow-2xs">
                  Designed by Ms Hồng Phượng
                </span>
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-slate-800 flex items-center gap-1 font-heading">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  E-SMART ENGLISH KIDS
                </span>
                <span className="text-amber-500 hidden xs:inline">★</span>
                <span className="text-slate-500 text-xs font-bold hidden md:inline">
                  SPEAKING CHALLENGE
                </span>
              </h1>
            </div>
          </div>

          {/* Right: Unit badge & Teacher Controls / Sound */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Unit Pill */}
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border border-amber-200/80 rounded-2xl px-2.5 py-1 shadow-xs flex items-center gap-1.5">
              <span className="bg-amber-500 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-lg shadow-xs">
                {unitNumber}
              </span>
              <span className="text-xs font-bold text-slate-700 truncate max-w-[100px] sm:max-w-[180px]">
                {unitTitle}
              </span>
            </div>

            {/* Accent Selection: US / UK / AUS */}
            <button
              onClick={handleCycleAccent}
              title={`Giọng phát âm hiện tại: ${currentAccentOpt.label} (Bấm để chuyển đổi Mỹ, Anh, Úc)`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-purple-100 border border-slate-200 text-slate-700 hover:text-purple-900 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span className="text-sm leading-none">{currentAccentOpt.flag}</span>
              <span className="text-[11px] font-black">{currentAccentOpt.shortLabel}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Fullscreen Toggle (Available for Students & Teachers) */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ (Thoát Fullscreen)' : 'Toàn Màn Hình (Fullscreen)'}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-indigo-600" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>

            {/* Settings (API Key) Button - ALWAYS visible on Header per AI_INSTRUCTIONS.md */}
            {onOpenApiKeyModal && (
              <button
                onClick={onOpenApiKeyModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-700 shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Cấu hình Gemini API Key & Model AI"
              >
                <Key className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-xs font-black">Settings</span>
                <span className="text-[11px] font-black text-rose-600 animate-pulse hidden xs:inline">
                  • Lấy API key để sử dụng app
                </span>
              </button>
            )}

            {/* TEACHER-ONLY BUTTONS (COMPLETELY HIDDEN FOR STUDENTS) */}
            {!isStudentMode && (
              <div className="flex items-center gap-1.5">
                {onQuickShare && (
                  <button
                    onClick={onQuickShare}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Lấy link giao bài & mã nhúng Heyzine"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Giao Bài</span>
                  </button>
                )}

                {onOpenTeacherModal && (
                  <button
                    onClick={onOpenTeacherModal}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Chỉnh sửa bài học & Background"
                  >
                    <Settings className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden sm:inline">Sửa Bài</span>
                  </button>
                )}
              </div>
            )}

            {/* ADMIN ACCESS BUTTON FOR TEACHER ON STUDENT SCREEN (PROTECTED BY PIN) */}
            {isStudentMode && onRequestAdminLogin && (
              <button
                onClick={onRequestAdminLogin}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-900 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
                title="Dành cho Giáo viên quay lại trang quản trị (Cần mã PIN)"
              >
                <Lock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span className="hidden xs:inline">Dành Cho Giáo Viên</span>
                <span className="xs:hidden">Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Step Flow: Step 1 of 6 ... Step 6 of 6 */}
        <div className="bg-slate-50/90 rounded-xl p-1.5 border border-slate-200/70">
          <div className="flex items-center justify-between mb-1 px-1 text-xs font-black">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 border border-indigo-200 font-extrabold text-[11px]">
                Step {currentStep} / 6
              </span>
              <span className="text-slate-700 font-bold text-xs hidden xs:inline">
                {STEP_NAMES[currentStep - 1].icon} {STEP_NAMES[currentStep - 1].name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <span>{percent}% Hoàn thành</span>
            </div>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-slate-200/90 h-1.5 sm:h-2 rounded-full overflow-hidden mb-1.5">
            <div
              className="bg-gradient-to-r from-emerald-400 via-pink-500 to-purple-600 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* 6 Step Buttons (Responsive Grid) */}
          <div className="grid grid-cols-6 gap-1">
            {STEP_NAMES.map((step) => {
              const isCurrent = currentStep === step.num;
              const isCompleted = step.num < unlockedStep;
              const isUnlocked = step.num <= unlockedStep;

              return (
                <button
                  key={step.num}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectStep(step.num);
                    }
                  }}
                  className={`relative flex items-center justify-center gap-1 py-1 px-1 rounded-lg transition-all font-heading ${
                    isCurrent
                      ? 'bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-xs scale-[1.01] ring-1 ring-indigo-400 font-black'
                      : isCompleted
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold cursor-pointer'
                      : isUnlocked
                      ? 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 font-semibold cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="text-xs sm:text-sm leading-none">{step.icon}</span>
                  <span className="text-[10px] sm:text-[11px] font-black truncate">
                    Step {step.num}
                  </span>
                  <span className="text-[10px] sm:text-[11px] truncate font-bold opacity-90 hidden md:inline">
                    • {step.name}
                  </span>
                  {isCompleted && !isCurrent && (
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 hidden sm:inline shrink-0" />
                  )}
                  {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-400 hidden sm:inline shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
