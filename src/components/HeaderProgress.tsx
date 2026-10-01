import React from 'react';
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
} from 'lucide-react';

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

  React.useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-amber-100 px-3 sm:px-6 py-2.5 transition-all font-['Nunito',sans-serif]">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top row: App branding + Unit badge + Action buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Branding & Back to Dashboard */}
          <div className="flex items-center gap-2">
            {!isStudentMode && onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 transition-colors cursor-pointer mr-1"
                title="Quay lại danh sách Unit của Giáo viên"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-400 flex items-center justify-center text-white shadow-md shadow-pink-200 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Global Success 5
                </span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 shadow-2xs">
                  Designed by Tím
                </span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-800 flex items-center gap-1 font-heading">
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
          <div className="flex items-center gap-2">
            {/* Unit Pill */}
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border border-amber-200/80 rounded-2xl px-2.5 sm:px-3 py-1 shadow-xs flex items-center gap-1.5">
              <span className="bg-amber-500 text-white text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-lg shadow-xs">
                {unitNumber}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-[120px] sm:max-w-[200px]">
                {unitTitle}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              )}
            </button>

            {/* Fullscreen Toggle (Available for Students & Teachers) */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ (Thoát Fullscreen)' : 'Toàn Màn Hình (Fullscreen)'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
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
        <div className="bg-slate-50/80 rounded-2xl p-2 border border-slate-200/70">
          <div className="flex items-center justify-between mb-1.5 px-1 text-xs sm:text-sm font-black">
            <div className="flex items-center gap-2 text-indigo-700">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 border border-indigo-200 font-extrabold text-xs">
                Step {currentStep} / 6
              </span>
              <span className="text-slate-700 font-bold text-xs sm:text-sm hidden xs:inline">
                {STEP_NAMES[currentStep - 1].icon} {STEP_NAMES[currentStep - 1].name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <span>{percent}% Hoàn thành</span>
            </div>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-slate-200/90 h-2 sm:h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-emerald-400 via-pink-500 to-purple-600 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* 6 Step Buttons (Responsive Grid) */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2">
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
                  className={`relative flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 rounded-xl transition-all font-heading ${
                    isCurrent
                      ? 'bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 scale-[1.02] ring-2 ring-indigo-400 font-bold'
                      : isCompleted
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold cursor-pointer'
                      : isUnlocked
                      ? 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 font-medium cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-base leading-none">{step.icon}</span>
                    <span className="text-[10px] sm:text-xs font-black">
                      Step {step.num}
                    </span>
                    {isCompleted && !isCurrent && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 hidden md:inline" />
                    )}
                    {!isUnlocked && <Lock className="w-2.5 h-2.5 text-slate-400 hidden sm:inline" />}
                  </div>
                  <span className="text-[10px] sm:text-xs truncate max-w-full font-bold opacity-90 hidden sm:inline">
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
