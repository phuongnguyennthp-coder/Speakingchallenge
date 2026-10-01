import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Rewind, Music, Video, Sparkles, Maximize } from 'lucide-react';
import { MediaSourceType } from '../types';

interface MediaPlayerProps {
  sourceType: MediaSourceType;
  url: string;
  caption?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ sourceType, url, caption }) => {
  const isAudio =
    sourceType === 'mp3-upload' ||
    sourceType === 'mp3-url' ||
    url.endsWith('.mp3') ||
    url.endsWith('.wav') ||
    url.endsWith('.m4a') ||
    url.startsWith('data:audio');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn('Audio play failed:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1.0 ? 0.8 : 1.0;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. YouTube Video
  if (sourceType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    let embedUrl = url;
    if (url.includes('watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/').split('&')[0];
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
    }
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200">
        <iframe
          src={embedUrl}
          title="Model Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Google Drive Video or Audio
  if (sourceType === 'drive' || url.includes('drive.google.com')) {
    const previewUrl = url.includes('/view') ? url.replace('/view', '/preview') : url;
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200">
        <iframe src={previewUrl} title="Google Drive Media" className="w-full h-full" allow="autoplay" />
      </div>
    );
  }

  // 3. Audio MP3 Player
  if (isAudio) {
    return (
      <div id="media-player-box" className="w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-purple-900/30 flex flex-col justify-between border-4 border-purple-300/40 relative overflow-hidden">
        {/* Background glow & wave aesthetic */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Header Info */}
        <div className="flex items-center justify-between gap-3 mb-4 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-pink-300 shadow-md">
              <Music className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-pink-300 block">
                Audio Listening Track (MP3)
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
                {caption || 'Lesson Model Audio Presentation'}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSpeed}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-black text-white transition-all cursor-pointer shadow-xs active:scale-95"
              title="Adjust Audio Speed"
            >
              ⚡ {playbackRate === 1.0 ? '1.0x (Normal)' : '0.8x (Slow)'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('media-player-box');
                if (el) {
                  if (!document.fullscreenElement) {
                    el.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }
              }}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white transition-all cursor-pointer shadow-xs active:scale-95"
              title="Toàn màn hình Player"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visualizer Sound Wave Bars */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-16 sm:h-20 my-2 z-10">
          {[8, 14, 22, 35, 48, 28, 55, 38, 62, 42, 30, 50, 64, 38, 54, 32, 46, 24, 16, 10].map((baseHeight, i) => (
            <div
              key={i}
              className={`w-1.5 sm:w-2 rounded-full transition-all duration-150 ${
                isPlaying
                  ? 'bg-gradient-to-t from-pink-400 via-rose-300 to-amber-300 animate-pulse'
                  : 'bg-white/25'
              }`}
              style={{
                height: isPlaying ? `${Math.max(10, (baseHeight * (1 + ((i + Math.floor(currentTime * 3)) % 4) * 0.3)) % 72)}px` : '10px',
              }}
            />
          ))}
        </div>

        {/* Progress Slider */}
        <div className="space-y-1.5 z-10 pt-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-pink-400 hover:accent-pink-300"
          />
          <div className="flex justify-between text-[11px] font-bold text-purple-200">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mt-4 z-10">
          <button
            onClick={() => handleSkip(-5)}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
            title="Rewind 5 seconds"
          >
            <Rewind className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-400 hover:from-pink-600 hover:to-amber-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => handleSkip(5)}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
            title="Forward 5 seconds"
          >
            <FastForward className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 ml-2"
            title="Replay from beginning"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 4. Default Standard Video Player (Uploaded MP4/WebM or Sample Video)
  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200">
      <video
        src={url}
        controls
        playsInline
        className="w-full h-full object-cover rounded-2xl bg-black"
        poster="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80"
      >
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
};
