export type MouseButtonType = 'left' | 'middle' | 'right';
export type Mode = 'click' | 'hold';

export interface ButtonStats {
  clicks: number;
  faults: number;
  fastest: number | null;
  lastClickTime: number;
}

export interface AppState {
  mode: Mode;
  threshold: number;
  stats: Record<MouseButtonType, ButtonStats>;
  holdButton: MouseButtonType | null;
  holdStartTime: number | null;
}

export function getButtonType(button: number): MouseButtonType | null {
  switch (button) {
    case 0: return 'left';
    case 1: return 'middle';
    case 2: return 'right';
    default: return null;
  }
}

export function getButtonColor(type: MouseButtonType): string {
  switch (type) {
    case 'left': return '#4a9eff';
    case 'middle': return '#50c878';
    case 'right': return '#ff6b6b';
  }
}

export function getButtonName(type: MouseButtonType): string {
  switch (type) {
    case 'left': return 'Left';
    case 'middle': return 'Middle';
    case 'right': return 'Right';
  }
}
