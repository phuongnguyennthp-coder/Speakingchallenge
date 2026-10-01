/**
 * Speech utilities for E-SMART ENGLISH KIDS:
 * - Text-To-Speech (TTS) with child-friendly pitch and rate
 * - Speech-To-Text (STT) via Web Speech API
 * - Audio Recording via MediaRecorder for playback
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural English voices (US, GB)
    const naturalVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en')) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      this.selectedVoice = naturalVoice;
    }
  }

  /**
   * Speak text in a friendly, encouraging elementary teacher voice
   */
  speak(text: string, onEnd?: () => void, rate = 0.92, pitch = 1.08): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'en-US';
    utterance.rate = rate; // slightly slower for Grade 5 elementary learners
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
  onError?: (error: any) => void
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
    recognition.lang = 'en-US';

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
