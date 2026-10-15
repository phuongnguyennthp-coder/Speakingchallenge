import React, { useState } from 'react';
import { Volume2, Mic, CheckCircle2, RotateCcw, ArrowRight, MessageSquare, Sparkles, Smile, Gamepad2 } from 'lucide-react';
import { TeacherMaterial, UsefulExpression, ExpressionPracticeState } from '../../types';
import { VoiceRecorder } from '../VoiceRecorder';
import { AIBuddyAvatar } from '../AIBuddyAvatar';
import { VocabularyGameModal } from '../VocabularyGameModal';
import { sounds } from '../../utils/soundEffects';
import { speechService } from '../../utils/speech';
import { aiAnalyzeExpression, hasValidApiKey } from '../../utils/geminiClient';

interface Section3ExpressionsProps {
  material: TeacherMaterial;
  onCompleteSection: () => void;
}

export const Section3Expressions: React.FC<Section3ExpressionsProps> = ({
  material,
  onCompleteSection,
}) => {
  const expressions = material.usefulExpressions;
  const [selectedExpId, setSelectedExpId] = useState<string>(expressions[0]?.id || '');
  const [practiceStates, setPracticeStates] = useState<Record<string, ExpressionPracticeState>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);

  const selectedExp = expressions.find((e) => e.id === selectedExpId) || expressions[0];
  const currentPractice = selectedExp ? practiceStates[selectedExp.id] : undefined;

  const handlePlayModelAudio = (sentence: string) => {
    speechService.speak(sentence, undefined, 0.88, 1.05);
  };

  const handleRecordComplete = async (transcript: string) => {
    if (!selectedExp) return;
    setIsAnalyzing(true);

    try {
      let data: any = null;

      if (hasValidApiKey()) {
        try {
          data = await aiAnalyzeExpression(selectedExp.english, transcript);
        } catch (clientErr) {
          console.warn('Client AI analyze expression error:', clientErr);
        }
      }

      if (!data) {
        const res = await fetch('/api/ai/analyze-expression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetExpression: selectedExp.english,
            studentSpeech: transcript,
          }),
        });
        if (res.ok) data = await res.json();
      }

      sounds.playPraiseChime();

      const newState: ExpressionPracticeState = {
        expressionId: selectedExp.id,
        studentSpeech: transcript,
        praise: data.praise || 'Wonderful pronunciation!',
        pronunciationFeedback: data.pronunciationFeedback || 'You pronounced the words clearly!',
        fluencyFeedback: data.fluencyFeedback || 'Good natural pace and rhythm!',
        encouragingComment: data.encouragingComment || 'Excellent effort! Keep speaking with confidence!',
        isPracticed: true,
      };

      setPracticeStates((prev) => ({
        ...prev,
        [selectedExp.id]: newState,
      }));

      // Read praise
      speechService.speak(`${data.praise || 'Wonderful pronunciation!'} ${data.encouragingComment || ''}`);
    } catch (err) {
      console.warn('Backend expression analysis fallback:', err);
      sounds.playPraiseChime();
      const fallback: ExpressionPracticeState = {
        expressionId: selectedExp.id,
        studentSpeech: transcript,
        praise: 'Wonderful pronunciation!',
        pronunciationFeedback: 'Clear word sounds and great effort!',
        fluencyFeedback: 'Good steady speaking pace!',
        encouragingComment: 'Excellent effort! You are improving your English speaking!',
        isPracticed: true,
      };
      setPracticeStates((prev) => ({
        ...prev,
        [selectedExp.id]: fallback,
      }));
      speechService.speak('Wonderful pronunciation! Excellent effort!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryAgain = () => {
    if (!selectedExp) return;
    setPracticeStates((prev) => {
      const copy = { ...prev };
      delete copy[selectedExp.id];
      return copy;
    });
  };

  const currentExpIndex = expressions.findIndex((e) => e.id === selectedExpId);
  const handleNextExpression = () => {
    if (currentExpIndex < expressions.length - 1) {
      setSelectedExpId(expressions[currentExpIndex + 1].id);
      sounds.playEncouragementChime();
    }
  };

  // Student can unlock as soon as they practice at least 1 expression or all
  const practicedCount = Object.keys(practiceStates).length;
  const isUnlockEligible = practicedCount >= 1;

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto pb-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-purple-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
            SECTION 3
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <span>💬</span>
            <span>LEARN USEFUL EXPRESSIONS</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 font-semibold mt-1 max-w-xl">
            Speaking Toolbox: Luyện phát âm các mẫu câu quan trọng. Em có thể luyện từng câu và mở khóa Step 4 bất cứ lúc nào!
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/30 text-center shrink-0">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-purple-200 block">
            Practiced
          </span>
          <span className="text-lg font-black text-white">
            {practicedCount} / {expressions.length}
          </span>
        </div>
      </div>

      {/* Expression Selection Toolbox Carousel / List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-purple-100 shadow-md shadow-purple-50 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>Speaking Toolbox (Teacher Materials)</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGameOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 hover:brightness-105 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>🎮 Game Lật Thẻ Từ Vựng</span>
            </button>
            <span className="text-xs text-purple-700 font-bold bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl hidden sm:inline">
              Click câu để luyện nói
            </span>
          </div>
        </div>

        {/* Expression selector pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {expressions.map((exp, idx) => {
            const isSelected = exp.id === selectedExpId;
            const isDone = practiceStates[exp.id]?.isPracticed;

            return (
              <button
                key={exp.id || idx}
                onClick={() => {
                  setSelectedExpId(exp.id);
                  sounds.playEncouragementChime();
                }}
                className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-purple-50 border-purple-500 shadow-sm ring-2 ring-purple-200 scale-[1.01]'
                    : isDone
                    ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-800 font-heading leading-snug">
                      {exp.english}
                    </p>
                    {exp.vietnameseGuide && (
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {exp.vietnameseGuide}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayModelAudio(exp.english);
                  }}
                  className="p-2 rounded-xl bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 shrink-0"
                  title="Listen to model audio"
                >
                  <Volume2 className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Expression Practice Card: Listen, Repeat, Record */}
      {selectedExp && (
        <div className="bg-gradient-to-b from-white to-purple-50/40 rounded-3xl p-5 sm:p-7 border-2 border-purple-200 shadow-lg space-y-5">
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 rounded-2xl p-5 border-2 border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-black uppercase text-purple-700 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200">
                {selectedExp.category}
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                “{selectedExp.english}”
              </h4>
              {selectedExp.vietnameseGuide && (
                <p className="text-xs font-bold text-slate-600">
                  {selectedExp.vietnameseGuide}
                </p>
              )}
            </div>

            {/* Model Audio Listen Button */}
            <button
              onClick={() => handlePlayModelAudio(selectedExp.english)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-purple-200 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Volume2 className="w-5 h-5" />
              <span>Listen Model Audio</span>
            </button>
          </div>

          {/* If already practiced: Display feedback */}
          {currentPractice ? (
            <div className="space-y-4 animate-fade-in">
              <AIBuddyAvatar
                praiseWord={currentPractice.praise}
                message={currentPractice.encouragingComment}
                state="cheering"
                bubbleColor="from-purple-50 to-pink-50"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pronunciation Card */}
                <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-xs">
                  <div className="flex items-center gap-2 text-purple-800 font-black text-xs uppercase mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Pronunciation Feedback</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    {currentPractice.pronunciationFeedback}
                  </p>
                </div>

                {/* Fluency Card */}
                <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-800 font-black text-xs uppercase mb-1">
                    <Smile className="w-4 h-4 text-indigo-600" />
                    <span>Fluency Feedback</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    {currentPractice.fluencyFeedback}
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Your Recorded Speech: “{currentPractice.studentSpeech}”</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTryAgain}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>TRY AGAIN</span>
                  </button>

                  {currentExpIndex < expressions.length - 1 && (
                    <button
                      onClick={handleNextExpression}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <span>Luyện Câu Tiếp Theo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Voice recorder for this expression */
            <div className="space-y-3">
              <VoiceRecorder
                promptText="Listen to the model audio above, then press record to repeat and practice"
                buttonLabel="Repeat & Record Voice"
                isProcessing={isAnalyzing}
                onRecordingComplete={handleRecordComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Model Answer Reference Card */}
      {material.modelAnswer && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 rounded-3xl p-5 border-2 border-amber-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <h4 className="text-sm sm:text-base font-black text-amber-950 font-heading">
                Đoạn Văn Mẫu Tham Khảo (Model Speaking Presentation)
              </h4>
            </div>
            <button
              onClick={() => speechService.speak(material.modelAnswer)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe Đọc Đoạn Mẫu</span>
            </button>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold italic">
            “{material.modelAnswer}”
          </div>
        </div>
      )}

      {/* Bottom Step Navigation Bar - ALWAYS VISIBLE */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-purple-100 via-indigo-100 to-pink-100 p-4 sm:p-5 rounded-3xl border-2 border-purple-300 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs ${
            practicedCount > 0 ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white'
          }`}>
            {practicedCount > 0 ? '✓' : '💬'}
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-purple-950 font-heading">
              {practicedCount > 0
                ? `Tuyệt Vời! Đã Hoàn Thành Luyện Mẫu Câu (${practicedCount}/${expressions.length})`
                : `Luyện Mẫu Câu (${practicedCount}/${expressions.length}) - Sẵn sàng sang Step 4`}
            </h4>
            <p className="text-xs text-purple-800 font-semibold">
              {practicedCount > 0
                ? 'Em đã sẵn sàng bước vào Step 4 để thực hành hội thoại cùng AI Buddy!'
                : 'Em có thể luyện phát âm từng câu hoặc bấm nút bên phải để chuyển tiếp sang Step 4 bất cứ lúc nào!'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playEncouragementChime();
            onCompleteSection();
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <span>Chuyển Sang Step 4: Thực Hành AI Buddy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Vocabulary Memory Game Modal */}
      <VocabularyGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        material={material}
      />
    </div>
  );
};
