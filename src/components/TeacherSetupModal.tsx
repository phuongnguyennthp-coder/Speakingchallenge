import React, { useState, useEffect } from 'react';
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
  KeyRound,
  ShieldCheck,
  Mic,
  MessageSquare,
  Award,
  Volume2,
  FileText,
  CheckCircle2,
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
    'general' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'background' | 'publish' | 'presets'
  >('general');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Sync form when currentMaterial or modal opens
  useEffect(() => {
    if (currentMaterial) {
      setForm({ ...currentMaterial });
      setAiMessage(null);
      setAiError(null);
    }
  }, [currentMaterial, isOpen]);

  // Generate short student URL and Heyzine Embed code (DEFINED SAFELY)
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const studentUrl = `${baseUrl}?unit=${form.id || 'unit-1'}&mode=student`;
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

  // Handle Mindmap Video file upload
  const handleMindmapVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        mindmap: {
          ...prev.mindmap,
          sourceType: 'video',
          url,
          title: `Mindmap Video: ${file.name}`,
        },
      }));
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
      const gen = await aiGenerateUnitContent(content, form.unitNumber, form.unitTitle);
      if (gen) {
        setForm((prev) => ({
          ...prev,
          unitTitle: gen.unitTitle || prev.unitTitle,
          mindmap: {
            ...prev.mindmap,
            branches: gen.mindmapBranches && gen.mindmapBranches.length > 0 ? gen.mindmapBranches : prev.mindmap.branches,
          },
          section1Questions:
            gen.section1Questions && gen.section1Questions.length > 0
              ? gen.section1Questions
              : prev.section1Questions,
          section2Questions:
            gen.section2Questions && gen.section2Questions.length > 0
              ? gen.section2Questions
              : prev.section2Questions,
          usefulExpressions:
            gen.usefulExpressions && gen.usefulExpressions.length > 0
              ? gen.usefulExpressions
              : prev.usefulExpressions,
          modelAnswer: gen.modelAnswer || prev.modelAnswer,
        }));
        setAiMessage('✨ AI đã tự động phân tích và cập nhật toàn bộ câu hỏi, mindmap, mẫu câu bám sát 100% học liệu!');
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      const errMsg = err?.message || String(err);
      setAiError(errMsg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyPreset = (index: number) => {
    const preset = DEFAULT_UNITS[index];
    if (preset) {
      setForm({
        ...preset,
        id: form.id || preset.id,
      });
      setAiMessage(`Đã tải mẫu SGK: ${preset.unitNumber} - ${preset.unitTitle}`);
    }
  };

  // Branch updates for Step 2
  const handleAddBranch = () => {
    const colors = ['emerald', 'blue', 'amber', 'purple', 'rose'];
    const newBranch: MindmapBranch = {
      id: `b_${Date.now()}`,
      title: 'New Branch Topic',
      color: colors[form.mindmap.branches.length % colors.length],
      iconName: 'BookOpen',
      items: ['Key idea 1', 'Key idea 2'],
      simpleExplanation: 'Short clear explanation for this branch.',
    };
    setForm((prev) => ({
      ...prev,
      mindmap: {
        ...prev.mindmap,
        branches: [...prev.mindmap.branches, newBranch],
      },
    }));
  };

  const handleUpdateBranch = (idx: number, field: keyof MindmapBranch, value: any) => {
    const updatedBranches = [...form.mindmap.branches];
    updatedBranches[idx] = { ...updatedBranches[idx], [field]: value };
    setForm((prev) => ({
      ...prev,
      mindmap: {
        ...prev.mindmap,
        branches: updatedBranches,
      },
    }));
  };

  const handleDeleteBranch = (idx: number) => {
    const updatedBranches = form.mindmap.branches.filter((_, i) => i !== idx);
    setForm((prev) => ({
      ...prev,
      mindmap: {
        ...prev.mindmap,
        branches: updatedBranches,
      },
    }));
  };

  // Section 1 Question updates (Step 1)
  const handleAddS1Question = () => {
    const newQ: ComprehensionQuestion = {
      id: `s1_q_${Date.now()}`,
      question: 'New question about the video / audio?',
      expectedHint: 'Key hint from material',
      exampleAnswer: 'Sample student answer',
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

  // Section 2 Question updates (Step 2)
  const handleAddS2Question = () => {
    const newQ: ComprehensionQuestion = {
      id: `s2_q_${Date.now()}`,
      question: 'What information do you see in the mindmap?',
      expectedHint: 'Look at the mindmap branches',
      exampleAnswer: 'I can see key ideas on the mindmap branches.',
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

  // Expressions updates (Step 3)
  const handleAddExpression = () => {
    const newExp: UsefulExpression = {
      id: `exp_${Date.now()}`,
      english: 'New useful sentence pattern...',
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

  // Save handler
  const handleSave = () => {
    onSaveMaterial(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-['Nunito',sans-serif]">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border-4 border-purple-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black font-heading tracking-wide">
                  Giao Nhiệm Vụ Học Tập Theo Từng Step
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-[10px] font-black uppercase text-white shadow-xs">
                  Designed by Tím
                </span>
              </div>
              <p className="text-xs text-purple-100 font-semibold">
                Soạn bài {form.unitNumber}: {form.unitTitle} • Học sinh làm theo đúng bài được giao
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu Nhanh</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Đóng / Quay lại Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Grouped by Steps) */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 text-xs font-bold overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>1. Unit & AI Trợ Giảng</span>
          </button>

          <button
            onClick={() => setActiveTab('step1')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'step1'
                ? 'bg-white text-pink-700 border-t-2 border-pink-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-pink-600" />
            <span>2. Step 1: Video/MP3 & Câu Hỏi</span>
          </button>

          <button
            onClick={() => setActiveTab('step2')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'step2'
                ? 'bg-white text-teal-700 border-t-2 border-teal-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>3. Step 2: Mindmap & Câu Hỏi</span>
          </button>

          <button
            onClick={() => setActiveTab('step3')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'step3'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>4. Step 3: Mẫu Câu</span>
          </button>

          <button
            onClick={() => setActiveTab('step4')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'step4'
                ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>5. Step 4: Hội Thoại AI</span>
          </button>

          <button
            onClick={() => setActiveTab('step5')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'step5'
                ? 'bg-white text-amber-700 border-t-2 border-amber-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>6. Step 5 & 6: Đề Bài & Rubric</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'background'
                ? 'bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-rose-500" />
            <span>7. Background & PIN</span>
          </button>

          <button
            onClick={() => setActiveTab('publish')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'publish'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-emerald-600 font-extrabold hover:text-emerald-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>8. Xuất Bản & Heyzine</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2.5 px-3 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-white text-amber-700 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Mẫu SGK</span>
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
                💡 Nếu gặp lỗi <code className="font-mono text-rose-600 font-bold">429 RESOURCE_EXHAUSTED</code> hoặc lỗi API key, vui lòng nhấp vào nút <strong>Settings (API Key)</strong> trên Header để nhập key mới.
              </p>
            </div>
          )}

          {/* TAB 1: UNIT & KNOWLEDGE GROUNDING */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mã Unit (ID rút gọn cho link chia sẻ)
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
                    Số thứ tự Unit
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
                  Tên Bài Học (Unit Title)
                </label>
                <input
                  type="text"
                  value={form.unitTitle}
                  onChange={(e) => setForm({ ...form, unitTitle: e.target.value })}
                  placeholder="e.g. My Future Job / My Favourite Subject..."
                  className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chương Trình & Khối Lớp
                </label>
                <input
                  type="text"
                  value={form.curriculumInfo}
                  onChange={(e) => setForm({ ...form, curriculumInfo: e.target.value })}
                  placeholder="e.g. Tiếng Anh 5 Global Success – General Education Curriculum 2018"
                  className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                />
              </div>

              {/* Strict Knowledge Grounding Area for AI generation */}
              <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-3xl p-5 border-2 border-purple-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-600 text-white">
                      <Wand2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-purple-950 font-heading">
                        Học Liệu Bài Giao Gốc & AI Trợ Giảng Tự Động
                      </h3>
                      <p className="text-[11px] text-purple-700 font-semibold">
                        Dán nội dung bài học SGK, từ vựng, hoặc transcript vào đây. AI sẽ sinh ra câu hỏi bám sát 100% học liệu này!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isGeneratingAI}
                    onClick={handleAutoGenerateContent}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Sparkles className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAI ? 'AI Đang Phân Tích...' : 'Tự Động Sinh Nội Dung Bằng AI'}</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={form.knowledgeContent || ''}
                  onChange={(e) => setForm({ ...form, knowledgeContent: e.target.value })}
                  placeholder="Dán nội dung kiến thức bài giao, từ vựng, mẫu câu, hoặc transcript bài nghe nhìn vào đây... (Ví dụ: Unit 5 My Future Job: What would you like to be in the future? I'd like to be a teacher / writer / pilot. Why? Because I'd like to teach children...)"
                  className="w-full text-xs font-medium p-3 rounded-2xl border border-purple-200 bg-white focus:outline-purple-500 resize-y"
                />
              </div>
            </div>
          )}

          {/* TAB 2: STEP 1 - VIDEO / MP3 & QUESTIONS */}
          {activeTab === 'step1' && (
            <div className="space-y-6">
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3.5 text-xs text-pink-900 font-semibold">
                🎥 <strong>Step 1: Khám Phá Bài Mẫu Qua Video / Audio</strong>
                <p className="mt-1 text-[11px] text-pink-800">
                  Học sinh sẽ xem hoặc nghe học liệu này, sau đó trả lời bộ câu hỏi kiểm tra độ hiểu bằng <strong>Thu âm giọng nói (Voice/STT)</strong> hoặc <strong>Gõ phím (Type)</strong>.
                </p>
              </div>

              {/* Media Type Chooser */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  1. Chọn Loại Học Liệu Step 1:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { type: 'sample', label: 'Video Có Sẵn' },
                    { type: 'upload', label: 'Tải File Video' },
                    { type: 'youtube', label: 'Link YouTube' },
                    { type: 'drive', label: 'Google Drive' },
                    { type: 'mp3-upload', label: 'Tải File MP3' },
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
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        form.video.sourceType === s.type
                          ? 'bg-pink-100 border-pink-500 text-pink-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Video File */}
              {form.video.sourceType === 'upload' && (
                <div className="border-2 border-dashed border-purple-300 rounded-3xl p-6 text-center bg-purple-50/40">
                  <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-2">Chọn file Video từ máy tính (MP4, WEBM, MOV)</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                  />
                  {form.video.url && (
                    <p className="text-xs text-emerald-700 font-bold mt-2">✅ Video đã sẵn sàng: {form.video.caption}</p>
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
                    <p className="text-xs text-emerald-700 font-bold mt-2">✅ File MP3 đã sẵn sàng: {form.video.caption}</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Thời lượng ước tính (Duration)
                  </label>
                  <input
                    type="text"
                    value={form.video.duration}
                    onChange={(e) => setForm({ ...form, video: { ...form.video, duration: e.target.value } })}
                    placeholder="e.g. 0:50 hoặc 1:20"
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Transcript / Lời Thoại Bài Nghe Nhìn
                </label>
                <textarea
                  rows={3}
                  value={form.video.transcript}
                  onChange={(e) => setForm({ ...form, video: { ...form.video, transcript: e.target.value } })}
                  placeholder="Transcript nội dung video/audio..."
                  className="w-full text-xs font-medium p-3 rounded-2xl border border-slate-300 focus:outline-purple-500 bg-slate-50"
                />
              </div>

              {/* INTEGRATED QUESTIONS FOR STEP 1 */}
              <div className="space-y-3 pt-4 border-t-2 border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-pink-700 bg-pink-100 px-3 py-1 rounded-xl inline-block">
                      2. Bộ Câu Hỏi Tìm Hiểu Bài (Step 1 Comprehension Questions)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Học sinh sẽ trả lời từng câu này bằng giọng nói hoặc gõ text.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddS1Question}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 cursor-pointer shadow-xs active:scale-95"
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
                          placeholder="Gợi ý câu trả lời..."
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Câu trả lời mẫu:</label>
                        <input
                          type="text"
                          value={q.exampleAnswer}
                          onChange={(e) => handleUpdateS1Question(idx, 'exampleAnswer', e.target.value)}
                          placeholder="Câu trả lời mẫu..."
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STEP 2 - MINDMAP & QUESTIONS */}
          {activeTab === 'step2' && (
            <div className="space-y-6">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 text-xs text-teal-900 font-semibold">
                🧠 <strong>Step 2: Phân Tích & Khám Phá Sơ Đồ Tư Duy (Mindmap)</strong>
                <p className="mt-1 text-[11px] text-teal-800">
                  Hỗ trợ đa dạng phương tiện: Tải ảnh từ máy tính, Video mindmap, Link Canva/Coggle, hoặc Sơ đồ tương tác SVG. Kèm bộ câu hỏi phân tích nhánh sơ đồ.
                </p>
              </div>

              {/* Source types */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  1. Chọn Phương Tiện Sơ Đồ Tư Duy:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[
                    { type: 'diagram', label: 'Interactive SVG' },
                    { type: 'upload', label: 'Tải Ảnh Lên' },
                    { type: 'video', label: 'Tải Video Lên' },
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
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        form.mindmap.sourceType === s.type
                          ? 'bg-teal-100 border-teal-500 text-teal-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload image file */}
              {form.mindmap.sourceType === 'upload' && (
                <div className="border-2 border-dashed border-teal-300 rounded-3xl p-5 text-center bg-teal-50/40">
                  <ImageIcon className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-2">Tải ảnh Mindmap từ máy tính (PNG, JPG, SVG, WebP)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMindmapFileUpload}
                    className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                  />
                  {form.mindmap.url && (
                    <div className="mt-3">
                      <img
                        src={form.mindmap.url}
                        alt="Mindmap preview"
                        className="max-h-36 mx-auto rounded-xl border border-teal-300 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Upload video mindmap */}
              {form.mindmap.sourceType === 'video' && (
                <div className="border-2 border-dashed border-teal-300 rounded-3xl p-5 text-center bg-teal-50/40">
                  <Video className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-2">Tải Video Mindmap từ máy tính (MP4, WebM)</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleMindmapVideoFileUpload}
                    className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                  />
                </div>
              )}

              {['youtube', 'drive', 'link'].includes(form.mindmap.sourceType) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Đường dẫn Mindmap (YouTube / Drive / Web link Canva, Coggle...)
                  </label>
                  <input
                    type="url"
                    value={form.mindmap.url}
                    onChange={(e) => setForm({ ...form, mindmap: { ...form.mindmap, url: e.target.value } })}
                    placeholder="https://..."
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 focus:outline-teal-500 bg-slate-50"
                  />
                </div>
              )}

              {/* Branches Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-slate-700">
                    2. Các Nhánh Mindmap & Giải thích (Bấm nghe giải thích)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddBranch}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Nhánh</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {form.mindmap.branches.map((b, idx) => (
                    <div key={b.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => handleUpdateBranch(idx, 'title', e.target.value)}
                          placeholder="Tiêu đề nhánh..."
                          className="flex-1 text-xs font-bold p-2 rounded-xl border border-slate-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteBranch(idx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                          Giải thích ngắn gọn (TTS đọc cho học sinh):
                        </label>
                        <textarea
                          value={b.simpleExplanation}
                          onChange={(e) => handleUpdateBranch(idx, 'simpleExplanation', e.target.value)}
                          rows={2}
                          className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 bg-white resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INTEGRATED QUESTIONS FOR STEP 2 */}
              <div className="space-y-3 pt-4 border-t-2 border-teal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-teal-800 bg-teal-100 px-3 py-1 rounded-xl inline-block">
                      3. Bộ Câu Hỏi Phân Tích Sơ Đồ (Step 2 Mindmap Questions)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Học sinh sẽ quan sát sơ đồ và trả lời từng câu bằng giọng nói hoặc gõ text.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddS2Question}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Câu Hỏi</span>
                  </button>
                </div>

                {form.section2Questions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateS2Question(idx, 'question', e.target.value)}
                        placeholder="Nội dung câu hỏi phân tích mindmap..."
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
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Gợi ý (Hint):</label>
                        <input
                          type="text"
                          value={q.expectedHint}
                          onChange={(e) => handleUpdateS2Question(idx, 'expectedHint', e.target.value)}
                          placeholder="Gợi ý cành sơ đồ..."
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">Câu trả lời mẫu:</label>
                        <input
                          type="text"
                          value={q.exampleAnswer}
                          onChange={(e) => handleUpdateS2Question(idx, 'exampleAnswer', e.target.value)}
                          placeholder="Câu trả lời mẫu..."
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STEP 3 - SPEAKING EXPRESSIONS */}
          {activeTab === 'step3' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 text-xs text-indigo-900 font-semibold">
                💬 <strong>Step 3: Mẫu Câu Cốt Lõi (Speaking Expressions Toolbox)</strong>
                <p className="mt-1 text-[11px] text-indigo-800">
                  Học sinh luyện phát âm từng mẫu câu với tốc độ chuẩn, nhận phản hồi phát âm & độ trôi chảy từ AI, và tham gia minigame ghép từ củng cố phản xạ.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-700">Danh Sách Mẫu Câu Luyện Nói</span>
                <button
                  type="button"
                  onClick={handleAddExpression}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Mẫu Câu</span>
                </button>
              </div>

              <div className="space-y-3">
                {form.usefulExpressions.map((exp, idx) => (
                  <div key={exp.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={exp.english}
                        onChange={(e) => handleUpdateExpression(idx, 'english', e.target.value)}
                        placeholder="Câu tiếng Anh (English sentence)..."
                        className="flex-1 text-xs font-bold p-2 rounded-xl border border-slate-300 bg-white"
                      />
                      <select
                        value={exp.category}
                        onChange={(e) => handleUpdateExpression(idx, 'category', e.target.value)}
                        className="text-xs font-bold p-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Greeting & Opening">Chào hỏi & Mở đầu</option>
                        <option value="Expressing Dreams">Bày tỏ ước mơ / ý tưởng</option>
                        <option value="Giving Reasons">Nêu lý do</option>
                        <option value="Closing">Kết bài</option>
                        <option value="General">Mẫu câu chung</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpression(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                          Nghĩa tiếng Việt / Hướng dẫn:
                        </label>
                        <input
                          type="text"
                          value={exp.vietnameseGuide || ''}
                          onChange={(e) => handleUpdateExpression(idx, 'vietnameseGuide', e.target.value)}
                          placeholder="Dịch nghĩa tiếng Việt..."
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                          Tốc độ đọc mẫu (TTS Speed):
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.7"
                          max="1.2"
                          value={exp.audioSpeed || 0.9}
                          onChange={(e) => handleUpdateExpression(idx, 'audioSpeed', parseFloat(e.target.value))}
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STEP 4 - INTERACTIVE PRACTICE WITH AI BUDDY */}
          {activeTab === 'step4' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 font-semibold">
                🤖 <strong>Step 4: Luyện Hội Thoại Đa Tầng Cùng AI Buddy (4 Cấp Độ)</strong>
                <p className="mt-1 text-[11px] text-blue-800">
                  Học sinh đối thoại trực tiếp với AI Buddy qua 4 mức độ: Nhận diện, Trả lời ngắn, Trả lời mở rộng, và Bày tỏ ý kiến cá nhân.
                </p>
              </div>

              <div className="space-y-3">
                {form.practiceLevels.map((lvl, idx) => (
                  <div key={lvl.levelNumber || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black text-xs">
                        Level {lvl.levelNumber}: {lvl.levelName}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{lvl.badgeTitle}</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                        Câu hỏi / Lời thoại của AI Buddy:
                      </label>
                      <input
                        type="text"
                        value={lvl.buddyPrompt}
                        onChange={(e) => {
                          const updated = [...form.practiceLevels];
                          updated[idx] = { ...updated[idx], buddyPrompt: e.target.value };
                          setForm({ ...form, practiceLevels: updated });
                        }}
                        className="w-full text-xs font-bold p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                          Gợi ý cho học sinh (Hint):
                        </label>
                        <input
                          type="text"
                          value={lvl.hint}
                          onChange={(e) => {
                            const updated = [...form.practiceLevels];
                            updated[idx] = { ...updated[idx], hint: e.target.value };
                            setForm({ ...form, practiceLevels: updated });
                          }}
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-0.5">
                          Câu trả lời mẫu của học sinh:
                        </label>
                        <input
                          type="text"
                          value={lvl.sampleStudentAnswer}
                          onChange={(e) => {
                            const updated = [...form.practiceLevels];
                            updated[idx] = { ...updated[idx], sampleStudentAnswer: e.target.value };
                            setForm({ ...form, practiceLevels: updated });
                          }}
                          className="w-full text-xs font-medium p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STEP 5 & 6 - SPEAKING CHALLENGE & FEEDBACK RUBRIC */}
          {activeTab === 'step5' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 font-semibold">
                🎤 <strong>Step 5 & 6: Thử Thách Bài Nói Độc Lập & Nhận Xét 5 Tiêu Chí Rubric</strong>
                <p className="mt-1 text-[11px] text-amber-800">
                  Học sinh thu âm bài thuyết trình hoàn chỉnh (30-60 giây), sau đó AI chấm điểm radar 5 tiêu chí và gửi bài nộp về cho giáo viên.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bài Nói Mẫu (Model Presentation)
                </label>
                <textarea
                  rows={4}
                  value={form.modelAnswer}
                  onChange={(e) => setForm({ ...form, modelAnswer: e.target.value })}
                  placeholder="Bài nói mẫu hoàn chỉnh để học sinh tham khảo trước khi nói..."
                  className="w-full text-xs font-medium p-3 rounded-2xl border border-slate-300 bg-white focus:outline-amber-500"
                />
              </div>

              <div className="bg-white rounded-2xl p-4 border border-amber-200 space-y-2">
                <span className="text-xs font-bold uppercase text-amber-900 block">
                  5 Tiêu Chí Chấm Điểm (5-Dimension Rubric):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-center">
                    1. Phát Âm (Pronunciation)
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-center">
                    2. Độ Trôi Chảy (Fluency)
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-center">
                    3. Từ Vựng (Vocabulary)
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-center">
                    4. Ngữ Pháp (Grammar)
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-center">
                    5. Phát Triển Ý (Content)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BACKGROUND & ADMIN PIN */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              {/* Background Themes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-700">
                      1. Chọn Phông Nền Giao Diện Bài Học
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chọn màu pastel dịu mắt hoặc tải ảnh từ máy tính để làm hình nền riêng cho Unit này.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'default', name: 'Mặc định (Pastel Gold/Sky)', bg: 'bg-gradient-to-r from-amber-100 to-sky-100' },
                    { id: 'sky', name: 'Bầu Trời Xanh (Sky)', bg: 'bg-gradient-to-r from-sky-200 to-blue-100' },
                    { id: 'peach', name: 'Cam Đào (Peach)', bg: 'bg-gradient-to-r from-orange-200 to-amber-100' },
                    { id: 'mint', name: 'Bạc Hà (Mint)', bg: 'bg-gradient-to-r from-emerald-200 to-teal-100' },
                    { id: 'lavender', name: 'Hoa Oải Hương (Lavender)', bg: 'bg-gradient-to-r from-purple-200 to-indigo-100' },
                    { id: 'pink', name: 'Hồng Ngọt Ngào (Pink)', bg: 'bg-gradient-to-r from-pink-200 to-rose-100' },
                    { id: 'starry', name: 'Bầu Trời Sao (Starry)', bg: 'bg-gradient-to-r from-slate-200 to-indigo-200' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          backgroundType: 'preset',
                          backgroundTheme: theme.id as BackgroundThemeType,
                        }))
                      }
                      className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        form.backgroundType !== 'upload' && form.backgroundTheme === theme.id
                          ? 'border-purple-600 shadow-md ring-2 ring-purple-300'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className={`h-8 rounded-xl mb-2 ${theme.bg}`} />
                      <span className="text-xs font-bold text-slate-800 block truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>

                {/* Upload Background Image from Computer */}
                <div className="border-2 border-dashed border-rose-300 rounded-3xl p-5 text-center bg-rose-50/40">
                  <Palette className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    Tùy chọn: Tải ảnh Background từ máy tính (PNG, JPG, WebP)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundFileUpload}
                    className="text-xs font-semibold text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-500 file:text-white hover:file:bg-rose-600 cursor-pointer"
                  />
                  {form.backgroundType === 'upload' && form.customBackgroundUrl && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="text-xs text-emerald-700 font-bold">✅ Đã tải ảnh nền máy tính</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            backgroundType: 'preset',
                            customBackgroundUrl: undefined,
                          }))
                        }
                        className="text-xs text-rose-600 font-bold underline cursor-pointer"
                      >
                        Xóa ảnh nền
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ADMIN PIN SETTING */}
              <div className="bg-purple-50 rounded-3xl p-5 border-2 border-purple-200 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-700" />
                  <h4 className="text-sm font-black text-purple-900 font-heading">
                    Mã PIN Bảo Vệ Trang Quản Trị Giáo Viên
                  </h4>
                </div>
                <p className="text-xs text-purple-800 font-medium">
                  Học sinh khi bấm nút "Dành Cho Giáo Viên" trên thanh công cụ sẽ được yêu cầu nhập mã PIN này. Mã PIN mặc định là: <strong className="font-bold text-purple-900">1234</strong>.
                </p>
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500">
                    💡 Để đổi mã PIN, giáo viên có thể đổi trực tiếp ngay trên hộp thoại xác thực ở màn hình học sinh.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PUBLISH & HEYZINE */}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 font-medium space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>Xuất Bản & Giao Bài Học Sinh Theo Từng Unit</span>
                </div>
                <p>
                  Khi học sinh mở link này, giao diện sẽ <strong>khóa đúng vào Unit được giao</strong>, ẩn hoàn toàn trang quản trị của giáo viên.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Student Direct URL */}
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 shadow-xs">
                  <span className="text-xs font-bold text-slate-700 block">
                    🔗 Đường dẫn làm bài trực tiếp cho học sinh (Rút gọn theo Unit):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={studentUrl}
                      className="flex-1 text-xs font-bold text-purple-900 p-2.5 rounded-xl border border-slate-200 bg-slate-50 truncate"
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
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 block">
                      📖 Mã Nhúng Sách Lật Heyzine (iFrame Embed):
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
                <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
                  <p className="font-bold">💡 Hướng dẫn nhúng vào sách lật Heyzine:</p>
                  <p>1. Trong giao diện chỉnh sửa Heyzine, chọn thêm công cụ <strong>Web/Iframe</strong> hoặc <strong>Link</strong>.</p>
                  <p>2. Dán mã nhúng iframe hoặc link học sinh ở trên vào.</p>
                  <p>3. Khi bạn cập nhật hoặc thêm bài học tại đây, Heyzine sẽ tự động đồng bộ ngay lập tức!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PRESETS */}
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
                      {unit.curriculumInfo} • {unit.mindmap.branches.length} Nhánh Mindmap • {unit.section1Questions.length} Câu hỏi
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
            Đang soạn: <strong>{form.unitNumber}</strong> - {form.unitTitle}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-all"
            >
              Hủy / Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-200 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Bài Học & Giao Cho Học Sinh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
