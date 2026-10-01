import React from 'react';
import { Volume2, Sparkles, Smile, MessageCircle } from 'lucide-react';
import { speechService } from '../utils/speech';

interface AIBuddyAvatarProps {
  message?: string;
  praiseWord?: string;
  state?: 'idle' | 'speaking' | 'listening' | 'cheering';
  showSpeechBubble?: boolean;
  onAudioPlay?: () => void;
  bubbleColor?: string;
}

export const AIBuddyAvatar: React.FC<AIBuddyAvatarProps> = ({
  message,
  praiseWord,
  state = 'idle',
  showSpeechBubble = true,
  onAudioPlay,
  bubbleColor = 'from-amber-50 to-pink-50',
}) => {
  const handlePlayVoice = () => {
    if (message) {
      speechService.speak(message);
    }
    if (onAudioPlay) onAudioPlay();
  };

  return (
    <div className="flex items-start gap-3 sm:gap-4 my-2">
      {/* Avatar Mascot Container */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-400 to-purple-500 p-1 shadow-lg shadow-rose-200/60 transition-transform ${
            state === 'cheering' ? 'animate-bounce' : state === 'listening' ? 'scale-105' : ''
          }`}
        >
          {/* Owl mascot face illustration */}
          <div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-amber-200/50">
            {/* Cute ears */}
            <div className="absolute -top-1 left-2 w-3 h-3 bg-amber-400 rounded-sm rotate-45" />
            <div className="absolute -top-1 right-2 w-3 h-3 bg-amber-400 rounded-sm rotate-45" />

            {/* Owl eyes */}
            <div className="flex items-center gap-1.5 z-10">
              <div className="w-4 h-4 bg-sky-100 rounded-full border border-sky-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-950 rounded-full flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-white rounded-full translate-x-[-1px] translate-y-[-1px]" />
                </div>
              </div>
              <div className="w-4 h-4 bg-sky-100 rounded-full border border-sky-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-950 rounded-full flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-white rounded-full translate-x-[-1px] translate-y-[-1px]" />
                </div>
              </div>
            </div>

            {/* Beak */}
            <div className="w-2.5 h-2 bg-amber-500 rounded-b-md -mt-0.5 z-10" />

            {/* Cheerful rosy cheeks */}
            <div className="flex items-center justify-between w-9 px-0.5 -mt-1 z-0">
              <div className="w-2 h-1 bg-pink-300 rounded-full opacity-80" />
              <div className="w-2 h-1 bg-pink-300 rounded-full opacity-80" />
            </div>

            {/* Graduation/Coach Cap */}
            <div className="absolute top-0 w-8 h-1.5 bg-indigo-700 rounded-t-sm" />
            <div className="absolute top-1 -right-0.5 w-1.5 h-2.5 bg-amber-400 rounded-xs" />
          </div>
        </div>

        {/* Mascot Name Badge */}
        <span className="mt-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
          AI Coach
        </span>
      </div>

      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <div
          className={`flex-1 relative bg-gradient-to-br ${bubbleColor} border-2 border-amber-200/90 rounded-3xl p-3.5 sm:p-4 shadow-md shadow-amber-100/50 text-slate-800 transition-all`}
        >
          {/* Triangular tail */}
          <div className="absolute -left-2.5 top-4 w-4 h-4 bg-amber-50 border-l-2 border-b-2 border-amber-200 rotate-45" />

          {/* Header with Praise Word and Audio button */}
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              {praiseWord && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-amber-200 text-amber-900 font-extrabold text-xs sm:text-sm tracking-wide shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  {praiseWord}
                </span>
              )}
            </div>

            <button
              onClick={handlePlayVoice}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
              title="Listen to AI Buddy"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Listen</span>
            </button>
          </div>

          {/* Message Text */}
          <p className="text-sm sm:text-base font-bold text-slate-700 leading-relaxed font-sans">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};
