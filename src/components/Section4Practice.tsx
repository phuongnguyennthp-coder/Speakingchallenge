import React, { useState } from 'react';
import { Bot, Volume2, CheckCircle2, RotateCcw, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { TeacherMaterial, BuddyConversationTurn } from '../../types';
import { VoiceRecorder } from '../VoiceRecorder';
import { AIBuddyAvatar } from '../AIBuddyAvatar';
import { sounds } from '../../utils/soundEffects';
import { speechService } from '../../utils/speech';
import { aiBuddyChat, hasValidApiKey } from '../../utils/geminiClient';

interface Section4PracticeProps {
  material: TeacherMaterial;
  onCompleteSection: () => void;
  onUnlockNext?: () => void;
}

export const Section4Practice: React.FC<Section4PracticeProps> = ({
  material,
  onCompleteSection,
  onUnlockNext,
}) => {
  const levels = material.practiceLevels;
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [turns, setTurns] = useState<Record<number, BuddyConversationTurn>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentLevel = levels[currentLevelIdx] || levels[0];
  const currentTurn = currentLevel ? turns[currentLevel.levelNumber] : undefined;

  const handleVoiceAnswer = async (transcript: string) => {
    if (!currentLevel) return;
    setIsAnalyzing(true);

    try {
      let data: any = null;

      if (hasValidApiKey()) {
        try {
          data = await aiBuddyChat(currentLevel.levelNumber, currentLevel.buddyPrompt, transcript);
        } catch (clientErr) {
          console.warn('Client AI buddy chat error:', clientErr);
        }
      }

      if (!data) {
        const res = await fetch('/api/ai/buddy-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            levelNumber: currentLevel.levelNumber,
            levelTitle: currentLevel.levelName,
            currentPrompt: currentLevel.buddyPrompt,
            studentAnswer: transcript,
            materialTopic: material.unitTitle,
            materialContext: `${material.video.transcript}. Branches: ${material.mindmap.branches
              .map((b) => b.title)
              .join(', ')}`,
          }),
        });
        if (res.ok) data = await res.json();
      }

      sounds.playPraiseChime();

      const newTurn: BuddyConversationTurn = {
        levelNumber: currentLevel.levelNumber,
        levelTitle: currentLevel.levelName,
        prompt: currentLevel.buddyPrompt,
        studentSpeech: transcript,
        praiseWord: data.praiseWord || 'Great answer!',
        supportiveComment: data.supportiveComment || 'You shared your ideas so clearly!',
        buddyReply: data.buddyReply || 'Well done! Keep speaking up!',
        isCompleted: true,
      };

      setTurns((prev) => ({
        ...prev,
        [currentLevel.levelNumber]: newTurn,
      }));

      if (onUnlockNext) {
        onUnlockNext();
      }

      // Speak buddy feedback
      speechService.speak(`${data.praiseWord || 'Great answer!'} ${data.buddyReply || ''}`);
    } catch (err) {
      console.warn('Backend buddy chat fallback:', err);
      sounds.playPraiseChime();
      const fallbackTurn: BuddyConversationTurn = {
        levelNumber: currentLevel.levelNumber,
        levelTitle: currentLevel.levelName,
        prompt: currentLevel.buddyPrompt,
        studentSpeech: transcript,
        praiseWord: 'Well done!',
        supportiveComment: `You answered: "${transcript}". Excellent effort!`,
        buddyReply: `I like your idea! You are speaking English with wonderful confidence!`,
        isCompleted: true,
      };
      setTurns((prev) => ({
        ...prev,
        [currentLevel.levelNumber]: fallbackTurn,
      }));
      if (onUnlockNext) {
        onUnlockNext();
      }
      speechService.speak(`Well done! I like your idea!`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryAgain = () => {
    if (!currentLevel) return;
    setTurns((prev) => {
      const copy = { ...prev };
      delete copy[currentLevel.levelNumber];
      return copy;
    });
  };

  const allCompleted = levels.every((lvl) => turns[lvl.levelNumber]?.isCompleted);

  const getLevelColor = (num: number) => {
    switch (num) {
      case 1:
        return 'from-blue-500 to-cyan-500';
      case 2:
        return 'from-emerald-500 to-teal-500';
      case 3:
        return 'from-amber-500 to-orange-500';
      case 4:
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-indigo-500 to-purple-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-['Nunito','Baloo_2',sans-serif]">
        <div>
          <span className="inline-block px-3.5 py-1 rounded-xl bg-white/25 text-white text-xs sm:text-sm font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
            STEP 4 • BƯỚC 4
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight flex items-center gap-2.5">
            <span>🤖</span>
            <span>Practice with AI Buddy (Luyện Cùng AI)</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-indigo-100 font-bold mt-1.5 max-w-2xl leading-relaxed">
            Trò chuyện 4 cấp độ cùng bạn AI thân thiện. Đừng ngại sai, hãy nói thật tự nhiên nhé! ⭐
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/25 backdrop-blur-xs px-5 py-3 rounded-2xl border-2 border-white/30 text-sm sm:text-base font-black text-white shrink-0">
          <Bot className="w-6 h-6 text-amber-300" />
          <span>Level {currentLevelIdx + 1} / 4 ⭐</span>
        </div>
      </div>

      {/* 4 Levels Stepper Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {levels.map((lvl, idx) => {
          const isCurrent = idx === currentLevelIdx;
          const isDone = turns[lvl.levelNumber]?.isCompleted;

          return (
            <button
              key={lvl.levelNumber}
              onClick={() => {
                setCurrentLevelIdx(idx);
                sounds.playEncouragementChime();
              }}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200 scale-[1.02]'
                  : isDone
                  ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                  Level {lvl.levelNumber}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <p className="text-xs font-black text-slate-800 font-heading truncate">
                {lvl.levelName}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Conversation Level Card */}
      {currentLevel && (
        <div className="bg-gradient-to-b from-white to-indigo-50/30 rounded-3xl p-5 sm:p-7 border-2 border-indigo-200 shadow-lg space-y-5">
          {/* AI Teacher Speaking Bubble */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-5 sm:p-6 border-2 border-indigo-200 shadow-sm flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
              <Bot className="w-8 h-8" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-black text-indigo-800 bg-white px-3 py-1 rounded-xl border border-indigo-200 uppercase shadow-2xs">
                  LEVEL {currentLevel.levelNumber} • {currentLevel.levelName}
                </span>

                <button
                  onClick={() => speechService.speak(currentLevel.buddyPrompt)}
                  className="p-2 rounded-xl bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer shadow-xs"
                  title="Nghe câu hỏi của bạn AI"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 font-heading leading-snug">
                “{currentLevel.buddyPrompt}”
              </h3>

              {currentLevel.options && currentLevel.options.length > 0 && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-500">Gợi ý từ ngữ:</span>
                  {currentLevel.options.map((opt) => (
                    <span
                      key={opt}
                      className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-900 font-black text-xs sm:text-sm border border-indigo-300"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs sm:text-sm text-indigo-900 font-bold bg-white/70 p-2.5 rounded-xl border border-indigo-100 inline-block">
                💡 Gợi ý trả lời: {currentLevel.hint}
              </p>
            </div>
          </div>

          {/* Turn Feedback or Voice Recorder */}
          {currentTurn ? (
            <div className="space-y-4 animate-fade-in">
              <AIBuddyAvatar
                praiseWord={currentTurn.praiseWord}
                message={currentTurn.buddyReply}
                state="cheering"
                bubbleColor="from-indigo-50 to-purple-50"
              />

              <div className="bg-white rounded-3xl p-5 border-2 border-indigo-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2 text-indigo-950 font-black">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Your Spoken Answer: “{currentTurn.studentSpeech}”</span>
                  </div>

                  <button
                    onClick={handleTryAgain}
                    className="min-h-[48px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>🔄 Luyện lại</span>
                  </button>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-3.5 text-sm sm:text-base text-emerald-950 font-bold border border-emerald-200">
                  ⭐ Lời nhận xét: {currentTurn.supportiveComment}
                </div>
              </div>

              {currentLevelIdx < levels.length - 1 ? (
                <div className="flex items-center justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => setCurrentLevelIdx(currentLevelIdx + 1)}
                    className="min-h-[52px] px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Sang Level {currentLevelIdx + 2} ➡️</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      sounds.playEncouragementChime();
                      onCompleteSection();
                    }}
                    className="min-h-[52px] px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 font-black text-sm sm:text-base flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Sang Step 5 🎤</span>
                  </button>
                </div>
              ) : (
                <div className="text-right">
                  <button
                    onClick={() => {
                      sounds.playCelebrationFanfare();
                      onCompleteSection();
                    }}
                    className="min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-black text-base sm:text-lg shadow-xl shadow-amber-200 flex items-center gap-2 cursor-pointer active:scale-95 ml-auto transition-all animate-pulse"
                  >
                    <span>⭐ Hoàn Thành & Tiến Vào Step 5: Thử Thách Bài Nói 🎤</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <VoiceRecorder
                promptText={`Level ${currentLevel.levelNumber}: Nói câu trả lời thật tự nhiên nhé`}
                buttonLabel="Bấm Để Nói"
                isProcessing={isAnalyzing}
                onRecordingComplete={handleVoiceAnswer}
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-6 pt-5 border-t border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-100 via-purple-100 to-amber-100 p-5 rounded-3xl border-2 border-indigo-300 shadow-md font-['Nunito','Baloo_2',sans-serif]">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${
            allCompleted ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
          }`}>
            {allCompleted ? '✓' : '🤖'}
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-indigo-950 font-heading">
              {allCompleted ? 'Tuyệt Vời! Đã Hoàn Thành Cả 4 Cấp Độ Luyện Nói! ⭐' : `Luyện Tập Hội Thoại Cùng AI`}
            </h4>
            <p className="text-xs sm:text-sm text-indigo-900 font-bold">
              {allCompleted ? 'Em đã sẵn sàng bước vào bài thử thách nói chính thức ở Step 5!' : 'Em có thể luyện tiếp hoặc bấm nút bên phải để bước vào Step 5 Speaking Challenge bất cứ lúc nào.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playEncouragementChime();
            onCompleteSection();
          }}
          className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-black text-sm sm:text-base shadow-lg shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <span>⭐ Tiến Vào Step 5: Thử Thách Bài Nói 🎤</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
