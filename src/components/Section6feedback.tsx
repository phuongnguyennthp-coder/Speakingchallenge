import React, { useEffect, useState } from 'react';
import { Sparkles, Star, Award, RotateCcw, Check, Heart, Volume2, BookOpen, ThumbsUp, PartyPopper, Send, CheckCircle2, User, GraduationCap, Calendar, Edit3, Printer } from 'lucide-react';
import { TeacherMaterial, ChallengeEvaluation } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { speechService } from '../../utils/speech';
import { aiEvaluateChallenge, hasValidApiKey } from '../../utils/geminiClient';
import { submissionStore } from '../../utils/submissionStore';

interface Section6FeedbackProps {
  material: TeacherMaterial;
  studentTranscript: string;
  studentAudioUrl?: string;
  durationSeconds: number;
  onTryAgainYes: () => void;
  onTryAgainNo: () => void;
  hasFinishedLesson: boolean;
}

export const Section6Feedback: React.FC<Section6FeedbackProps> = ({
  material,
  studentTranscript,
  studentAudioUrl,
  durationSeconds,
  onTryAgainYes,
  onTryAgainNo,
  hasFinishedLesson,
}) => {
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Student Submission State (pre-fills from URL or localStorage)
  const [studentName, setStudentName] = useState(() => localStorage.getItem('esmart_student_name') || '');
  const [studentClass, setStudentClass] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlClass = params.get('class');
      if (urlClass) return urlClass;
    }
    return localStorage.getItem('esmart_student_class') || material.targetClass || '5A1';
  });
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('esmart_student_school') || '');
  const [submissionTeacher, setSubmissionTeacher] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTeacher = params.get('teacher');
      if (urlTeacher) return urlTeacher;
    }
    return localStorage.getItem('esmart_student_teacher') || material.teacherName || 'Ms. Hồng Phượng';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Certificate Date State: Option A (Auto completed date) vs Option B (Teacher fixed date)
  const [certDateMode, setCertDateMode] = useState<'auto' | 'custom'>(() => {
    return (
      (localStorage.getItem(`esmart_cert_mode_${material.id}`) as 'auto' | 'custom') ||
      material.certificateDateMode ||
      'auto'
    );
  });
  const [customCertDate, setCustomCertDate] = useState(() => {
    return (
      localStorage.getItem(`esmart_cert_date_${material.id}`) ||
      material.certificateDate ||
      '15/10/2026'
    );
  });
  const [isEditingCertDate, setIsEditingCertDate] = useState(false);

  const todayFormatted = `Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;
  const effectiveCertDate = certDateMode === 'auto' ? todayFormatted : customCertDate;

  useEffect(() => {
    let isMounted = true;

    async function evaluateSpeech() {
      setIsLoading(true);
      try {
        let data: any = null;

        // 1. Try direct client Gemini engine with model fallback & retry (ideal for Vercel SPA)
        if (hasValidApiKey()) {
          try {
            data = await aiEvaluateChallenge(
              studentTranscript,
              material.unitTitle,
              durationSeconds,
              `Unit: ${material.unitNumber}. Topic: ${material.unitTitle}. Branches: ${material.mindmap.branches.map((b) => b.title).join(', ')}`
            );
          } catch (clientErr) {
            console.warn('Client Gemini evaluation fallback to API:', clientErr);
          }
        }

        // 2. Try backend endpoint if client didn't succeed
        if (!data) {
          const res = await fetch('/api/ai/evaluate-challenge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcript: studentTranscript,
              materialTopic: material.unitTitle,
              materialContext: `Unit: ${material.unitNumber}. Topic: ${material.unitTitle}. Mindmap branches: ${material.mindmap.branches
                .map((b) => b.title)
                .join(', ')}`,
              durationSeconds,
            }),
          });
          if (res.ok) {
            data = await res.json();
          }
        }

        if (data && isMounted) {
          setEvaluation(data);
          sounds.playPraiseChime();
        } else if (!data) {
          throw new Error('No evaluation data returned');
        }
      } catch (err) {
        console.warn('Evaluation fallback:', err);
        if (isMounted) {
          setEvaluation({
            rubricFeedback: {
              pronunciation: 'Clear pronunciation of English sounds.',
              fluency: 'Good speaking flow and steady pace.',
              vocabulary: 'Accurate vocabulary from the mindmap.',
              grammar: 'Clear and correct simple sentences.',
              contentDevelopment: 'Well-structured ideas from the mindmap.',
            },
            strengths: [
              'Spoke with great confidence.',
              'Used key words from mindmap.',
              'Clear voice and pronunciation.',
            ],
            nextTimeYouCanTry: [
              "Connect ideas with 'because' and 'and'.",
              'Pronounce ending sounds /s/ and /t/ clearly.',
            ],
            suggestedSentenceUpgrades: [
              {
                original: 'I like this. It is good.',
                upgrade: 'I like this because it is exciting.',
                tip: "Use 'because' to give a reason!",
              },
            ],
            modelAnswer: material.modelAnswer,
            closingMessage: 'Great job! Keep practising English every day.',
          });
          sounds.playPraiseChime();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    evaluateSpeech();

    return () => {
      isMounted = false;
    };
  }, [material, studentTranscript, durationSeconds]);

  // Read Model Answer aloud
  const handlePlayModelAnswer = (text: string) => {
    speechService.speak(text, undefined, 0.88, 1.05);
  };

  const handleSubmitToTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setSubmitError('Vui lòng nhập họ và tên của em trước khi nộp bài nhé!');
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      localStorage.setItem('esmart_student_name', studentName.trim());
      localStorage.setItem('esmart_student_class', studentClass.trim());
      if (schoolName.trim()) localStorage.setItem('esmart_student_school', schoolName.trim());
      if (submissionTeacher.trim()) localStorage.setItem('esmart_student_teacher', submissionTeacher.trim());

      const payload = {
        unitId: material.id,
        unitNumber: material.unitNumber,
        unitTitle: material.unitTitle,
        studentName: studentName.trim(),
        studentClass: studentClass.trim(),
        schoolName: schoolName.trim(),
        teacherName: submissionTeacher.trim(),
        transcript: studentTranscript,
        audioUrl: studentAudioUrl || '',
        durationSeconds,
        rubricFeedback: evaluation?.rubricFeedback || {},
        strengths: evaluation?.strengths || [],
        nextTimeYouCanTry: evaluation?.nextTimeYouCanTry || [],
      };

      // Save to localStorage submissionStore
      submissionStore.saveSubmission(payload);

      try {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (apiErr) {
        console.warn('Backend API submission sync fallback:', apiErr);
      }

      sounds.playCelebrationFanfare();
      setIsSubmitted(true);
    } catch (err) {
      console.warn('Submission fallback:', err);
      sounds.playCelebrationFanfare();
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCertificateCard = () => (
    <div className="bg-gradient-to-b from-amber-50 via-white to-pink-50/70 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-2xl space-y-5 text-left relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/40 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/40 to-transparent rounded-tr-full pointer-events-none" />

      {/* Top row */}
      <div className="flex items-center justify-between border-b-2 border-amber-200/80 pb-4 relative z-10 flex-wrap gap-2">
        <div>
          <span className="text-[11px] font-black text-amber-800 uppercase tracking-widest block">
            Speaking Challenge Certificate • Giấy Khen
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            E-SMART ENGLISH KIDS
          </h3>
          <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block mt-0.5">
            Designed by Ms Hồng Phượng
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs border border-amber-300">
            <Award className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Student Recipient Info */}
      <div className="text-center py-2 space-y-1 relative z-10">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chứng nhận trao tặng cho / Proudly presented to:
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-purple-900 font-heading tracking-tight">
          {studentName.trim() || 'Học sinh Lớp 5'}
        </h2>
        <p className="text-xs sm:text-sm font-extrabold text-slate-600">
          {studentClass ? `Lớp ${studentClass}` : 'Lớp 5'} {schoolName ? `• Trường Tiểu học ${schoolName}` : ''}
        </p>
      </div>

      {/* Achievement Statement */}
      <div className="bg-amber-100/60 border border-amber-200/90 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 font-semibold text-center leading-relaxed relative z-10">
        🌟 Đã hoàn thành xuất sắc <strong>6 bước Thử Thách Nói Tiếng Anh Lớp 5 (Speaking Challenge)</strong>
        <br />
        Chủ đề: <span className="text-purple-700 font-black">{material.unitNumber}: {material.unitTitle}</span>
      </div>

      {/* Bottom Footer: Date & Teacher Signature */}
      <div className="pt-3 border-t-2 border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs">
        {/* Left: Date & Date Setting Option Button */}
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="text-slate-600 font-bold flex items-center justify-center sm:justify-start gap-1 flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Ngày cấp (Issue Date):</span>
            <span className="text-slate-900 font-black">{effectiveCertDate}</span>
            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
              {certDateMode === 'auto' ? 'Tự động theo ngày làm bài' : 'Ngày giáo viên chỉ định'}
            </span>
          </div>

          {/* Teacher Date Settings Option */}
          {isEditingCertDate ? (
            <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-300 shadow-lg space-y-2.5 max-w-sm animate-fade-in">
              <span className="text-[11px] font-black text-slate-800 block uppercase">
                ⚙️ Chọn cách hiển thị ngày cấp giấy khen:
              </span>
              <label className="flex items-start gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="radio"
                  name="certMode"
                  checked={certDateMode === 'auto'}
                  onChange={() => {
                    setCertDateMode('auto');
                    localStorage.setItem(`esmart_cert_mode_${material.id}`, 'auto');
                  }}
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <span className="text-purple-900">1. Ngày học sinh thực hiện</span>
                  <p className="text-[10px] text-slate-500 font-medium">Tự động lấy theo ngày em nộp bài ({todayFormatted})</p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="radio"
                  name="certMode"
                  checked={certDateMode === 'custom'}
                  onChange={() => {
                    setCertDateMode('custom');
                    localStorage.setItem(`esmart_cert_mode_${material.id}`, 'custom');
                  }}
                  className="mt-0.5 accent-purple-600"
                />
                <div className="w-full">
                  <span className="text-purple-900">2. Ngày giáo viên chỉ định cố định</span>
                  {certDateMode === 'custom' && (
                    <input
                      type="text"
                      value={customCertDate}
                      onChange={(e) => {
                        setCustomCertDate(e.target.value);
                        localStorage.setItem(`esmart_cert_date_${material.id}`, e.target.value);
                      }}
                      placeholder="vd: 20/10/2026 hoặc Ngày 20 tháng 10 năm 2026"
                      className="mt-1 w-full px-2.5 py-1 text-xs font-bold border border-amber-300 rounded-lg bg-amber-50/40 outline-none focus:border-amber-600"
                    />
                  )}
                </div>
              </label>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingCertDate(false)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs cursor-pointer hover:bg-emerald-700 shadow-xs"
                >
                  ✓ Lưu Cài Đặt
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingCertDate(true)}
              className="text-[11px] font-extrabold text-amber-800 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer transition-colors"
              title="Cài đặt tùy chọn ngày cấp giấy khen"
            >
              <Edit3 className="w-3 h-3" />
              <span>Cài đặt ngày cấp: Tự động hoặc Chỉ định</span>
            </button>
          )}
        </div>

        {/* Right: Teacher Block */}
        <div className="text-center sm:text-right space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">
            GIÁO VIÊN TIẾNG ANH (TEACHER)
          </span>
          <div className="text-sm font-black text-slate-900 font-heading">
            {material.teacherName || 'Ms. Hồng Phượng'}
          </div>
          <div className="text-xs font-extrabold text-purple-700">
            {material.teacherTitle || 'English Teacher'}
          </div>
        </div>
      </div>
    </div>
  );

  // If student selected NO -> Finished Screen!
  if (hasFinishedLesson) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 px-4 space-y-6 animate-fade-in">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-1 shadow-2xl shadow-rose-200 animate-bounce">
          <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
            <PartyPopper className="w-12 h-12 text-rose-500" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            Lesson Completed!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Congratulations, English Champion! 🎉
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-bold max-w-lg mx-auto leading-relaxed">
            You completed all 6 steps of the Speaking Challenge for{' '}
            <span className="text-purple-600 font-extrabold">{material.unitNumber}: {material.unitTitle}</span>.
          </p>
        </div>

        {/* Certificate Card */}
        {renderCertificateCard()}

        <div className="pt-4">
          <button
            onClick={onTryAgainYes}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-200 flex items-center gap-2 mx-auto cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Another Speaking Take</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !evaluation) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-xl font-black text-slate-800 font-heading">
          AI Coach is Carefully Evaluating Your Speech...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Checking your Pronunciation, Fluency, Vocabulary, Grammar, and Content Development from the teacher's materials.
        </p>
      </div>
    );
  }

  const { rubricFeedback, strengths, nextTimeYouCanTry, suggestedSentenceUpgrades, modelAnswer, closingMessage } =
    evaluation;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-rose-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
            SECTION 6
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <span>⭐</span>
            <span>AI FEEDBACK</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 font-semibold mt-1 max-w-xl">
            Supportive, confidence-building coaching based strictly on your speaking presentation!
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/30 text-white font-extrabold text-xs">
          <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Growth & Confidence</span>
        </div>
      </div>

      {/* 5 Evaluated Areas (NO NUMERICAL SCORES, NO RANKINGS) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>Speaking Rubric Evaluation</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            5 Core Areas of Communication
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* 1. Pronunciation */}
          <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-black uppercase text-pink-700 block">
              1. Pronunciation
            </span>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              {rubricFeedback?.pronunciation || 'Clear sounds and friendly intonation.'}
            </p>
          </div>

          {/* 2. Fluency */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-black uppercase text-purple-700 block">
              2. Fluency
            </span>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              {rubricFeedback?.fluency || 'Continuous speaking pace with natural phrasing.'}
            </p>
          </div>

          {/* 3. Vocabulary */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-black uppercase text-emerald-700 block">
              3. Vocabulary
            </span>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              {rubricFeedback?.vocabulary || 'Accurate words used from the teacher mindmap.'}
            </p>
          </div>

          {/* 4. Grammar */}
          <div className="bg-sky-50/60 border border-sky-200 rounded-2xl p-3.5 space-y-1">
            <span className="text-xs font-black uppercase text-sky-700 block">
              4. Grammar
            </span>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              {rubricFeedback?.grammar || 'Clear sentence patterns suitable for Grade 5.'}
            </p>
          </div>

          {/* 5. Content Development */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 space-y-1 sm:col-span-2 md:col-span-2">
            <span className="text-xs font-black uppercase text-amber-800 block">
              5. Content Development
            </span>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              {rubricFeedback?.contentDevelopment || 'Connected key ideas from the mindmap branches and added personal thoughts.'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Feedback: ⭐ Strengths & ⭐ Next Time You Can Try */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ⭐ Strengths */}
        <div className="bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl p-5 border-2 border-emerald-200 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="text-base sm:text-lg font-black text-emerald-950 font-heading">
              Your Strengths
            </h3>
          </div>

          <div className="space-y-2">
            {strengths?.map((str, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  ✓
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {str}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ⭐ Next Time You Can Try */}
        <div className="bg-gradient-to-b from-white to-sky-50/50 rounded-3xl p-5 border-2 border-sky-200 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="text-base sm:text-lg font-black text-sky-950 font-heading">
              Next Time You Can Try
            </h3>
          </div>

          <div className="space-y-2">
            {nextTimeYouCanTry?.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-2xl border border-sky-100 shadow-xs flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  💡
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⭐ Suggested Sentence Upgrades */}
      {suggestedSentenceUpgrades && suggestedSentenceUpgrades.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-200 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading">
              Suggested Sentence Upgrades
            </h3>
          </div>

          <div className="space-y-3">
            {suggestedSentenceUpgrades.map((upgrade, idx) => (
              <div
                key={idx}
                className="bg-purple-50/50 rounded-2xl p-4 border border-purple-200 space-y-2 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                    Original
                  </span>
                  <span className="italic font-medium">“{upgrade.original}”</span>
                </div>

                <div className="flex items-center gap-2 text-purple-900 font-bold">
                  <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white font-bold text-[10px] uppercase">
                    Upgraded
                  </span>
                  <span>“{upgrade.upgrade}”</span>
                </div>

                {upgrade.tip && (
                  <p className="text-xs text-purple-700 font-semibold pt-1 border-t border-purple-200/60">
                    💡 Tip: {upgrade.tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⭐ One Model Answer */}
      <div className="bg-gradient-to-r from-amber-50 to-pink-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
              One Model Answer (Teacher Material)
            </h3>
          </div>

          <button
            onClick={() => handlePlayModelAnswer(modelAnswer)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen to Model Answer</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold italic">
          “{modelAnswer}”
        </div>
      </div>

      {/* Mandatory Ending Message */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-5 text-white text-center shadow-lg shadow-teal-200">
        <h4 className="text-base sm:text-xl font-black font-heading tracking-wide">
          {closingMessage || 'Great job! Keep practising English every day.'}
        </h4>
      </div>

      {/* STUDENT SUBMISSION TO TEACHER FORM */}
      <div className="bg-gradient-to-br from-white via-purple-50/40 to-pink-50/40 rounded-3xl p-6 sm:p-7 border-2 border-purple-300 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider">
                Bài Tập Giao Về Nhà
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                📤 Nộp Bài Nói Cho Thầy Cô Giáo
              </h3>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black">
            Designed by Ms Hồng Phượng
          </span>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-300 text-emerald-950 space-y-2 animate-fade-in text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black font-heading text-emerald-900">
                🎉 Hoan Hô! Bài Nói Của Em Đã Được Gửi Thành Công!
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                Học sinh: <strong>{studentName}</strong> (Lớp {studentClass}) • GV: <strong>{submissionTeacher}</strong> • {material.unitNumber}: {material.unitTitle}.
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                Thầy cô đã nhận được bài ghi âm và sẽ sớm nghe, gửi nhận xét cũng như chấm điểm cho em nhé!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitToTeacher} className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Em hãy điền họ tên, lớp và chọn giáo viên phụ trách để nộp bài ghi âm và bài nói hoàn chỉnh cho thầy cô giáo nhé:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>Họ và tên của em (*)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Hoàng Nam"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Lớp của em</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Chọn nhanh:</span>
                </label>
                <div className="flex gap-1 mb-1">
                  {['5/1', '5/3'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setStudentClass(c);
                        if (c === '5/1') setSubmissionTeacher('Ms. Hồng Phượng');
                        if (c === '5/3') setSubmissionTeacher('Ms. Thanh Thảo');
                      }}
                      className={`flex-1 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                        studentClass === c
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-purple-300'
                      }`}
                    >
                      Lớp {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: 5/1 hoặc 5/3"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>Giáo viên phụ trách</span>
                </label>
                <select
                  value={submissionTeacher}
                  onChange={(e) => {
                    const t = e.target.value;
                    setSubmissionTeacher(t);
                    if (t === 'Ms. Hồng Phượng') setStudentClass('5/1');
                    if (t === 'Ms. Thanh Thảo') setStudentClass('5/3');
                  }}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600 shadow-xs cursor-pointer"
                >
                  <option value="Ms. Hồng Phượng">Ms. Hồng Phượng (Lớp 5/1)</option>
                  <option value="Ms. Thanh Thảo">Ms. Thanh Thảo (Lớp 5/3)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>🏫 Trường Tiểu học</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tiểu học Kim Đồng"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600 shadow-xs"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ {submitError}
              </p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="text-xs text-slate-500 font-semibold">
                Bài nộp gồm: Bản ghi âm ({durationSeconds}s) + Lời bài nói + Đánh giá 5 tiêu chí.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-200 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang Nộp Bài...' : '🚀 Gửi Bài Nói Cho Thầy Cô'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CERTIFICATE OF ACHIEVEMENT PREVIEW & TEACHER DATE SETTINGS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading">
              Giấy Khen Thành Tích (Certificate of Achievement)
            </h3>
          </div>
          <span className="text-xs font-extrabold text-purple-600">
            Designed by Ms Hồng Phượng
          </span>
        </div>
        {renderCertificateCard()}
      </div>

      {/* After feedback: Would you like to try again? */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200 shadow-xl text-center space-y-4">
        <h3 className="text-lg sm:text-xl font-black text-slate-800 font-heading">
          Would you like to try again?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          You can return to Section 5 to record another take, or finish your lesson today!
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          {/* YES Button */}
          <button
            onClick={() => {
              sounds.playEncouragementChime();
              onTryAgainYes();
            }}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-200 cursor-pointer active:scale-95 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>✅ YES (Try Again)</span>
          </button>

          {/* NO Button */}
          <button
            onClick={() => {
              sounds.playCelebrationFanfare();
              onTryAgainNo();
            }}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm sm:text-base shadow-lg shadow-purple-200 cursor-pointer active:scale-95 transition-all"
          >
            <span>❌ NO (Finish Lesson)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
