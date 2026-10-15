import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Play,
  Edit,
  Share2,
  Trash2,
  Sparkles,
  Video,
  Music,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Palette,
  FileText,
  Presentation,
  GraduationCap,
  Key,
  Lock,
} from 'lucide-react';
import { TeacherMaterial } from '../types';
import { exportUnitToWord, exportUnitToPowerPoint } from '../utils/exportDocs';

interface TeacherDashboardProps {
  units: TeacherMaterial[];
  onSelectUnit: (unit: TeacherMaterial, isStudentView: boolean) => void;
  onEditUnit: (unit: TeacherMaterial) => void;
  onCreateUnit: () => void;
  onDeleteUnit: (unitId: string) => void;
  onOpenSubmissions: (unitId?: string) => void;
  onOpenApiKeyModal?: () => void;
  onLockToStudentMode?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  units,
  onSelectUnit,
  onEditUnit,
  onCreateUnit,
  onDeleteUnit,
  onOpenSubmissions,
  onOpenApiKeyModal,
  onLockToStudentMode,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterTeacher, setFilterTeacher] = useState<string>('all');

  const ALL_DEFAULT_TEACHERS = ['Ms. Hồng Phượng', 'Ms. Thanh Thảo'];
  const uniqueTeachers = Array.from(
    new Set([...ALL_DEFAULT_TEACHERS, ...units.map((u) => u.teacherName).filter(Boolean)])
  ) as string[];

  const filteredUnits = units.filter(
    (u) => filterTeacher === 'all' || u.teacherName === filterTeacher
  );

  const getMediaBadge = (unit: TeacherMaterial) => {
    const sType = unit.video?.sourceType;
    if (sType === 'mp3-upload' || sType === 'mp3-url') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-pink-100 text-pink-800 text-xs font-bold">
          <Music className="w-3.5 h-3.5 text-pink-600" />
          <span>MP3 Audio</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold">
        <Video className="w-3.5 h-3.5 text-purple-600" />
        <span>Video ({sType || 'video'})</span>
      </span>
    );
  };

  const handleCopyStudentLink = (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = window.location.origin + window.location.pathname;
    const studentUrl = `${baseUrl}?unit=${unitId}&mode=student`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedId(unitId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-['Nunito',sans-serif] animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              Teacher Studio
            </span>
            <span className="px-3 py-1 rounded-full bg-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-xs">
              Designed by Ms Hồng Phượng
            </span>
            <span className="text-xs text-purple-200 font-bold hidden sm:inline">
              Global Success 5 (Curriculum 2018)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight">
            Quản Lý Bài Giao Nói Tiếng Anh Theo Từng Unit
          </h1>

          <p className="text-xs sm:text-sm text-purple-100 font-medium max-w-2xl leading-relaxed">
            Upload bài giao (Video/MP3/Mindmap), sử dụng AI tự sinh câu hỏi bám sát 100% học liệu, lấy link rút gọn hoặc mã nhúng Heyzine giao cho học sinh làm theo từng Unit!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 flex-wrap">
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              className="px-4 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              title="Thiết lập Gemini API Key"
            >
              <Key className="w-5 h-5 text-amber-300" />
              <span>Settings (API Key)</span>
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                Lấy API key để sử dụng app
              </span>
            </button>
          )}

          <button
            onClick={() => onOpenSubmissions()}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Quản Lý Bài Nộp & Thống Kê</span>
          </button>

          <button
            onClick={onCreateUnit}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-purple-50 text-purple-900 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 text-purple-700" />
            <span>Tạo Unit Mới</span>
          </button>

          {onLockToStudentMode && (
            <button
              onClick={onLockToStudentMode}
              className="px-4 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              title="Khóa quản trị và quay lại màn hình học sinh"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Về Giao Diện Học Sinh</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats, Guidance & Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-3xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            Hiện có <strong>{filteredUnits.length}</strong> {filterTeacher !== 'all' ? `(lọc từ ${units.length})` : ''} bài học Unit
          </span>

          {uniqueTeachers.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-500 font-semibold">Lọc Giáo Viên:</span>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-purple-900 outline-none focus:border-purple-600 cursor-pointer"
              >
                <option value="all">Tất cả Giáo Viên ({units.length})</option>
                {uniqueTeachers.map((t) => (
                  <option key={t} value={t}>
                    GV: {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-[11px]">
            🔒 Mã PIN Admin: <strong>1234</strong>
          </span>
          <span className="text-[11px] text-slate-500 hidden md:inline">
            💡 Để xóa Unit cũ hoặc thêm Unit mới, bấm nút tương ứng trên từng thẻ bài học.
          </span>
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUnits.map((unit) => {
          const isCopied = copiedId === unit.id;
          return (
            <div
              key={unit.id}
              className="bg-white rounded-3xl border-2 border-purple-100 shadow-md hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Unit Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-xl shadow-xs">
                    {unit.unitNumber}
                  </span>
                  {getMediaBadge(unit)}
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading group-hover:text-purple-700 transition-colors leading-snug">
                  {unit.unitTitle}
                </h3>

                {/* Teacher & Class badge */}
                {(unit.teacherName || unit.targetClass) && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 pt-0.5 flex-wrap">
                    {unit.teacherName && (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-purple-600" />
                        {unit.teacherName}
                      </span>
                    )}
                    {unit.targetClass && (
                      <span className="px-2 py-0.5 rounded-lg bg-pink-50 text-pink-700 border border-pink-200">
                        Lớp {unit.targetClass}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-500 font-semibold line-clamp-2">
                  {unit.knowledgeContent || unit.video?.transcript || unit.curriculumInfo}
                </p>

                {/* Details Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-bold text-slate-600">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100">
                    ❓ {unit.section1Questions?.length || 0} câu hỏi S1
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100">
                    🧠 {unit.mindmap?.branches?.length || 0} nhánh mindmap
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100">
                    💬 {unit.usefulExpressions?.length || 0} mẫu câu
                  </span>
                </div>
              </div>

              {/* Unit Card Actions */}
              <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex flex-col gap-2">
                {/* Primary Action: Giao Bài Theo Step */}
                <button
                  onClick={() => onEditUnit(unit)}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Giao nhiệm vụ học tập theo từng step (Video, Mindmap, Câu hỏi...)"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Giao Bài & Tải Học Liệu (Theo Step)</span>
                </button>

                {/* 1-Click Copy Student Link & Delete Unit */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCopyStudentLink(unit.id, e)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Copy Link HS!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Lấy Link / Heyzine</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn xóa bài học "${unit.unitNumber}: ${unit.unitTitle}" khỏi hệ thống không? Thao tác này không thể hoàn tác.`)) {
                        onDeleteUnit(unit.id);
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
                    title="Xóa bài học Unit này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Xóa Unit</span>
                  </button>
                </div>

                {/* View modes buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectUnit(unit, true)}
                    className="py-1.5 px-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-800 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all"
                    title="Xem đúng như học sinh thấy (Ẩn thanh công cụ)"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    <span>Xem Dạng Học Sinh</span>
                  </button>

                  <button
                    onClick={() => onSelectUnit(unit, false)}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                    title="Mở bài học với quyền giáo viên"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Chạy Bài Học (GV)</span>
                  </button>
                </div>

                {/* Educational Skill Documents Export Buttons (Word & PowerPoint) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                  <button
                    onClick={() => exportUnitToWord(unit)}
                    className="py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-blue-200"
                    title="Xuất phiếu bài tập học sinh (.doc)"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xuất Phiếu Word</span>
                  </button>

                  <button
                    onClick={() => exportUnitToPowerPoint(unit)}
                    className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-amber-200"
                    title="Xuất slide bài giảng trình chiếu (.ppt)"
                  >
                    <Presentation className="w-3.5 h-3.5 text-amber-600" />
                    <span>Xuất Slide PPT</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
