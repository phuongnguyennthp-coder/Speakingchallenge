import React, { useState } from 'react';
import { Volume2, CheckCircle2, RotateCcw, ArrowRight, Video, FileText, Sparkles, Check } from 'lucide-react';
import { TeacherMaterial, QuestionAnswerState } from '../../types';
import { VoiceRecorder } from '../VoiceRecorder';
import { AIBuddyAvatar } from '../AIBuddyAvatar';
import { MediaPlayer } from '../MediaPlayer';
import { sounds } from '../../utils/soundEffects';
import { speechService } from '../../utils/speech';
import { aiAnalyzeComprehension, hasValidApiKey } from '../../utils/geminiClient';

interface Section1VideoProps {
  material: TeacherMaterial;
  onCompleteSection: () => void;
  onOpenTeacherUpload?: () => void;
  isStudentMode?: boolean;
}

export const Section1Video: React.FC<Section1VideoProps> = ({
  material,
  onCompleteSection,
  onOpenTeacherUpload,
  isStudentMode = false,
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerState>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const questions = material.section1Questions || [];
  const currentQ = questions[currentQuestionIdx];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  const handleVoiceAnswer = async (transcript: string, audioBlobUrl?: string) => {
    if (!currentQ) return;
    setIsAnalyzing(true);

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
            materialTopic: material.unitTitle,
            materialContext: material.video.transcript || material.knowledgeContent || '',
            expectedKeyPoints: currentQ.expectedHint,
          }),
        });
        if (res.ok) data = await res.json();
      }

      sounds.playPraiseChime();

      const newAnswerState: QuestionAnswerState = {
        questionId: currentQ.id,
        studentSpeech: transcript,
        audioBlobUrl,
        praiseWord: data.praiseWord || 'Great job!',
        feedbackText: data.feedback || 'Good listening! Clear answer.',
        isCompleted: true,
        timestamp: Date.now(),
      };

      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: newAnswerState,
      }));

      // Speak feedback audio
      speechService.speak(`${data.praiseWord || 'Great job!'} ${data.feedback || 'Good answer!'}`);
    } catch (err) {
      console.warn('Backend feedback fetch failed, using responsive fallback:', err);
      sounds.playPraiseChime();
      const fallbackState: QuestionAnswerState = {
        questionId: currentQ.id,
        studentSpeech: transcript,
        audioBlobUrl,
        praiseWord: 'Good try!',
        feedbackText: 'Good listening! Nice answer.',
        isCompleted: true,
      };
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: fallbackState,
      }));
      speechService.speak(`Good try! Nice answer.`);
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
      {/* Title Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-pink-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
            SECTION 1
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <span>🎥</span>
            <span>WATCH / LISTEN TO MODEL PRESENTATION</span>
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 font-semibold mt-1 max-w-xl">
            Watch the video or listen to the audio carefully. Pay attention to pronunciation, vocabulary, and sentence patterns.
          </p>
        </div>

        {/* Teacher Upload Quick Link (Hidden for students) */}
        {!isStudentMode && onOpenTeacherUpload && (
          <button
            onClick={onOpenTeacherUpload}
            className="self-start sm:self-center px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-bold border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Upload / Change Media</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left = Media Player (Sticky on Laptop), Right = Comprehension Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Media Player */}
        <div className="lg:col-span-7 xl:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-pink-100 shadow-lg shadow-pink-50 space-y-3">
            <MediaPlayer
              sourceType={material.video.sourceType}
              url={material.video.url}
              caption={material.video.caption}
            />

            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{material.video.caption || 'Model Speaking Presentation for Grade 5'}</span>
              </div>

              {material.video.transcript && (
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-xs font-bold cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showTranscript ? 'Hide Audio/Video Script' : 'Read Audio/Video Script'}</span>
                </button>
              )}
            </div>

            {showTranscript && material.video.transcript && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                <span className="font-extrabold text-amber-900 block mb-1">
                  📝 Transcript (Teacher Material):
                </span>
                “{material.video.transcript}”
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Comprehension Questions Area */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {questions.length > 0 ? (
            <div className="bg-gradient-to-b from-white to-amber-50/40 rounded-3xl p-4 sm:p-6 border-2 border-amber-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-xl">
                    Comprehension Check
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading mt-1">
                    Questions ({questions.length})
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
                        className={`w-8 h-8 rounded-xl font-heading text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          isCurrent
                            ? 'bg-gradient-to-tr from-pink-500 to-amber-500 text-white shadow-md scale-105'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {isAnswered && !isCurrent ? '✓' : `Q${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Question Card */}
              {currentQ && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border-2 border-amber-100 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 font-black flex items-center justify-center text-xs shrink-0">
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
                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer transition-colors shrink-0"
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
                    /* If Not Answered: VoiceRecorder with Voice and Type Dual Mode */
                    <div className="space-y-3">
                      <VoiceRecorder
                        promptText={`Question ${currentQuestionIdx + 1} of ${questions.length}: Speak or type answer`}
                        buttonLabel="Record Voice Answer"
                        isProcessing={isAnalyzing}
                        onRecordingComplete={handleVoiceAnswer}
                      />
                      <div className="text-center">
                        <span className="text-[11px] text-slate-500 font-medium">
                          * Trả lời ngắn gọn bằng tiếng Anh.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Section Completion Banner */}
              {allCompleted && (
                <div className="pt-4 border-t border-amber-200 flex flex-col items-center gap-3 bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 p-4 rounded-2xl border-2 border-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950 font-heading">
                        Section 1 Completed!
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        Ready for Section 2 Mindmap!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playEncouragementChime();
                      onCompleteSection();
                    }}
                    className="w-full justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Unlock Section 2: Study Mindmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-amber-200 text-center text-slate-500 text-xs">
              Chưa có câu hỏi cho phần này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
