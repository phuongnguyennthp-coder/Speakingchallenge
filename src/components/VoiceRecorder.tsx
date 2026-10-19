import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Check, AlertCircle, Keyboard, Sparkles, Volume2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { createSpeechRecognizer } from '../utils/speech';

interface VoiceRecorderProps {
  onRecordingComplete: (transcript: string, audioBlobUrl?: string) => void;
  isProcessing?: boolean;
  promptText?: string;
  minDurationSeconds?: number;
  initialTranscript?: string;
  buttonLabel?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isProcessing = false,
  promptText = 'Tap the big microphone to speak (Bấm micro để nói)',
  initialTranscript = '',
  buttonLabel = 'Tap to Speak',
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'type'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognizerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (initialTranscript) {
      setTranscript(initialTranscript);
    }
  }, [initialTranscript]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (_) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    setTranscript('');
    setAudioUrl(null);
    setTimerSeconds(0);

    sounds.playRecordingStart();

    // Start Audio MediaRecorder for voice playback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err: any) {
      console.warn('Microphone permission or stream error:', err);
      setMicError('Vui lòng cho phép quyền truy cập Micro trên trình duyệt, hoặc em có thể chọn tab Gõ chữ (Type)!');
    }

    // Start Speech Recognition
    try {
      const recognizer = createSpeechRecognizer(
        (text) => {
          setTranscript(text);
        },
        (err) => {
          console.warn('Speech recognizer error:', err);
        }
      );

      if (recognizer) {
        speechRecognizerRef.current = recognizer;
        recognizer.start();
      }
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
    }

    setIsRecording(true);

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    sounds.playRecordingStop();
    setIsRecording(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.stop();
      } catch (_) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleReplay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleReset = () => {
    setTranscript('');
    setTypedAnswer('');
    setAudioUrl(null);
    setTimerSeconds(0);
  };

  const handleSubmit = () => {
    const finalSpeech =
      activeTab === 'type'
        ? typedAnswer.trim() || 'I typed my answer.'
        : transcript.trim() || 'I answered the question.';
    onRecordingComplete(finalSpeech, audioUrl || undefined);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hasAnswer =
    activeTab === 'type' ? typedAnswer.trim().length > 0 : transcript.trim().length > 0 || audioUrl;

  return (
    <div className="bg-gradient-to-b from-white via-amber-50/30 to-sky-50/30 rounded-3xl p-5 sm:p-6 border-3 border-amber-200/80 shadow-lg shadow-amber-100/50 flex flex-col gap-4 font-['Nunito','Baloo_2',sans-serif]">
      {/* Top Header / Mode Switch Tabs: 🎙️ Voice vs ⌨️ Type */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-amber-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="text-base sm:text-lg font-black text-slate-800">
            {promptText}
          </h4>
        </div>

        {/* Dual Mode Switch: Large Touch Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200 scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>🎤 Voice (Nói)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'type'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>⌨️ Type (Gõ)</span>
          </button>
        </div>
      </div>

      {micError && activeTab === 'voice' && (
        <div className="bg-amber-100/80 text-amber-950 border-2 border-amber-300 rounded-2xl p-3 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* TAB 1: VOICE RECORDING WITH BIG CENTER MIC */}
      {activeTab === 'voice' && (
        <div className="flex flex-col items-center justify-center gap-4 py-2">
          {/* Centered Large Pulse Micro Button */}
          <div className="flex flex-col items-center justify-center gap-3">
            {!isRecording ? (
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={startRecording}
                  className="relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 hover:from-pink-600 hover:to-amber-500 text-white shadow-xl shadow-pink-300 border-4 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Bấm để bắt đầu nói"
                >
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md animate-bounce" />
                  <span className="text-xs sm:text-sm font-black mt-1 uppercase tracking-wide">
                    {buttonLabel}
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center">
                {/* Pulsing ripples during recording */}
                <span className="absolute w-36 h-36 rounded-full bg-rose-400 opacity-40 animate-ping" />
                <span className="absolute w-44 h-44 rounded-full bg-red-300 opacity-20 animate-pulse" />
                <button
                  type="button"
                  onClick={stopRecording}
                  className="relative z-10 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-2xl shadow-red-300 border-4 border-white transition-all transform active:scale-95 cursor-pointer ring-4 ring-rose-300 animate-pulse"
                  title="Bấm để dừng ghi âm"
                >
                  <Square className="w-8 h-8 sm:w-10 sm:h-10 fill-current drop-shadow-md" />
                  <span className="text-xs sm:text-sm font-black mt-1 uppercase tracking-wide">
                    Stop (Dừng)
                  </span>
                </button>
              </div>
            )}

            {/* Status / Timer Indicator */}
            <div className="text-center">
              {isRecording ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 font-black text-sm sm:text-base animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span>Listening... (Đang lắng nghe: {formatTime(timerSeconds)})</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Nói to, rõ ràng vào micro của em nhé! 🎙️
                  </span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm font-bold text-slate-500">
                  {audioUrl || transcript
                    ? 'Đã thu âm xong! Em có thể nghe lại hoặc gửi cho AI chấm điểm bên dưới.'
                    : 'Bấm nút tròn micro màu hồng ở trên để bắt đầu nói.'}
                </div>
              )}
            </div>
          </div>

          {/* Replay and Try Again Action Buttons (Min height 56px) */}
          {(audioUrl || transcript) && !isRecording && (
            <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-1">
              {audioUrl && (
                <button
                  type="button"
                  onClick={handleReplay}
                  className="min-h-[56px] px-5 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 font-extrabold text-sm sm:text-base shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  title="Nghe lại giọng nói của em"
                >
                  <Play className="w-5 h-5 fill-current text-sky-600" />
                  <span>▶️ Replay Voice (Nghe lại giọng em)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="min-h-[56px] px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 font-extrabold text-sm sm:text-base transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                title="Ghi âm lại từ đầu"
              >
                <RotateCcw className="w-5 h-5 text-slate-600" />
                <span>🔄 Try Again (Nói lại)</span>
              </button>
            </div>
          )}

          {/* Transcript Display Box with Large Readable 18px Font */}
          <div className="w-full bg-white border-2 border-amber-200 rounded-2xl p-4 sm:p-5 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-600">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>What you said (Lời em vừa nói):</span>
              </span>
              {transcript && (
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-lg text-xs">
                  ✓ Nhận diện tốt
                </span>
              )}
            </div>

            <p className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-relaxed min-h-[44px] flex items-center">
              {transcript ? (
                <span className="text-indigo-950 font-black italic">“{transcript}”</span>
              ) : (
                <span className="text-slate-400 not-italic font-semibold text-sm sm:text-base">
                  {isRecording
                    ? 'AI đang nghe em nói... Hãy phát âm to và rõ nhé! 🎙️'
                    : 'Chưa có âm thanh. Hãy bấm nút micro phía trên để nói.'}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: TYPE ANSWER WITH COMFORTABLE FONT */}
      {activeTab === 'type' && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Gõ câu trả lời bằng tiếng Anh vào đây... (Ví dụ: I would like to be an English teacher because I love teaching kids...)"
              rows={3}
              className="w-full text-base sm:text-lg font-bold p-4 rounded-2xl border-2 border-indigo-200 focus:outline-none focus:border-indigo-500 bg-indigo-50/20 text-slate-900 leading-relaxed shadow-inner"
            />
            {typedAnswer && (
              <button
                type="button"
                onClick={() => setTypedAnswer('')}
                className="absolute right-3 top-3 px-2 py-1 rounded-lg bg-slate-200 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-bold"
              >
                Xóa
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-bold">
            <span>💡 Gợi ý: Gõ lại những từ hoặc mẫu câu em đã học ở bài này.</span>
            <span>{typedAnswer.length} ký tự</span>
          </div>
        </div>
      )}

      {/* Big Submit Button: Height >= 56px, rounded-2xl, vibrant colors */}
      {hasAnswer && !isRecording && (
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleSubmit}
          className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span>AI Buddy is checking your answer... (Đang kiểm tra...)</span>
            </div>
          ) : (
            <>
              <Check className="w-6 h-6 stroke-[3]" />
              <span>⭐ Check Answer with AI Buddy (Gửi bài kiểm tra)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
