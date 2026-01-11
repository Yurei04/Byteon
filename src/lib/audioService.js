// lib/audioService.js
// Global audio management system for the visual novel

class AudioService {
  constructor() {
    this.bgMusic = null;
    this.typewriterSound = null;
    this.clickSound = null;
    
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    
    this.isInitialized = false;
    this.isMusicPlaying = false;
    this.typewriterInterval = null;
  }

  // Initialize all audio elements
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Background music (looped)
      this.bgMusic = new Audio('/audio/bkg.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = this.musicVolume;

      // Typewriter sound effect
      this.typewriterSound = new Audio('/audio/trypewriter.mp3');
      this.typewriterSound.volume = this.sfxVolume;

      // Click sound effect
      this.clickSound = new Audio('/audio/click.mp3');
      this.clickSound.volume = this.sfxVolume;

      // Preload audio files
      await Promise.all([
        this.bgMusic.load(),
        this.typewriterSound.load(),
        this.clickSound.load()
      ]);

      this.isInitialized = true;
      console.log('[AudioService] Initialized successfully');
    } catch (error) {
      console.error('[AudioService] Failed to initialize:', error);
    }
  }

  // Start background music
  async playBackgroundMusic() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.bgMusic && !this.isMusicPlaying) {
      try {
        await this.bgMusic.play();
        this.isMusicPlaying = true;
        console.log('[AudioService] Background music started');
      } catch (error) {
        console.error('[AudioService] Failed to play background music:', error);
      }
    }
  }

  // Stop background music
  stopBackgroundMusic() {
    if (this.bgMusic && this.isMusicPlaying) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
      this.isMusicPlaying = false;
      console.log('[AudioService] Background music stopped');
    }
  }

  // Play click sound
  playClick() {
    if (this.clickSound && this.sfxVolume > 0) {
      // Clone the audio to allow overlapping clicks
      const sound = this.clickSound.cloneNode();
      sound.volume = this.sfxVolume;
      sound.play().catch(err => console.warn('[AudioService] Click sound failed:', err));
    }
  }

  // Play typewriter sound once
  playTypewriter() {
    if (this.typewriterSound && this.sfxVolume > 0) {
      const sound = this.typewriterSound.cloneNode();
      sound.volume = this.sfxVolume * 0.6; // Slightly quieter for typing
      sound.play().catch(err => console.warn('[AudioService] Typewriter sound failed:', err));
    }
  }

  // Start looping typewriter sound for dialog typing
  startTypewriterLoop(intervalMs = 2000) {
    this.stopTypewriterLoop(); // Clear any existing loop
    
    this.typewriterInterval = setInterval(() => {
      this.playTypewriter();
    }, intervalMs);
  }

  // Stop typewriter loop
  stopTypewriterLoop() {
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
  }

  // Set music volume (0.0 to 1.0)
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
    }
  }

  // Set sound effects volume (0.0 to 1.0)
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.typewriterSound) {
      this.typewriterSound.volume = this.sfxVolume * 0.6;
    }
    if (this.clickSound) {
      this.clickSound.volume = this.sfxVolume;
    }
  }

  // Cleanup
  destroy() {
    this.stopBackgroundMusic();
    this.stopTypewriterLoop();
    
    if (this.bgMusic) this.bgMusic = null;
    if (this.typewriterSound) this.typewriterSound = null;
    if (this.clickSound) this.clickSound = null;
    
    this.isInitialized = false;
  }
}

// Create singleton instance
const audioService = new AudioService();

// Make it globally available
if (typeof window !== 'undefined') {
  window.audioManager = audioService;
}

export default audioService;