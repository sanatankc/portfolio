module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'mono': ['Chicago Plain', 'monospace', 'Menlo', 'Monaco', 'Consolas', 'Courier New'],
    },
    extend: {
      // Pixel border utilities
      clipPath: {
        'pixel-xs': `polygon(
          0px calc(100% - 2px),
          2px calc(100% - 2px),
          2px 100%,
          calc(100% - 2px) 100%,
          calc(100% - 2px) calc(100% - 2px),
          100% calc(100% - 2px),
          100% 2px,
          calc(100% - 2px) 2px,
          calc(100% - 2px) 0px,
          2px 0px,
          2px 2px,
          0px 2px
        )`,
        'pixel-sm': `polygon(
          0px calc(100% - 3px),
          3px calc(100% - 3px),
          3px 100%,
          calc(100% - 3px) 100%,
          calc(100% - 3px) calc(100% - 3px),
          100% calc(100% - 3px),
          100% 3px,
          calc(100% - 3px) 3px,
          calc(100% - 3px) 0px,
          3px 0px,
          3px 3px,
          0px 3px
        )`,
        'pixel-md': `polygon(
          0px calc(100% - 4px),
          4px calc(100% - 4px),
          4px 100%,
          calc(100% - 4px) 100%,
          calc(100% - 4px) calc(100% - 4px),
          100% calc(100% - 4px),
          100% 4px,
          calc(100% - 4px) 4px,
          calc(100% - 4px) 0px,
          4px 0px,
          4px 4px,
          0px 4px
        )`,
        'pixel-lg': `polygon(
          0px calc(100% - 6px),
          6px calc(100% - 6px),
          6px 100%,
          calc(100% - 6px) 100%,
          calc(100% - 6px) calc(100% - 6px),
          100% calc(100% - 6px),
          100% 6px,
          calc(100% - 6px) 6px,
          calc(100% - 6px) 0px,
          6px 0px,
          6px 6px,
          0px 6px
        )`,
        'pixel-xl': `polygon(
          0px calc(100% - 8px),
          8px calc(100% - 8px),
          8px 100%,
          calc(100% - 8px) 100%,
          calc(100% - 8px) calc(100% - 8px),
          100% calc(100% - 8px),
          100% 8px,
          calc(100% - 8px) 8px,
          calc(100% - 8px) 0px,
          8px 0px,
          8px 8px,
          0px 8px
        )`
      }
    }
  },
  plugins: [
    function({ addUtilities }: { addUtilities: (utilities: Record<string, unknown>) => void } ) {
      const pixelBorders = {
        '.border-pixel-xs': {
          'clip-path': `polygon(
            0px calc(100% - 2px),
            2px calc(100% - 2px),
            2px 100%,
            calc(100% - 2px) 100%,
            calc(100% - 2px) calc(100% - 2px),
            100% calc(100% - 2px),
            100% 2px,
            calc(100% - 2px) 2px,
            calc(100% - 2px) 0px,
            2px 0px,
            2px 2px,
            0px 2px
          )`
        },
        '.border-pixel-sm': {
          'clip-path': `polygon(
            0px calc(100% - 3px),
            3px calc(100% - 3px),
            3px 100%,
            calc(100% - 3px) 100%,
            calc(100% - 3px) calc(100% - 3px),
            100% calc(100% - 3px),
            100% 3px,
            calc(100% - 3px) 3px,
            calc(100% - 3px) 0px,
            3px 0px,
            3px 3px,
            0px 3px
          )`
        },
        '.border-pixel-md': {
          'clip-path': `polygon(
            0px calc(100% - 4px),
            4px calc(100% - 4px),
            4px 100%,
            calc(100% - 4px) 100%,
            calc(100% - 4px) calc(100% - 4px),
            100% calc(100% - 4px),
            100% 4px,
            calc(100% - 4px) 4px,
            calc(100% - 4px) 0px,
            4px 0px,
            4px 4px,
            0px 4px
          )`
        },
        '.border-pixel-lg': {
          'clip-path': `polygon(
            0px calc(100% - 6px),
            6px calc(100% - 6px),
            6px 100%,
            calc(100% - 6px) 100%,
            calc(100% - 6px) calc(100% - 6px),
            100% calc(100% - 6px),
            100% 6px,
            calc(100% - 6px) 6px,
            calc(100% - 6px) 0px,
            6px 0px,
            6px 6px,
            0px 6px
          )`
        },
        '.border-pixel-xl': {
          'clip-path': `polygon(
            0px calc(100% - 8px),
            8px calc(100% - 8px),
            8px 100%,
            calc(100% - 8px) 100%,
            calc(100% - 8px) calc(100% - 8px),
            100% calc(100% - 8px),
            100% 8px,
            calc(100% - 8px) 8px,
            calc(100% - 8px) 0px,
            8px 0px,
            8px 8px,
            0px 8px
          )`
        }
      };
      
      addUtilities(pixelBorders);
    }
  ]
};