export interface TerminalTheme {
  name: string;
  colors: {
    background: string;
    foreground: string;
    border: string;
  };
  window: {
    background: string;
    foreground: string;
    closeButton: string;
    closeButtonText: string;
    border: string;
  }
}

export const defaultWindowThemes = {
  dark: {
    background: '#23272e',
    foreground: '#e5e7eb',
    closeButton: '#ef4444',
    closeButtonText: '#ffffff',
    border: '#bbb',
  },
  light: {
    background: '#f3f4f6',
    foreground: '#222',
    closeButton: '#ef4444',
    closeButtonText: '#ffffff',
    border: '#bbb',
  },
};

export const terminalThemes: { [key: string]: TerminalTheme } = {
  default: {
    name: 'default',
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      border: '#000000',
    },
    window: {
      background: '#c0c0c0',
      foreground: '#000000',
      closeButton: '#ff0000',
      closeButtonText: '#ffffff',
      border: '#000000',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#000000',
      foreground: '#00ff00',
      border: '#00ff00',
    },
    window: {
      background: '#333333',
      foreground: '#ffffff',
      closeButton: '#ff6666',
      closeButtonText: '#ffffff',
      border: '#000000',
    }
  },
  solarized: {
    name: 'solarized',
    colors: {
      background: '#fdf6e3',
      foreground: '#657b83',
      border: '#073642',
    },
    window: {
      background: '#eee8d5',
      foreground: '#002b36',
      closeButton: '#dc322f',
      closeButtonText: '#ffffff',
      border: '#073642',
    }
  },
}; 