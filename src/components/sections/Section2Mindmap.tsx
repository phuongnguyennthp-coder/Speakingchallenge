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
        praiseWord: data.praiseWord || 'Great listening!',
        feedbackText: data.feedback || `Super! You shared: "${transcript}". You clearly understand the mindmap ideas!`,
        isCompleted: true,
        timestamp: Date.now(),
      };

      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: newAnswer,
      }));

      speechService.speak(`${data.praiseWord || 'Great listening!'} ${data.feedback || ''}`);
    } catch (err) {
      console.warn('Backend analyze-comprehension fallback:', err);
      sounds.playPraiseChime();
      const fallback: QuestionAnswerState = {
        questionId: currentQ.id,
        studentSpeech: transcript,
        audioBlobUrl,
        praiseWord: 'Good try!',
        feedbackText: `Good job observing the mindmap! You answered: "${transcript}".`,
        isCompleted: true,
      };
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: fallback,
      }));
      speechService.speak(`Good try! You answered: "${transcript}". Nice observation of the mindmap!`);
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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-8">
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

      {/* Mindmap Interactive Display */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-100 shadow-lg shadow-emerald-50 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading">
            {material.mindmap.title || 'Mindmap: Key Topic Ideas'}
          </h3>
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
            <strong>Mindmap Rule:</strong> All explanations reflect ONLY information clearly visible in the teacher's mindmap. No outside inferences are added.
          </span>
        </div>
      </div>

      {/* Mindmap Questions Area */}
      {questions.length > 0 && (
        <div className="bg-gradient-to-b from-white to-emerald-50/40 rounded-3xl p-5 sm:p-7 border-2 border-emerald-200 shadow-md">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                Mindmap Questions
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 font-heading mt-1">
                Explore the Mindmap with AI Buddy
              </h3>
            </div>

            {/* Question Nav Pills */}
            <div className="flex items-center gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id]?.isCompleted;
                const isCurrent = idx === currentQuestionIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl font-heading text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md scale-105'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span>Question {idx + 1}</span>
                    {isAnswered && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question */}
          {currentQ && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-100 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm shrink-0">
                      {currentQuestionIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-slate-800 font-heading">
                        {currentQ.question}
                      </h4>
                      {currentQ.expectedHint && (
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          💡 Hint from mindmap: {currentQ.expectedHint}
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

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Your Answer: “{currentAnswer.studentSpeech}”</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTryAgain}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>TRY AGAIN</span>
                      </button>

                      {currentQuestionIdx < questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                /* Voice/Type Dual Mode */
                <div className="space-y-3">
                  <VoiceRecorder
                    promptText={`Question ${currentQuestionIdx + 1}: Record or type what you see in the mindmap`}
                    buttonLabel="Record Voice Answer"
                    isProcessing={isAnalyzing}
                    onRecordingComplete={handleVoiceAnswer}
                  />
                  <div className="text-center">
                    <span className="text-xs text-slate-500 font-medium">
                      * Short answers are welcome! Speak or type what you see in the mindmap branches.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section Completion Banner */}
          {allCompleted && (
            <div className="mt-6 pt-5 border-t border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-100 via-teal-100 to-indigo-100 p-4 rounded-2xl border-2 border-emerald-300">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-emerald-950 font-heading">
                    Section 2 Completed! Excellent Understanding!
                  </h4>
                  <p className="text-xs text-emerald-800 font-semibold">
                    You studied the mindmap branches thoroughly. Section 3 is now unlocked!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playEncouragementChime();
                  onCompleteSection();
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>Unlock Section 3: Useful Expressions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
