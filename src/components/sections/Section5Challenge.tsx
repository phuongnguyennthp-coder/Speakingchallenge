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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-xs">
            SECTION 5
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <span>🎤</span>
            <span>SPEAKING CHALLENGE</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 font-semibold mt-1 max-w-xl">
            Instruction: Use the mindmap as support. Speak for approximately 30–60 seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToolbox(!showToolbox)}
            className="px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-bold border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showToolbox ? 'Hide Useful Expressions' : 'Peek Useful Expressions'}</span>
            {showToolbox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Useful Expressions Peek Drawer */}
      {showToolbox && (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-3xl p-4 sm:p-5 border-2 border-purple-200 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-purple-800">
              💡 Useful Expressions to Include in Your Talk:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {material.usefulExpressions.map((exp) => (
              <div
                key={exp.id}
                className="bg-white p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 flex items-center justify-between"
              >
                <span>“{exp.english}”</span>
                <button
                  type="button"
                  onClick={() => speechService.speak(exp.english)}
                  className="p-1 rounded-lg text-purple-600 hover:bg-purple-50"
                  title="Listen"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mindmap on screen as support while speaking */}
      <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <h3 className="text-base sm:text-lg font-black text-slate-800 font-heading">
              Mindmap Visual Support
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Look at the branches while you speak!
          </span>
        </div>

        {/* Mindmap Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {material.mindmap.branches.map((branch, idx) => (
            <div
              key={branch.id || idx}
              onClick={() => setActiveBranchId(branch.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                activeBranchId === branch.id
                  ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-lg bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-800 font-heading">
                  {branch.title}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {branch.items.join(' • ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Speaking Challenge Recording Controls */}
      <div className="bg-gradient-to-b from-white to-orange-50/50 rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-xl space-y-5">
        <div className="text-center space-y-1">
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold uppercase">
            30–60 Seconds Challenge
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Record Your Full Presentation
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Introduce yourself, mention your key ideas from the mindmap, give reasons, and add your personal choice!
          </p>
        </div>

        {/* Live Timer & Waveform */}
        <div className="flex flex-col items-center justify-center py-2">
          <div
            className={`text-3xl sm:text-4xl font-black font-heading tracking-wider mb-2 ${
              timerSeconds >= 30 && timerSeconds <= 60
                ? 'text-emerald-600'
                : timerSeconds > 60
                ? 'text-amber-600'
                : 'text-slate-800'
            }`}
          >
            ⏱ {formatTime(timerSeconds)}
          </div>

          {/* Animated Waveform bar */}
          <div className="flex items-center gap-1.5 h-10 mb-2">
            {[4, 8, 12, 16, 12, 20, 14, 18, 10, 6, 14, 20, 16, 8].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-200 ${
                  isRecording
                    ? 'bg-gradient-to-t from-orange-500 to-rose-500 animate-pulse'
                    : 'bg-slate-200'
                }`}
                style={{
                  height: isRecording ? `${Math.max(6, (h * (1 + (i % 3))) % 36)}px` : '8px',
                }}
              />
            ))}
          </div>

          {timerSeconds > 0 && timerSeconds < 30 && !isRecording && (
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              * Shorter recordings are accepted! Speak with confidence!
            </span>
          )}
        </div>

        {/* Action Buttons: Start Recording, Stop Recording, Replay Recording, TRY AGAIN */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:from-orange-600 hover:to-rose-600 text-white font-black text-base sm:text-lg shadow-xl shadow-rose-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span>Start Recording (30–60s)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-base sm:text-lg shadow-xl shadow-red-200 transition-all animate-pulse active:scale-95 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Square className="w-5 h-5 text-white fill-current" />
              </div>
              <span>Stop Recording</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-sky-700" />
              <span>Replay Recording</span>
            </button>
          )}

          {(transcript || audioUrl) && !isRecording && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>TRY AGAIN</span>
            </button>
          )}
        </div>

        {/* Live Transcript Preview / Type Speech */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-inner">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Speech Transcript:</span>
            <div className="flex items-center gap-2">
              {transcript && (
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Captured
                </span>
              )}
            </div>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken speech will appear here, or you can type / edit your speech here directly..."
            rows={3}
            className="w-full text-xs sm:text-sm font-semibold text-slate-800 p-2.5 rounded-xl border border-orange-200 focus:outline-none focus:border-orange-400 bg-orange-50/20 italic leading-relaxed"
          />
          <div className="text-[11px] text-slate-400 text-right mt-1">
            * You can speak with the microphone or edit/type your text above before submitting!
          </div>
        </div>

        {/* Submit to AI Feedback */}
        {(transcript.trim().length > 0 || audioUrl) && !isRecording && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-base sm:text-lg shadow-xl shadow-amber-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
              <span>Submit for AI Coach Feedback (Section 6) ⭐</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
