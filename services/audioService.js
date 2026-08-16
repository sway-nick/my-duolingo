class AudioServiceImpl {
  constructor() {
    this.context = null;
    this.isMutedState = this.loadMuteState();
    this.volume = this.loadVolume();
    this.synth = window.speechSynthesis;
    this.voice = null;
  }

  loadMuteState() {
    const settings = localStorage.getItem('duolingo-sound-settings');
    if (settings) {
      try {
        return JSON.parse(settings).muted || false;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  loadVolume() {
    const settings = localStorage.getItem('duolingo-sound-settings');
    if (settings) {
      try {
        return JSON.parse(settings).volume ?? 0.5;
      } catch (e) {
        return 0.5;
      }
    }
    return 0.5;
  }

  saveSettings() {
    localStorage.setItem('duolingo-sound-settings', JSON.stringify({
      muted: this.isMutedState,
      volume: this.volume
    }));
  }

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    this.loadVoices();
  }

  loadVoices() {
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      this.voice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) 
                   || voices.find(v => v.lang.startsWith('en-US')) 
                   || voices.find(v => v.lang.startsWith('en')) 
                   || voices[0];
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  playOscillator(freq, type, duration, startTime, volMultiplier = 1) {
    if (!this.context) this.init();
    if (this.isMutedState) return;
    
    const osc = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * volMultiplier, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playCorrect() {
    if (this.isMutedState) return;
    this.init();
    const now = this.context.currentTime;
    this.playOscillator(523.25, 'sine', 0.15, now); // C5
    this.playOscillator(659.25, 'sine', 0.3, now + 0.15); // E5
  }

  playWrong() {
    if (this.isMutedState) return;
    this.init();
    const now = this.context.currentTime;
    this.playOscillator(329.63, 'square', 0.1, now, 0.3); // E4
    this.playOscillator(261.63, 'square', 0.2, now + 0.1, 0.3); // C4
  }

  playClick() {
    if (this.isMutedState) return;
    this.init();
    const now = this.context.currentTime;
    this.playOscillator(1000, 'triangle', 0.03, now, 0.2);
  }

  playComplete() {
    if (this.isMutedState) return;
    this.init();
    const now = this.context.currentTime;
    this.playOscillator(523.25, 'sine', 0.12, now); // C5
    this.playOscillator(659.25, 'sine', 0.12, now + 0.12); // E5
    this.playOscillator(783.99, 'sine', 0.12, now + 0.24); // G5
    this.playOscillator(1046.50, 'sine', 0.4, now + 0.36); // C6
  }

  playLevelUp() {
    if (this.isMutedState) return;
    this.init();
    const now = this.context.currentTime;
    this.playOscillator(261.63, 'sine', 0.1, now); // C4
    this.playOscillator(329.63, 'sine', 0.1, now + 0.1); // E4
    this.playOscillator(392.00, 'sine', 0.1, now + 0.2); // G4
    this.playOscillator(523.25, 'sine', 0.1, now + 0.3); // C5
    this.playOscillator(659.25, 'sine', 0.1, now + 0.4); // E5
    this.playOscillator(783.99, 'sine', 0.1, now + 0.5); // G5
    this.playOscillator(1046.50, 'sine', 0.5, now + 0.6); // C6
  }

  speak(text, slow = false) {
    if (this.isMutedState) return;
    this.stopSpeaking();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = 'en-US';
    utterance.rate = slow ? 0.7 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = this.volume * 2; // Web speech is usually quieter
    
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this.saveSettings();
  }

  isMuted() {
    return this.isMutedState;
  }

  toggleMute() {
    this.isMutedState = !this.isMutedState;
    this.saveSettings();
    if (this.isMutedState) {
      this.stopSpeaking();
    }
    return this.isMutedState;
  }
}

export const AudioService = new AudioServiceImpl();
export default AudioService;
