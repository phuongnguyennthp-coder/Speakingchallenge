import React, { useState } from 'react';
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  BookOpen,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  Music,
  Palette,
  Share2,
  Copy,
  HelpCircle,
  ExternalLink,
  Layers,
  Wand2,
  AlertTriangle,
} from 'lucide-react';
import { TeacherMaterial, MindmapBranch, ComprehensionQuestion, UsefulExpression, BackgroundThemeType } from '../types';
import { DEFAULT_UNITS } from '../data/defaultUnits';
import { aiGenerateUnitContent, hasValidApiKey } from '../utils/geminiClient';

interface TeacherSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMaterial: TeacherMaterial;
  onSaveMaterial: (material: TeacherMaterial) => void;
}

export const TeacherSetupModal: React.FC<TeacherSetupModalProps> = ({
  isOpen,
  onClose,
  currentMaterial,
  onSaveMaterial,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<TeacherMaterial>({ ...currentMaterial });
  const [activeTab, setActiveTab] = useState<
    'general' | 'video' | 'mindmap' | 'questions' | 'expressions' | 'background' | 'publish' | 'presets'
  >('general');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Generate short student URL and Heyzine Embed code
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const heyzineEmbedCode = `<iframe src="${studentUrl}&embed=true" width="100%" height="800" frameborder="0" allow="microphone; camera; autoplay; display-capture; fullscreen" style="border:none; border-radius:16px; width:100%; height:800px; max-width:100%;" allowfullscreen="true"></iframe>`;

  // Handle Video file upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        video: {
          ...prev.video,
          sourceType: 'upload',
          url,
          caption: `Video File: ${file.name}`,
        },
      }));
    }
  };

  // Handle Audio MP3 file upload
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        video: {
          ...prev.video,
          sourceType: 'mp3-upload',
          url,
          caption: `Audio MP3: ${file.name}`,
        },
      }));
    }
  };

  // Handle Mindmap Image file upload
  const handleMindmapFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm((prev) => ({
            ...prev,
            mindmap: {
              ...prev.mindmap,
              sourceType: 'upload',
              url: event.target!.result as string,
              title: `Mindmap: ${file.name}`,
            },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Background Image file upload from computer
  const handleBackgroundFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm((prev) => ({
            ...prev,
            backgroundType: 'upload',
            customBackgroundUrl: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle AI Auto-generate from Knowledge Content with model fallback & retry
  const handleAutoGenerateContent = async () => {
    const content = form.knowledgeContent || form.video.transcript;
    if (!content || content.trim().length < 10) {
      alert('Vui lòng nhập nội dung kiến thức bài giao hoặc transcript (tối thiểu 10 ký tự) để AI phân tích!');
      return;
    }

    if (!hasValidApiKey()) {
      setAiError('Chưa có Gemini API Key. Vui lòng bấm nút Settings (API Key) trên Header để nhập API key trước khi sử dụng AI.');
      return;
    }

    setIsGeneratingAI(true);
    setAiMessage(null);
    setAiError(null);

    try {
      // Client-side engine with automatic fallback: gemini-3-flash-preview -> gemini-3-pro-preview -> gemini-2.5-flash
      const gen = await aiGenerateUnitContent(content, form.unitNumber, form.unitTitle);
      if (gen) {
        setForm((prev) => ({
          ...prev,
          section1Questions: gen.section1Questions || prev.section1Questions,
          mindmap: {
            ...prev.mindmap,
            title: gen.mindmapBranches ? `Mindmap: ${form.unitTitle}` : prev.mindmap.title,
            branches: gen.mindmapBranches || prev.mindmap.branches,
          },
          section2Questions: gen.section2Questions || prev.section2Questions,
          usefulExpressions: gen.usefulExpressions || prev.usefulExpressions,
          practiceLevels: gen.practiceLevels || prev.practiceLevels,
          modelAnswer: gen.modelAnswer || prev.modelAnswer,
        }));
        setAiMessage('✨ AI đã tự động tạo xong toàn bộ nội dung bài học bám sát 100% học liệu!');
      } else {
        throw new Error('AI không trả về cấu trúc nội dung hợp lệ.');
      }
    } catch (err: any) {
      console.error('Error calling AI generation:', err);
      // Strictly follow AI_INSTRUCTIONS.md: show exact raw error and "Đã dừng do lỗi"
      const rawMsg = err?.message || 'Lỗi không xác định khi kết nối AI';
      setAiError(rawMsg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyPreset = (index: number) => {
    const selected = DEFAULT_UNITS[index];
    if (selected) {
      setForm({ ...selected });
      setAiMessage(`Đã tải dữ liệu mẫu: ${selected.unitNumber} - ${selected.unitTitle}!`);
      setTimeout(() => setAiMessage(null), 3000);
    }
  };

  const handleSave = () => {
    onSaveMaterial(form);
    onClose();
  };

  // Branch updates
  const handleUpdateBranch = (idx: number, field: keyof MindmapBranch, value: any) => {
    const updatedBranches = [...form.mindmap.branches];
    updatedBranches[idx] = {
      ...updatedBranches[idx],
      [field]: value,
    };
    setForm((prev) => ({
      ...prev,
      mindmap: {
        ...prev.mindmap,
        branches: updatedBranches,
      },
    }));
  };

  // Section 1 Question updates
  const handleAddS1Question = () => {
    const newQ: ComprehensionQuestion = {
      id: `s1_q_${Date.now()}`,
      question: 'New question about the video / audio?',
      expectedHint: 'Key hint from material',
      exampleAnswer: 'Sample answer',
    };
    setForm((prev) => ({
      ...prev,
      section1Questions: [...prev.section1Questions, newQ],
    }));
  };

  const handleUpdateS1Question = (idx: number, field: keyof ComprehensionQuestion, value: string) => {
    const updated = [...form.section1Questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm((prev) => ({ ...prev, section1Questions: updated }));
  };

  const handleDeleteS1Question = (idx: number) => {
    const updated = form.section1Questions.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, section1Questions: updated }));
  };

  // Section 2 Question updates
  const handleAddS2Question = () => {
    const newQ: ComprehensionQuestion = {
      id: `s2_q_${Date.now()}`,
      question: 'What information do you see in the mindmap?',
      expectedHint: 'Hint from mindmap branches',
      exampleAnswer: 'Sample answer',
    };
    setForm((prev) => ({
      ...prev,
      section2Questions: [...prev.section2Questions, newQ],
    }));
  };

  const handleUpdateS2Question = (idx: number, field: keyof ComprehensionQuestion, value: string) => {
    const updated = [...form.section2Questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm((prev) => ({ ...prev, section2Questions: updated }));
  };

  const handleDeleteS2Question = (idx: number) => {
    const updated = form.section2Questions.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, section2Questions: updated }));
  };

  // Expressions updates
  const handleAddExpression = () => {
    const newExp: UsefulExpression = {
      id: `exp_${Date.now()}`,
      english: 'New useful sentence...',
      vietnameseGuide: 'Hướng dẫn tiếng Việt...',
      category: 'General',
    };
    setForm((prev) => ({
      ...prev,
      usefulExpressions: [...prev.usefulExpressions, newExp],
    }));
  };

  const handleUpdateExpression = (idx: number, field: keyof UsefulExpression, value: any) => {
    const updated = [...form.usefulExpressions];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm((prev) => ({ ...prev, usefulExpressions: updated }));
  };

  const handleDeleteExpression = (idx: number) => {
    const updated = form.usefulExpressions.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, usefulExpressions: updated }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border-4 border-purple-200 overflow-hidden font-['Nunito',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black font-heading tracking-wide">
                  Teacher Materials & Setup Area
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/80 text-[10px] font-black uppercase text-white">
                  Designed by Tím
                </span>
              </div>
              <p className="text-xs text-purple-100 font-semibold">
                Quản lý Unit, Upload Video/MP3, Mindmap, Sinh câu hỏi AI bám sát học liệu & Xuất bản Heyzine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1.5 text-xs font-bold overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Unit & Học Liệu
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>2. Video / MP3</span>
          </button>

          <button
            onClick={() => setActiveTab('mindmap')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mindmap'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>3. Mindmap</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. Câu Hỏi</span>
          </button>

          <button
            onClick={() => setActiveTab('expressions')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'expressions'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>5. Expressions & Bài Mẫu</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'background'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-pink-500" />
            <span>6. Đổi Background</span>
          </button>

          <button
            onClick={() => setActiveTab('publish')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'publish'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-emerald-600 font-extrabold hover:text-emerald-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>7. Xuất Bản & Heyzine</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-amber-700 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Presets SGK</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {aiMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{aiMessage}</span>
            </div>
          )}

          {/* AI Error Display complying strictly with AI_INSTRUCTIONS.md */}
          {aiError && (
            <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-2xl p-4 text-xs font-bold space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Trạng thái: Đã dừng do lỗi</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-200 font-mono text-[11px] break-all text-rose-700">
                {aiError}
              </div>
              <p className="text-[11px] text-slate-600 font-semibold">
                💡 Nếu gặp lỗi <code className="font-mono text-rose-600 font-bold">429 RESOURCE_EXHAUSTED</code> (hết hạn mức) hoặc lỗi API key, vui lòng nhấp vào nút <strong>Settings (API Key)</strong> trên Header để nhập key mới hoặc chọn model khác.
              </p>
            </div>
          )}

          {/* TAB 1: GENERAL & KNOWLEDGE GROUNDING */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit ID (Dùng cho đường dẫn rút gọn)
                  </label>
                  <input
                    type="text"
                    value={form.id || ''}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="ví dụ: unit-5, unit-8..."
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit Number (Số thứ tự bài)
                  </label>
                  <input
                    type="text"
                    value={form.unitNumber}
                    onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                    placeholder="e.g. Unit 5"
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Unit Title (Tiêu đề bài học)
                </label>
                <input
                  type="text"
                  value={form.unitTitle}
                  onChange={(e) => setForm({ ...form, unitTitle: e.target.value })}
                  placeholder="e.g. What Would You Like to Be in the Future?"
                  className="w-full text-sm font-bold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Thông tin Giáo trình & Sách giáo khoa
                </label>
                <input
                  type="text"
                  value={form.curriculumInfo}
                  onChange={(e) => setForm({ ...form, curriculumInfo: e.target.value })}
                  className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                />
              </div>

              {/* NỘI DUNG KIẾN THỨC BÀI GIAO & NÚT AI TỰ ĐỘNG TẠO BÀI */}
              <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-3xl p-4 sm:p-5 border-2 border-purple-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Nội Dung Kiến Thức Bài Giao (Học liệu chính)</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                      * Dán transcript video/mp3, bài đọc SGK, từ vựng hoặc ghi chú bài học vào đây. AI sẽ căn cứ đúng vào học liệu này để tự tạo câu hỏi!
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={handleAutoGenerateContent}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGeneratingAI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AI đang phân tích & sinh bài...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-amber-300" />
                        <span>🪄 AI Tự Động Tạo Bài Học Từ Học Liệu</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={form.knowledgeContent || form.video.transcript || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      knowledgeContent: e.target.value,
                      video: { ...form.video, transcript: e.target.value },
                    })
                  }
                  rows={5}
                  className="w-full text-xs font-medium p-3.5 rounded-2xl border border-purple-300 focus:outline-purple-500 bg-white"
                  placeholder="Dán nội dung bài học, transcript hoặc danh sách từ vựng/mẫu câu vào đây..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO / MP3 / LINK */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-semibold">
                🎥 Section 1: Hỗ trợ đa dạng phương tiện giao bài: Video File, Audio MP3 File, YouTube, Google Drive hoặc Link trực tuyến.
              </div>

              {/* Source type selector */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { type: 'upload', label: 'Video File', icon: Video },
                  { type: 'mp3-upload', label: 'MP3 Audio File', icon: Music },
                  { type: 'youtube', label: 'YouTube Link', icon: LinkIcon },
                  { type: 'drive', label: 'Google Drive', icon: LinkIcon },
                  { type: 'mp3-url', label: 'Link MP3 / Web', icon: LinkIcon },
                ].map((s) => (
                  <button
                    key={s.type}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        video: { ...p.video, sourceType: s.type as any },
                      }))
                    }
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer ${
                      form.video.sourceType === s.type
                        ? 'bg-purple-100 border-purple-500 text-purple-900 ring-2 ring-purple-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <s.icon className="w-5 h-5 text-purple-600" />
                    <span className="text-center">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Upload Video File */}
              {form.video.sourceType === 'upload' && (
                <div className="border-2 border-dashed border-purple-300 rounded-3xl p-6 text-center bg-purple-50/40">
                  <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-2">Chọn file Video từ máy tính (MP4, WebM)</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                  />
                  {form.video.url && (
                    <p className="text-xs text-emerald-700 font-bold mt-2">✅ Video ready: {form.video.caption}</p>
                  )}
                </div>
              )}

              {/* Upload MP3 File */}
              {form.video.sourceType === 'mp3-upload' && (
                <div className="border-2 border-dashed border-pink-300 rounded-3xl p-6 text-center bg-pink-50/40">
                  <Music className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-2">Chọn file Audio / MP3 từ máy tính (MP3, WAV, M4A)</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                    className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer"
                  />
                  {form.video.url && (
                    <p className="text-xs text-emerald-700 font-bold mt-2">✅ MP3 ready: {form.video.caption}</p>
                  )}
                </div>
              )}

              {/* URL input for YouTube / Drive / MP3 link */}
              {['youtube', 'drive', 'mp3-url', 'link', 'sample'].includes(form.video.sourceType) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {form.video.sourceType === 'youtube'
                      ? 'Đường dẫn YouTube'
                      : form.video.sourceType === 'drive'
                      ? 'Link Google Drive'
                      : 'Đường dẫn MP3 / Video Link'}
                  </label>
                  <input
                    type="url"
                    value={form.video.url}
                    onChange={(e) => setForm({ ...form, video: { ...form.video, url: e.target.value } })}
                    placeholder="https://..."
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chú thích Video / Audio (Caption)
                </label>
                <input
                  type="text"
                  value={form.video.caption}
                  onChange={(e) => setForm({ ...form, video: { ...form.video, caption: e.target.value } })}
                  placeholder="e.g. Model Speaking Video: Minh talking about future jobs"
                  className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MINDMAP */}
          {activeTab === 'mindmap' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 font-semibold">
                🧠 Section 2: Hỗ trợ đa dạng phương tiện Mindmap: Hình ảnh (PNG/JPG), Video Mindmap, Link nhúng (Canva, Coggle), hoặc Sơ đồ tương tác.
              </div>

              {/* Source types */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { type: 'diagram', label: 'Interactive SVG' },
                  { type: 'upload', label: 'Tải Ảnh Lên' },
                  { type: 'youtube', label: 'YouTube Video' },
                  { type: 'drive', label: 'Google Drive' },
                  { type: 'link', label: 'Link Nhúng Web' },
                ].map((s) => (
                  <button
                    key={s.type}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        mindmap: { ...p.mindmap, sourceType: s.type as any },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      form.mindmap.sourceType === s.type
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Upload image file */}
              {form.mindmap.sourceType === 'upload' && (
                <div className="border-2 border-dashed border-emerald-300 rounded-3xl p-5 text-center bg-emerald-50/40">
                  <ImageIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-2">Tải ảnh Mindmap từ máy tính (PNG, JPG, SVG)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMindmapFileUpload}
                    className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  {form.mindmap.url && (
                    <div className="mt-3">
                      <img
                        src={form.mindmap.url}
                        alt="Mindmap preview"
                        className="max-h-36 mx-auto rounded-xl border border-emerald-300 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {['youtube', 'drive', 'link'].includes(form.mindmap.sourceType) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Đường dẫn Mindmap (YouTube / Drive / Web link)
                  </label>
                  <input
                    type="url"
                    value={form.mindmap.url}
                    onChange={(e) => setForm({ ...form, mindmap: { ...form.mindmap, url: e.target.value } })}
                    placeholder="https://..."
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 focus:outline-emerald-500 bg-slate-50"
                  />
                </div>
              )}

              {/* Branches Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-slate-700">Các Nhánh Mindmap & Giải thích</h3>
                  <span className="text-[11px] text-slate-500">* Bám sát 100% học liệu</span>
                </div>

                {form.mindmap.branches.map((b, idx) => (
                  <div key={b.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={b.title}
                        onChange={(e) => handleUpdateBranch(idx, 'title', e.target.value)}
                        placeholder="Tiêu đề nhánh..."
                        className="flex-1 text-xs font-bold p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                        Từ khóa / Ý chính trong nhánh:
                      </label>
                      <input
                        type="text"
                        value={b.items.join(', ')}
                        onChange={(e) =>
                          handleUpdateBranch(
                            idx,
                            'items',
                            e.target.value.split(',').map((s) => s.trim())
                          )
                        }
                        placeholder="Phân cách bằng dấu phẩy..."
                        className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                        Giải thích ngắn gọn cho nhánh:
                      </label>
                      <textarea
                        value={b.simpleExplanation}
                        onChange={(e) => handleUpdateBranch(idx, 'simpleExplanation', e.target.value)}
                        rows={2}
                        className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUESTIONS MANAGER (SECTION 1 & SECTION 2) */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* SECTION 1 QUESTIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-pink-700 bg-pink-100 px-3 py-1 rounded-xl">
                    Câu hỏi Section 1 (Nghe hiểu Video / MP3)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddS1Question}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Câu Hỏi</span>
                  </button>
                </div>

                {form.section1Questions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateS1Question(idx, 'question', e.target.value)}
                        placeholder="Nội dung câu hỏi..."
                        className="flex-1 text-xs font-bold p-2 rounded-xl border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteS1Question(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Gợi ý (Hint):</label>
                        <input
                          type="text"
                          value={q.expectedHint}
                          onChange={(e) => handleUpdateS1Question(idx, 'expectedHint', e.target.value)}
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Câu trả lời mẫu:</label>
                        <input
                          type="text"
                          value={q.exampleAnswer}
                          onChange={(e) => handleUpdateS1Question(idx, 'exampleAnswer', e.target.value)}
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 2 QUESTIONS */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                    Câu hỏi Section 2 (Khám phá Mindmap)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddS2Question}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Câu Hỏi</span>
                  </button>
                </div>

                {form.section2Questions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateS2Question(idx, 'question', e.target.value)}
                        placeholder="Nội dung câu hỏi mindmap..."
                        className="flex-1 text-xs font-bold p-2 rounded-xl border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteS2Question(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Gợi ý:</label>
                        <input
                          type="text"
                          value={q.expectedHint}
                          onChange={(e) => handleUpdateS2Question(idx, 'expectedHint', e.target.value)}
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Câu trả lời mẫu:</label>
                        <input
                          type="text"
                          value={q.exampleAnswer}
                          onChange={(e) => handleUpdateS2Question(idx, 'exampleAnswer', e.target.value)}
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EXPRESSIONS & MODEL ANSWER */}
          {activeTab === 'expressions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-purple-800 bg-purple-100 px-3 py-1 rounded-xl">
                  Speaking Toolbox (Các mẫu câu biểu đạt)
                </h3>
                <button
                  type="button"
                  onClick={handleAddExpression}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Mẫu Câu</span>
                </button>
              </div>

              <div className="space-y-2">
                {form.usefulExpressions.map((exp, idx) => (
                  <div key={exp.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={exp.english}
                      onChange={(e) => handleUpdateExpression(idx, 'english', e.target.value)}
                      placeholder="Câu tiếng Anh..."
                      className="flex-1 text-xs font-bold p-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={exp.vietnameseGuide || ''}
                      onChange={(e) => handleUpdateExpression(idx, 'vietnameseGuide', e.target.value)}
                      placeholder="Nghĩa tiếng Việt..."
                      className="flex-1 text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExpression(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Model Answer Editor */}
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bài Nói Mẫu (One Model Answer Paragraph - 4-5 câu chuẩn)
                </label>
                <textarea
                  value={form.modelAnswer}
                  onChange={(e) => setForm({ ...form, modelAnswer: e.target.value })}
                  rows={4}
                  className="w-full text-xs font-medium p-3.5 rounded-2xl border border-amber-300 focus:outline-amber-500 bg-amber-50/30"
                />
              </div>
            </div>
          )}

          {/* TAB 6: BACKGROUND CUSTOMIZER (UPLOAD TỪ MÁY TÍNH & THEMES) */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3 text-xs text-pink-900 font-semibold">
                🎨 Quyền giáo viên: Tải ảnh từ máy tính hoặc chọn theme màu pastel cho giao diện bài học của học sinh.
              </div>

              {/* Upload image from computer */}
              <div className="border-2 border-dashed border-pink-300 rounded-3xl p-6 text-center bg-pink-50/40">
                <Upload className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  Tải Ảnh Nền từ máy tính của bạn (JPG, PNG, WebP)
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Ảnh sẽ được tự động phủ lớp nền trong mờ tinh tế giúp chữ và câu hỏi luôn hiển thị rõ ràng.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundFileUpload}
                  className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer"
                />

                {form.backgroundType === 'upload' && form.customBackgroundUrl && (
                  <div className="mt-4 p-3 bg-white rounded-2xl border border-pink-200 inline-block shadow-sm">
                    <p className="text-xs text-emerald-700 font-bold mb-2">✅ Đang áp dụng ảnh nền tùy chỉnh:</p>
                    <img
                      src={form.customBackgroundUrl}
                      alt="Custom background preview"
                      className="max-h-36 rounded-xl mx-auto border border-pink-200 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          backgroundType: 'preset',
                          customBackgroundUrl: undefined,
                        }))
                      }
                      className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer underline"
                    >
                      Xóa ảnh nền, dùng lại màu mặc định
                    </button>
                  </div>
                )}
              </div>

              {/* Built-in Pastel Color Themes */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Hoặc chọn Theme màu Pastel có sẵn:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'default', name: 'Default Sunset', color: 'from-amber-50 via-sky-50 to-pink-50' },
                    { id: 'sky', name: 'Pastel Sky', color: 'from-sky-100 via-cyan-50 to-blue-100' },
                    { id: 'peach', name: 'Warm Peach', color: 'from-orange-100 via-amber-50 to-rose-100' },
                    { id: 'mint', name: 'Mint Emerald', color: 'from-emerald-100 via-teal-50 to-green-100' },
                    { id: 'lavender', name: 'Lavender Magic', color: 'from-purple-100 via-indigo-50 to-pink-100' },
                    { id: 'pink', name: 'Sweet Pink', color: 'from-pink-100 via-rose-50 to-amber-50' },
                    { id: 'starry', name: 'Starry Dream', color: 'from-slate-100 via-indigo-50 to-purple-100' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          backgroundType: 'preset',
                          backgroundTheme: t.id as BackgroundThemeType,
                          customBackgroundUrl: undefined,
                        }))
                      }
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer bg-gradient-to-br ${t.color} ${
                        form.backgroundType === 'preset' && form.backgroundTheme === t.id
                          ? 'border-purple-600 ring-2 ring-purple-300 shadow-sm scale-105'
                          : 'border-slate-200 hover:border-purple-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-slate-800">{t.name}</span>
                        {form.backgroundType === 'preset' && form.backgroundTheme === t.id && (
                          <Check className="w-3.5 h-3.5 text-purple-700" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">Theme màu cho học sinh</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PUBLISH & HEYZINE EMBED */}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-5 text-emerald-950 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black font-heading">
                      Xuất Bản & Lấy Link Giao Bài Theo Từng Unit
                    </h3>
                    <p className="text-xs font-semibold text-emerald-800">
                      Học sinh mở link này sẽ KHÔNG thấy giao diện của giáo viên và chỉ làm đúng Unit được giao!
                    </p>
                  </div>
                </div>

                {/* 1. Short student URL */}
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 space-y-1.5 shadow-xs">
                  <span className="text-xs font-bold text-slate-700 block">
                    🔗 Đường dẫn rút gọn gửi cho học sinh:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={studentUrl}
                      className="flex-1 text-xs font-semibold text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(studentUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Đã Copy!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Heyzine Embed Code */}
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 block">
                      📖 Mã Nhúng Heyzine Flipbook (iFrame):
                    </span>
                    <span className="text-[11px] text-purple-700 font-black">
                      * Nhúng trực tiếp vào sách lật Heyzine
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <textarea
                      readOnly
                      rows={2}
                      value={heyzineEmbedCode}
                      className="flex-1 text-xs font-medium text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(heyzineEmbedCode);
                        setCopiedEmbed(true);
                        setTimeout(() => setCopiedEmbed(false), 2000);
                      }}
                      className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedEmbed ? 'Đã Copy!' : 'Copy Mã Nhúng'}</span>
                    </button>
                  </div>
                </div>

                {/* Heyzine Guide */}
                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
                  <p className="font-bold">💡 Hướng dẫn dán vào Heyzine:</p>
                  <p>1. Trong Heyzine Editor, chọn thêm tiện ích <strong>Web/Iframe</strong> hoặc <strong>Link</strong>.</p>
                  <p>2. Dán link học sinh hoặc mã nhúng iframe ở trên vào.</p>
                  <p>3. Khi bạn chỉnh sửa nội dung bài tại đây và nhấn "Lưu", Heyzine sẽ tự động cập nhật ngay lập tức!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">
                Chọn bài học mẫu chuẩn Tiếng Anh 5 Global Success với đầy đủ Video, Mindmap, Câu hỏi và Bài mẫu:
              </p>
              {DEFAULT_UNITS.map((unit, idx) => (
                <div
                  key={unit.id || unit.unitNumber}
                  className="bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-amber-400 transition-all"
                >
                  <div>
                    <span className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-lg mr-2">
                      {unit.unitNumber}
                    </span>
                    <span className="font-extrabold text-sm text-slate-800">{unit.unitTitle}</span>
                    <p className="text-xs text-slate-500 mt-1">
                      {unit.curriculumInfo} • {unit.mindmap.branches.length} Mindmap Branches
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(idx)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    Tải Bài Này
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-purple-700">
            Unit đang soạn: <strong>{form.unitNumber}</strong> - {form.unitTitle}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-200 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu & Cập Nhật Bài Học</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
