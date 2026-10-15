/**
 * Speech utilities for E-SMART ENGLISH KIDS:
 * - Text-To-Speech (TTS) with child-friendly pitch and rate
 * - Support for US (Mỹ), UK (Anh), and AU (Úc) accents
 * - Speech-To-Text (STT) via Web Speech API
 * - Audio Recording via MediaRecorder for playback
 */

export type SpeechAccent = 'en-US' | 'en-GB' | 'en-AU';

export interface AccentOption {
  id: SpeechAccent;
  label: string;
  flag: string;
  shortLabel: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'en-US', label: 'Giọng Mỹ (US)', flag: '🇺🇸', shortLabel: 'US' },
  { id: 'en-GB', label: 'Giọng Anh (UK)', flag: '🇬🇧', shortLabel: 'UK' },
  { id: 'en-AU', label: 'Giọng Úc (AUS)', flag: '🇦🇺', shortLabel: 'AUS' },
];

export function getStoredAccent(): SpeechAccent {
  try {
    const val = localStorage.getItem('esmart_speech_accent');
    if (val === 'en-US' || val === 'en-GB' || val === 'en-AU') {
      return val;
    }
  } catch (_) {}
  return 'en-US';
}

export function setStoredAccent(accent: SpeechAccent): void {
  try {
    localStorage.setItem('esmart_speech_accent', accent);
  } catch (_) {}
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentAccent: SpeechAccent = 'en-US';
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.currentAccent = getStoredAccent();
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAccent(): SpeechAccent {
    return this.currentAccent;
  }

  public setAccent(accent: SpeechAccent): void {
    this.currentAccent = accent;
    setStoredAccent(accent);
  }

  private getVoiceForAccent(accent: SpeechAccent): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      if (this.synth) this.voices = this.synth.getVoices();
    }
    if (!this.voices || this.voices.length === 0) return null;

    // 1. Exact match with natural priority
    const prefix = accent.toLowerCase();
    const naturalVoice = this.voices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-').startsWith(prefix) &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Premium') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Karen'))
    );
    if (naturalVoice) return naturalVoice;

    // 2. Any voice matching accent prefix
    const matchingVoice = this.voices.find((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith(prefix)
    );
    if (matchingVoice) return matchingVoice;

    // 3. Fallback to any English voice
    return this.voices.find((v) => v.lang.startsWith('en')) || null;
  }

  /**
   * Speak text in a friendly, encouraging elementary teacher voice
   */
  speak(text: string, onEnd?: () => void, rate = 0.92, pitch = 1.05): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getVoiceForAccent(this.currentAccent);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = this.currentAccent;
    utterance.rate = rate; // slightly slower for elementary learners
    utterance.pitch = pitch; // cheerful and friendly

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return Boolean(this.synth && this.synth.speaking);
  }
}

export const speechService = new SpeechService();

/**
 * Creates a Speech Recognition instance if supported by the browser
 */
export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (error: any) => void,
  accent?: SpeechAccent
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = accent || getStoredAccent();

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = (final + (interim ? ' ' + interim : '')).trim();
      onResult(text, Boolean(final));
    };

    if (onError) {
      recognition.onerror = (e: any) => {
        // 'no-speech' is common when waiting, don't crash
        if (e.error !== 'no-speech') {
          onError(e);
        }
      };
    }

    return recognition;
  } catch (err) {
    console.warn('Speech recognition not available:', err);
    return null;
  }
}
