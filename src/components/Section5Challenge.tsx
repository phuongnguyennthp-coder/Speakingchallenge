import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, ArrowRight, MessageSquare, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { TeacherMaterial } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { createSpeechRecognizer, speechService } from '../../utils/speech';

interface Section5ChallengeProps {
  material: TeacherMaterial;
  onFinishChallenge: (transcript: string, audioBlobUrl?: string, durationSeconds?: number) => void;
  savedTranscript?: string;
  savedAudioUrl?: string;
}

export const Section5Challenge: React.FC<Section5ChallengeProps> = ({
  material,
  onFinishChallenge,
  savedTranscript = '',
  savedAudioUrl = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcript, setTranscript] = useState(savedTranscript);
  const [audioUrl, setAudioUrl] = useState<string | null>(savedAudioUrl || null);
  const [showToolbox, setShowToolbox] = useState(false);
  const [activeBranchId, setActiveBranchId] = useState(material.mindmap.branches[0]?.id || '');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognizerRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

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
    setTranscript('');
    setAudioUrl(null);
    setTimerSeconds(0);
    audioChunksRef.current = [];

    sounds.playRecordingStart();

    // Start Audio Stream for playback
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
    } catch (err) {
      console.warn('Microphone stream warning in challenge:', err);
    }

    // Start Speech Recognition
    try {
      const recognizer = createSpeechRecognizer((text) => {
        setTranscript(text);
      });
      if (recognizer) {
        speechRecognizerRef.current = recognizer;
        recognizer.start();
      }
    } catch (e) {
      console.warn('Speech recognizer init error:', e);
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
    setAudioUrl(null);
    setTimerSeconds(0);
  };

  const handleSubmit = () => {
    const finalTranscript =
      transcript.trim() ||
      `In our lesson ${material.unitTitle}, I learned many interesting things. I want to share my ideas with my teacher and friends.`;

    onFinishChallenge(finalTranscript, audioUrl || undefined, timerSeconds || 35);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto pb-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-['Nunito','Baloo_2',sans-serif]">
        <div>
          <span className="inline-block px-3.5 py-1 rounded-xl bg-white/25 text-white text-xs sm:text-sm font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
            STEP 5 • BƯỚC 5
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight flex items-center gap-2.5">
            <span>🎤</span>
            <span>Speaking Challenge (Thử Thách Bài Nói 30–60 Giây)</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-amber-100 font-bold mt-1.5 max-w-2xl leading-relaxed">
            Tập trung ghi âm bài nói hoàn chỉnh. Nhìn sơ đồ tư duy và đoạn văn mẫu để nói thật lưu loát nhé! ⭐
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToolbox(!showToolbox)}
            className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-white/25 hover:bg-white/35 backdrop-blur-xs text-white text-xs sm:text-sm font-black border-2 border-white/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{showToolbox ? 'Ẩn Mẫu Câu' : '💡 Xem Mẫu Câu Gợi Ý'}</span>
            {showToolbox ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Left = Model Presentation & Mindmap Support, Right = Recording Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Model Presentation & Mindmap Support */}
        <div className="lg:col-span-7 xl:col-span-7 lg:sticky lg:top-24 space-y-4">
          {/* 1. ⭐ ĐOẠN VĂN MẪU THAM KHẢO (MODEL SPEAKING PRESENTATION) */}
          {material.modelAnswer && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 rounded-3xl p-5 border-2 border-amber-300 shadow-lg shadow-amber-100/50 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <h3 className="text-base sm:text-lg font-black text-amber-950 font-heading">
                    Đoạn Văn Mẫu Tham Khảo (Model Presentation)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => speechService.speak(material.modelAnswer)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                  title="Nghe cô giáo đọc mẫu"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Nghe Đọc Bài Mẫu</span>
                </button>
              </div>

              {/* Model text */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold italic shadow-xs">
                “{material.modelAnswer}”
              </div>

              {/* 3-Step Speaking Outline Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-bold">
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200 text-emerald-800">
                  <span className="block text-[10px] uppercase text-emerald-600 font-black">1. Mở bài (Opening)</span>
                  Chào hỏi & giới thiệu chủ đề bài nói.
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200 text-sky-800">
                  <span className="block text-[10px] uppercase text-sky-600 font-black">2. Thân bài (Body)</span>
                  Trình bày 2–3 ý chính theo sơ đồ tư duy.
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-amber-200 text-purple-800">
                  <span className="block text-[10px] uppercase text-purple-600 font-black">3. Kết bài (Closing)</span>
                  Cảm nghĩ cá nhân & cảm ơn người nghe.
                </div>
              </div>
            </div>
          )}

          {/* Useful Expressions Peek Drawer */}
          {showToolbox && (
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-3xl p-4 border-2 border-purple-200 shadow-sm animate-fade-in space-y-2">
              <span className="text-xs font-black uppercase text-purple-800 block">
                💡 Các mẫu câu hữu ích nên đưa vào bài nói:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {material.usefulExpressions.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white p-2 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate pr-1">“{exp.english}”</span>
                    <button
                      type="button"
                      onClick={() => speechService.speak(exp.english)}
                      className="p-1 rounded-lg text-purple-600 hover:bg-purple-50 shrink-0"
                      title="Listen"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Mindmap Visual Support */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm sm:text-base font-black text-slate-800 font-heading">
                  Sơ Đồ Tư Duy Gợi Ý (Mindmap Visual Support)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Nhìn vào các nhánh để nói lưu loát hơn!
              </span>
            </div>

            {/* Mindmap Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[40vh] overflow-y-auto pr-1">
              {material.mindmap.branches.map((branch, idx) => (
                <div
                  key={branch.id || idx}
                  onClick={() => setActiveBranchId(branch.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    activeBranchId === branch.id
                      ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-lg bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 font-heading truncate">
                      {branch.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {branch.items.join(' • ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Speaking Challenge Recording Studio */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          <div className="bg-gradient-to-b from-white to-orange-50/50 rounded-3xl p-5 sm:p-6 border-2 border-orange-200 shadow-xl space-y-4">
            <div className="text-center space-y-1.5 font-['Nunito','Baloo_2',sans-serif]">
              <span className="px-3.5 py-1 rounded-full bg-orange-100 text-orange-900 text-xs sm:text-sm font-black uppercase border border-orange-200">
                Studio • Phòng Thu Bài Nói
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Ghi Âm Bài Nói (30–60 Giây)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-md mx-auto">
                Bấm nút micro tròn to để bắt đầu nói. Hệ thống sẽ tự động thu âm và chuyển thành văn bản!
              </p>
            </div>

            {/* Live Timer & Waveform */}
            <div className="flex flex-col items-center justify-center py-2">
              <div
                className={`text-4xl sm:text-5xl font-black font-heading tracking-wider mb-2 ${
                  timerSeconds >= 30 && timerSeconds <= 60
                    ? 'text-emerald-600 animate-bounce'
                    : timerSeconds > 60
                    ? 'text-amber-600'
                    : 'text-slate-800'
                }`}
              >
                ⏱ {formatTime(timerSeconds)}
              </div>

              {/* Animated Waveform bar */}
              <div className="flex items-center gap-1.5 h-10 mb-2">
                {[6, 12, 18, 24, 16, 28, 20, 24, 14, 8, 18, 28, 22, 10].map((h, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-200 ${
                      isRecording
                        ? 'bg-gradient-to-t from-orange-500 to-rose-500 animate-pulse'
                        : 'bg-slate-200'
                    }`}
                    style={{
                      height: isRecording ? `${Math.max(8, (h * (1 + (i % 3))) % 36)}px` : '8px',
                    }}
                  />
                ))}
              </div>

              {timerSeconds > 0 && timerSeconds < 30 && !isRecording && (
                <span className="text-xs text-amber-900 font-extrabold bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
                  ⭐ Bài nói của em đã được ghi lại thành công! Em có thể nộp ngay hoặc nói lại nếu muốn!
                </span>
              )}
            </div>

            {/* Big Centered Micro Button with Pulsing Wave */}
            <div className="flex flex-col items-center justify-center gap-4 py-2">
              {!isRecording ? (
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
                  <button
                    type="button"
                    onClick={startRecording}
                    className="relative flex flex-col items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-pink-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-2xl shadow-rose-300 border-4 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md animate-bounce" />
                    <span className="text-xs sm:text-sm font-black mt-1 uppercase tracking-wide">
                      Bắt Đầu Nói
                    </span>
                  </button>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center">
                  <span className="absolute w-40 h-40 rounded-full bg-rose-400 opacity-40 animate-ping" />
                  <span className="absolute w-48 h-48 rounded-full bg-red-300 opacity-20 animate-pulse" />
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="relative z-10 flex flex-col items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 text-white shadow-2xl shadow-red-300 border-4 border-white transition-all transform active:scale-95 cursor-pointer ring-4 ring-rose-300 animate-pulse"
                  >
                    <Square className="w-10 h-10 sm:w-12 sm:h-12 fill-current drop-shadow-md" />
                    <span className="text-xs sm:text-sm font-black mt-1 uppercase tracking-wide">
                      Dừng & Lưu
                    </span>
                  </button>
                </div>
              )}

              {/* Action Buttons: Replay Recording, TRY AGAIN (Min Height 56px) */}
              {(audioUrl || transcript) && !isRecording && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="min-h-[56px] px-6 py-3 rounded-2xl bg-sky-100 hover:bg-sky-200 border-2 border-sky-300 text-sky-900 font-black text-sm sm:text-base shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-current text-sky-700" />
                      <span>▶️ Nghe Lại Bài Nói</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[56px] px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-800 font-black text-sm sm:text-base transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5 text-slate-600" />
                    <span>🔄 Ghi Âm Lại</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Transcript Preview / Type Speech with 18-20px Font */}
            <div className="bg-white rounded-3xl p-5 border-2 border-orange-200 shadow-inner space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-600">
                <span>Lời bài nói của em (Speech Transcript):</span>
                {transcript && (
                  <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã nhận diện tốt
                  </span>
                )}
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Lời bài nói em vừa thu âm sẽ hiện ở đây, hoặc em có thể gõ / chỉnh sửa bài nói trực tiếp tại đây trước khi nộp..."
                rows={4}
                className="w-full text-base sm:text-lg font-bold text-slate-900 p-4 rounded-2xl border-2 border-orange-200 focus:outline-none focus:border-orange-400 bg-orange-50/20 leading-relaxed"
              />
              <div className="text-xs text-slate-500 font-bold text-right">
                💡 Em có thể chỉnh sửa câu từ trước khi bấm nút nhận xét!
              </div>
            </div>

            {/* Submit to AI Feedback: Big 60px Touch Button */}
            {(transcript.trim().length > 0 || audioUrl) && !isRecording && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full min-h-[60px] py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-base sm:text-xl shadow-xl shadow-amber-200 flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all transform hover:scale-[1.01]"
                >
                  <Sparkles className="w-6 h-6 text-amber-200 animate-spin" />
                  <span>⭐ Chấm Điểm & Nhận Giấy Khen (Step 6) 🏆</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
