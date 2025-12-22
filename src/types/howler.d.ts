declare module 'howler' {
  export class Howl {
    constructor(options: {
      src: string[];
      html5?: boolean;
      loop?: boolean;
      volume?: number;
      onplay?: () => void;
      onpause?: () => void;
      onend?: () => void;
      onloaderror?: (id: number, error: any) => void;
      onplayerror?: (id: number, error: any) => void;
    });
    play(): void;
    pause(): void;
    stop(): void;
    unload(): void;
    playing(): boolean;
    duration(): number;
    seek(position?: number): number;
  }
}
