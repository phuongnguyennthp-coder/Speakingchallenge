import React, { useState } from 'react';
import { Sparkles, User, GraduationCap, Award, ArrowRight, X, Mic } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface StudentWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTeacher?: string;
  defaultClass?: string;
  unitNumber: string;
  unitTitle: string;
  onSaveProfile: (name: string, studentClass: string, teacher: string) => void;
  onStartDirectChallenge?: () => void;
}

export const StudentWelcomeModal: React.FC<StudentWelcomeModalProps> = ({
  isOpen,
  onClose,
  defaultTeacher = 'Ms. Hồng Phượng',
  defaultClass = '5/1',
  unitNumber,
  unitTitle,
  onSaveProfile,
  onStartDirectChallenge,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(() => localStorage.getItem('esmart_student_name') || '');
  const [studentClass, setStudentClass] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const urlClass = p.get('class');
      if (urlClass) return urlClass;
    }
    return localStorage.getItem('esmart_student_class') || defaultClass;
  });

  const [teacher, setTeacher] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const urlTeacher = p.get('teacher');
      if (urlTeacher) return urlTeacher;
    }
    const saved = localStorage.getItem('esmart_student_teacher');
    if (saved) return saved;
    return defaultTeacher.includes('Thanh Thảo') ? 'Ms. Thanh Thảo' : 'Ms. Hồng Phượng';
  });

  const handleStart = (goToChallenge: boolean = false) => {
    const finalName = name.trim() || 'Học sinh';
    localStorage.setItem('esmart_student_name', finalName);
    localStorage.setItem('esmart_student_class', studentClass.trim() || '5/1');
    localStorage.setItem('esmart_student_teacher', teacher);

    try {
      sounds.playCelebrationFanfare();
    } catch (_) {}

    onSaveProfile(finalName, studentClass.trim() || '5/1', teacher);

    if (goToChallenge && onStartDirectChallenge) {
      onStartDirectChallenge();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-['Nunito',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border-4 border-purple-200 overflow-hidden transform animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 p-5 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-3xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner mb-2">
            👋
          </div>
          <h3 className="text-xl font-black font-heading">
            Chào Mừng Em Đến Với Bài Học!
          </h3>
          <p className="text-xs text-purple-100 font-semibold mt-1">
            {unitNumber}: {unitTitle}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 text-center font-semibold">
            Em hãy nhập tên để AI Buddy gọi tên em và chuẩn bị Thư khen sau khi hoàn thành nhé!
          </p>

          <div className="space-y-3.5">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Họ và tên của em</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Minh Anh / Hoàng Nam"
                className="w-full text-xs font-bold p-3 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none bg-slate-50 text-slate-800"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>Lớp</span>
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Ví dụ: 5/1 hoặc 5A1"
                className="w-full text-xs font-bold p-3 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none bg-slate-50 text-slate-800"
              />
            </div>

            {/* Teacher Selection: Ms. Hồng Phượng or Ms. Thanh Thảo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>Giáo viên phụ trách</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Ms. Hồng Phượng', label: 'Ms. Hồng Phượng' },
                  { id: 'Ms. Thanh Thảo', label: 'Ms. Thanh Thảo' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTeacher(t.id)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all border-2 cursor-pointer text-center ${
                      teacher === t.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => handleStart(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm shadow-lg shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>Bắt Đầu Luyện Nói Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onStartDirectChallenge && (
              <button
                type="button"
                onClick={() => handleStart(true)}
                className="w-full py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Mic className="w-3.5 h-3.5 text-amber-600" />
                <span>Vào Thẳng Bài Nói (Step 5 Speaking Challenge)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
