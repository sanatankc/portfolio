// Built-in fx map with their file paths
const BUILT_IN_FX = {
  hover: './fx/hover.mp3',
  click: './fx/click.wav',
  close: './fx/close.mp3',
  type: './fx/type.mp3',
} as const;

export type FxName = keyof typeof BUILT_IN_FX;

export interface AudioFx {
  name: string;
  audio: HTMLAudioElement;
}

export interface FxPlayer {
  play: (fxName: FxName) => void;
  isLoaded: (fxName: FxName) => boolean;
}

export class DesktopFxPlayer implements FxPlayer {
  private fx: Map<string, HTMLAudioElement> = new Map();
  private currentlyPlaying: HTMLAudioElement | null = null;

  constructor() {
    // Auto-preload all built-in fx
    this.preloadBuiltInFx();
  }

  private preloadBuiltInFx(): void {
    Object.entries(BUILT_IN_FX).forEach(([name, src]) => {
      this.preloadFx(name, src);
    });
  }

  private preloadFx(fxName: string, src: string): void {
    if (this.fx.has(fxName)) return;
    
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.3; // Set reasonable default volume
    this.fx.set(fxName, audio);
  }

  play(fxName: FxName): void {
    const audio = this.fx.get(fxName);
    if (audio) {
      // For typewriter sounds, create a clone to allow overlapping
      if (fxName === 'type') {
        const audioClone = audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = 0.15; // Lower volume for typewriter
        audioClone.currentTime = 0;
        audioClone.play().catch(error => {
          console.warn(`Failed to play fx "${fxName}":`, error);
        });
        return;
      }

      // For other sounds, stop any currently playing audio first
      if (this.currentlyPlaying) {
        this.currentlyPlaying.pause();
        this.currentlyPlaying.currentTime = 0;
        this.currentlyPlaying = null;
      }

      // Reset to beginning and play
      audio.currentTime = 0;
      this.currentlyPlaying = audio;
      audio.play().then(() => {
        audio.currentTime = 0;
        console.log(`Playing fx "${fxName}"`, audio.currentTime);
      }).catch(error => {
        console.warn(`Failed to play fx "${fxName}":`, error);
        this.currentlyPlaying = null;
      });

      // Clear currentlyPlaying when audio ends
      audio.addEventListener('ended', () => {
        if (this.currentlyPlaying === audio) {
          this.currentlyPlaying = null;
        }
      }, { once: true });
    } else {
      console.warn(`Fx "${fxName}" not found or not preloaded`);
    }
  }

  isLoaded(fxName: FxName): boolean {
    return this.fx.has(fxName);
  }
}