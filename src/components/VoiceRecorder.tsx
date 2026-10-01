import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Edit3, Check, AlertCircle, Keyboard } from 'lucide-react';
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
  promptText = 'Press the microphone to record your voice or type below',
  initialTranscript = '',
  buttonLabel = 'Record Voice',
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
      console.warn('Microphone stream error, fallback to speech recognition/typing:', err);
      setMicError('Microphone permission needed. You can easily type your answer in the tab below!');
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

  const hasAnswer = activeTab === 'type' ? typedAnswer.trim().length > 0 : transcript.trim().length > 0 || audioUrl;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-pink-100 shadow-md shadow-pink-50 flex flex-col gap-3">
      {/* Mode Switch Tabs: 🎙️ Voice vs ⌨️ Type */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <span className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1.5 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          {promptText}
        </span>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'type'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Type</span>
          </button>
        </div>
      </div>

      {micError && activeTab === 'voice' && (
        <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl p-2.5 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* TAB 1: VOICE RECORDING CONTROLS */}
      {activeTab === 'voice' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-2">
            {!isRecording ? (
              <button
                type="button"
                disabled={isProcessing}
                onClick={startRecording}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-pink-200 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span>{buttonLabel}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-red-200 transition-all animate-pulse active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Square className="w-4 h-4 text-white fill-current" />
                </div>
                <span>Stop Recording ({formatTime(timerSeconds)})</span>
              </button>
            )}

            {/* Replay voice button */}
            {audioUrl && !isRecording && (
              <button
                type="button"
                onClick={handleReplay}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Replay what you said"
              >
                <Play className="w-4 h-4 fill-current text-sky-600" />
                <span>Replay Voice</span>
              </button>
            )}

            {/* Try Again / Reset button */}
            {(transcript || audioUrl) && !isRecording && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
                title="Try again"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>TRY AGAIN</span>
              </button>
            )}
          </div>

          {/* Transcript Area */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500">What you said:</span>
            <p className="text-sm font-bold text-slate-800 italic min-h-[32px] flex items-center">
              {transcript ? (
                `“${transcript}”`
              ) : (
                <span className="text-slate-400 not-italic font-normal text-xs">
                  {isRecording
                    ? 'Listening to your voice... Speak now! 🎙️'
                    : 'Press the microphone to speak your response!'}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: TYPE ANSWER */}
      {activeTab === 'type' && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your answer in English here... (e.g., I would like to be an English teacher because...)"
              rows={3}
              className="w-full text-sm font-semibold p-3.5 rounded-2xl border-2 border-indigo-200 focus:outline-none focus:border-indigo-500 bg-indigo-50/20 text-slate-800 leading-relaxed shadow-inner"
            />
            {typedAnswer && (
              <button
                type="button"
                onClick={() => setTypedAnswer('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>💡 Tip: Write what you learned from the video or mindmap.</span>
            <span>{typedAnswer.length} characters</span>
          </div>
        </div>
      )}

      {/* Check Answer with AI Buddy Button */}
      {hasAnswer && !isRecording && (
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm sm:text-base shadow-md shadow-emerald-200 transition-all active:scale-[0.98] cursor-pointer"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>AI Buddy is checking your answer...</span>
            </div>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Check Answer with AI Buddy ⭐</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
