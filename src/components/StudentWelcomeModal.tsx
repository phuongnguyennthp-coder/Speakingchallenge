import React, { useState, useEffect } from 'react';
import { Sparkles, User, GraduationCap, Award, ArrowRight, X } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface StudentWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTeacher?: string;
  defaultClass?: string;
  unitNumber: string;
  unitTitle: string;
  onSaveProfile: (name: string, studentClass: string, teacher: string) => void;
}

export const StudentWelcomeModal: React.FC<StudentWelcomeModalProps> = ({
  isOpen,
  onClose,
  defaultTeacher = 'Ms. Hồng Phượng',
  defaultClass = '5A1',
  unitNumber,
  unitTitle,
  onSaveProfile,
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
    return localStorage.getItem('esmart_student_teacher') || defaultTeacher;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Học sinh';
    localStorage.setItem('esmart_student_name', finalName);
    localStorage.setItem('esmart_student_class', studentClass);
    localStorage.setItem('esmart_student_teacher', teacher);
    sounds.playCheerFanfare();
    onSaveProfile(finalName, studentClass, teacher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-['Nunito',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border-4 border-purple-200 overflow-hidden transform animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 p-5 text-white text-center relative">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 text-center font-semibold">
            Em hãy nhập tên để AI Buddy gọi tên em và chuẩn bị Thư khen sau khi hoàn thành nhé!
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Họ và tên của em</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Hoàng Nam"
                className="w-full text-xs font-bold p-3 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Lớp</span>
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="Ví dụ: 5A1"
                  className="w-full text-xs font-bold p-3 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>Giáo viên</span>
                </label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Ms. Hồng Phượng"
                  className="w-full text-xs font-bold p-3 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none bg-slate-50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm shadow-lg shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <span>Bắt Đầu Luyện Nói Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
