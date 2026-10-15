import React, { useState } from 'react';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight, Image as ImageIcon, Sparkles, Eye } from 'lucide-react';
import { TeacherMaterial, QuestionAnswerState } from '../../types';
import { VoiceRecorder } from '../VoiceRecorder';
import { AIBuddyAvatar } from '../AIBuddyAvatar';
import { MindmapViewer } from '../MindmapViewer';
import { sounds } from '../../utils/soundEffects';
import { speechService } from '../../utils/speech';
import { aiAnalyzeComprehension, hasValidApiKey } from '../../utils/geminiClient';

interface Section2MindmapProps {
  material: TeacherMaterial;
  onCompleteSection: () => void;
  onOpenTeacherUpload?: () => void;
  isStudentMode?: boolean;
}

export const Section2Mindmap: React.FC<Section2MindmapProps> = ({
  material,
  onCompleteSection,
  onOpenTeacherUpload,
  isStudentMode = false,
}) => {
  const [activeBranchId, setActiveBranchId] = useState<string>(
    material.mindmap.branches[0]?.id || ''
  );
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerState>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const branches = material.mindmap.branches || [];
  const questions = material.section2Questions || [];
  const currentQ = questions[currentQuestionIdx];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  const handleVoiceAnswer = async (transcript: string, audioBlobUrl?: string) => {
    if (!currentQ) return;
    setIsAnalyzing(true);

    const mindmapVisibleContext = branches
      .map((b) => `${b.title}: ${b.items.join(', ')}. Details: ${b.simpleExplanation}`)
      .join(' | ');

    try {
      let data: any = null;

      if (hasValidApiKey()) {
        try {
          data = await aiAnalyzeComprehension(currentQ.question, currentQ.expectedHint, transcript);
        } catch (clientErr) {
          console.warn('Client AI analyze error:', clientErr);
        }
      }

      if (!data) {
        const res = await fetch('/api/ai/analyze-comprehension', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: currentQ.question,
            studentAnswer: transcript,
            materialTopic: material.mindmap.title,
            materialContext: mindmapVisibleContext,
            expectedKeyPoints: currentQ.expectedHint,
          }),
        });
        if (res.ok) data = await res.json();
      }

      sounds.playPraiseChime();

      const newAnswer: QuestionAnswerState = {
        questionId: currentQ.id,
        studentSpeech: transcript,
        audioBlobUrl,
        praiseWord: data.praiseWord || 'Great job!',
        feedbackText: data.feedback || 'Great answer! You understand the mindmap.',
        isCompleted: true,
        timestamp: Date.now(),
      };

      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: newAnswer,
      }));

      speechService.speak(`${data.praiseWord || 'Great job!'} ${data.feedback || 'Well done!'}`);
    } catch (err) {
      console.warn('Backend analyze-comprehension fallback:', err);
      sounds.playPraiseChime();
      const fallback: QuestionAnswerState = {
        questionId: currentQ.id,
        studentSpeech: transcript,
        audioBlobUrl,
        praiseWord: 'Good try!',
        feedbackText: 'Good observation of the mindmap!',
        isCompleted: true,
      };
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: fallback,
      }));
      speechService.speak(`Good try! Good observation of the mindmap!`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryAgain = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const allCompleted = questions.length > 0 && questions.every((q) => answers[q.id]?.isCompleted);

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto pb-8">
      {/* Section Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-teal-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
            SECTION 2
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <span>🧠</span>
            <span>STUDY THE MINDMAP</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 font-semibold mt-1 max-w-xl">
            Look at the mindmap and explore the key ideas. Click on branches to listen to explanations!
          </p>
        </div>

        {/* Teacher Upload quick link (Hidden for students) */}
        {!isStudentMode && onOpenTeacherUpload && (
          <button
            onClick={onOpenTeacherUpload}
            className="self-start sm:self-center px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-bold border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload / Edit Mindmap</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left = Mindmap Display (Sticky on Laptop), Right = Questions & Interactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Mindmap Interactive Display */}
        <div className="lg:col-span-7 xl:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-100 shadow-lg shadow-emerald-50 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading">
                  {material.mindmap.title || 'Mindmap: Key Topic Ideas'}
                </h3>
              </div>
            </div>

            {/* Mindmap Viewer Component */}
            <MindmapViewer
              sourceType={material.mindmap.sourceType}
              url={material.mindmap.url}
              title={material.mindmap.title}
              unitNumber={material.unitNumber}
              unitTitle={material.unitTitle}
              branches={branches}
              activeBranchId={activeBranchId}
              onSelectBranch={(id) => setActiveBranchId(id)}
            />

            {/* Strict Content Grounding Note */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-xs text-sky-900 font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Mindmap Rule:</strong> Tất cả câu hỏi và trả lời bám sát 100% sơ đồ tư duy của cô giáo. Không lấy kiến thức ngoài.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Mindmap Questions Area */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {questions.length > 0 ? (
            <div className="bg-gradient-to-b from-white to-emerald-50/40 rounded-3xl p-4 sm:p-6 border-2 border-emerald-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                    Mindmap Questions
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading mt-1">
                    Answer from the Mindmap
                  </h3>
                </div>

                {/* Question Nav Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id]?.isCompleted;
                    const isCurrent = idx === currentQuestionIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`px-2.5 py-1 rounded-xl font-heading text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md scale-105'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <span>Q{idx + 1}</span>
                        {isAnswered && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Question */}
              {currentQ && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs shrink-0">
                          {currentQuestionIdx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-800 font-heading">
                            {currentQ.question}
                          </h4>
                          {currentQ.expectedHint && (
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              💡 Hint: {currentQ.expectedHint}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => speechService.speak(currentQ.question)}
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer transition-colors shrink-0"
                        title="Listen to question"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* If Answered: Display Visual Feedback, Praise & Try Again Button */}
                  {currentAnswer ? (
                    <div className="space-y-3 animate-fade-in">
                      <AIBuddyAvatar
                        praiseWord={currentAnswer.praiseWord}
                        message={currentAnswer.feedbackText}
                        state="cheering"
                        bubbleColor="from-emerald-50 to-teal-50"
                      />

                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-col gap-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="line-clamp-2">Your Answer: “{currentAnswer.studentSpeech}”</span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-200/60">
                          <button
                            onClick={handleTryAgain}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>TRY AGAIN</span>
                          </button>

                          {currentQuestionIdx < questions.length - 1 && (
                            <button
                              onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                            >
                              <span>Next Question</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Voice/Type Dual Mode */
                    <div className="space-y-3">
                      <VoiceRecorder
                        promptText={`Question ${currentQuestionIdx + 1}: Record or type from the mindmap`}
                        buttonLabel="Record Voice Answer"
                        isProcessing={isAnalyzing}
                        onRecordingComplete={handleVoiceAnswer}
                      />
                      <div className="text-center">
                        <span className="text-[11px] text-slate-500 font-medium">
                          * Trả lời ngắn gọn từ ý trong nhánh mindmap.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Section Completion Banner */}
              {allCompleted ? (
                <div className="pt-4 border-t border-emerald-200 flex flex-col items-center gap-3 bg-gradient-to-r from-emerald-100 via-teal-100 to-indigo-100 p-4 rounded-2xl border-2 border-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950 font-heading">
                        Tuyệt Vời! Đã Hoàn Thành Step 2!
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        Sẵn sàng khám phá mẫu câu ở Step 3!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playEncouragementChime();
                      onCompleteSection();
                    }}
                    className="w-full justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Tiếp Tục Sang Step 3: Useful Expressions</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => {
                      sounds.playEncouragementChime();
                      onCompleteSection();
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                  >
                    <span>Tiếp Tục Sang Step 3</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-emerald-200 text-center text-slate-600 text-xs space-y-3">
              <p className="font-semibold">Em hãy quan sát sơ đồ tư duy Mindmap bên cạnh và bấm nút bên dưới để sang Step 3 luyện mẫu câu nhé.</p>
              <button
                onClick={() => {
                  sounds.playEncouragementChime();
                  onCompleteSection();
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <span>Chuyển Sang Step 3: Useful Expressions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
