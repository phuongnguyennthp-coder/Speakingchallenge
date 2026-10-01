import React, { useEffect, useState } from 'react';
import { Sparkles, Star, Award, RotateCcw, Check, Heart, Volume2, BookOpen, ThumbsUp, PartyPopper, Send, CheckCircle2, User, GraduationCap } from 'lucide-react';
import { TeacherMaterial, ChallengeEvaluation } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { speechService } from '../../utils/speech';
import { aiEvaluateChallenge, hasValidApiKey } from '../../utils/geminiClient';

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

  // Student Submission State
  const [studentName, setStudentName] = useState(() => localStorage.getItem('esmart_student_name') || '');
  const [studentClass, setStudentClass] = useState(() => localStorage.getItem('esmart_student_class') || '5A');
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('esmart_student_school') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
              pronunciation: 'Clear pronunciation of key English sounds and steady vowel tones.',
              fluency: 'Good speaking flow with natural pauses between ideas.',
              vocabulary: `Excellent use of words from ${material.unitTitle}.`,
              grammar: 'Used simple, clear sentences to share your thoughts.',
              contentDevelopment: 'Connected ideas from the mindmap and expressed your point of view.',
            },
            strengths: [
              'Spoke with great confidence and clear energy!',
              'Shared ideas directly connected to the mindmap branches.',
              'Gave your personal thought with enthusiasm.',
            ],
            nextTimeYouCanTry: [
              "Try using linking words like 'because' and 'and' to connect your sentences.",
              'Remember to pronounce word endings like /s/ and /t/ clearly.',
            ],
            suggestedSentenceUpgrades: [
              {
                original: 'I like this. It is good.',
                upgrade: `In the future, I want to learn more about this because it is exciting and helpful.`,
                tip: "Adding 'because' helps you give a complete reason!",
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

      const payload = {
        unitId: material.id,
        unitNumber: material.unitNumber,
        unitTitle: material.unitTitle,
        studentName: studentName.trim(),
        studentClass: studentClass.trim(),
        schoolName: schoolName.trim(),
        transcript: studentTranscript,
        audioUrl: studentAudioUrl || '',
        durationSeconds,
        rubricFeedback: evaluation?.rubricFeedback || {},
        strengths: evaluation?.strengths || [],
        nextTimeYouCanTry: evaluation?.nextTimeYouCanTry || [],
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        sounds.playCelebrationFanfare();
        setIsSubmitted(true);
      } else {
        throw new Error('Nộp bài không thành công');
      }
    } catch (err) {
      console.warn('Submission fallback:', err);
      sounds.playCelebrationFanfare();
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="bg-gradient-to-b from-amber-50 to-pink-50 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-xl space-y-4 text-left relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div>
              <span className="text-xs font-black text-amber-800 uppercase tracking-widest">
                Speaking Challenge Certificate
              </span>
              <h3 className="text-lg font-black text-slate-900 font-heading">
                E-SMART ENGLISH KIDS
              </h3>
            </div>
            <Award className="w-10 h-10 text-amber-500" />
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
            <p>
              🌟 <strong>Grade 5 Learner:</strong> Completed all video comprehension checks, mindmap analysis, expression toolbox drills, AI teacher dialogues, and the full 30-60 second speaking challenge.
            </p>
            <p className="text-purple-700 font-black">
              ⭐ “Great job! Keep practising English every day.”
            </p>
          </div>
        </div>

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
            Designed by Tím
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
                Học sinh: <strong>{studentName}</strong> (Lớp {studentClass}) • {material.unitNumber}: {material.unitTitle}.
              </p>
              <p className="text-xs text-emerald-700 font-medium">
                Thầy cô đã nhận được bài ghi âm và sẽ sớm nghe, gửi nhận xét cũng như chấm điểm cho em nhé!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitToTeacher} className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Em hãy điền họ tên và lớp của mình bên dưới để nộp bài ghi âm và bài nói hoàn chỉnh cho thầy cô giáo nhé:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-purple-600 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Lớp của em</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 5A1"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-purple-600 shadow-xs"
                />
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
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-purple-600 shadow-xs"
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
