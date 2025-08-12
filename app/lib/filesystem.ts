export interface Directory {
    [key: string]: string | Directory;
}

export const filesystem: Directory = {
  '~': {
    'about.txt': 'This is a portfolio website designed to look like a terminal.',
    'projects': {
      'glitch-app.txt': 'glitch.app — See more: /blog/glitch-house',
      'README.txt': 'Open with Notes for links to blog and assets.'
    },
    'socials.txt': 'You can find me on:\n- GitHub: ...\n- LinkedIn: ...',
    'notes': {
      'glitch.md': 'This is my recent project.\n\n- Open the blog inside OS: <a href="/blog/glitch-house">Open in Browser App</a>\n- Open in new tab: <a href="/blog/glitch-house" target="_blank" rel="noopener noreferrer">glitch.house blog</a>\n',
    },
  },
};

export type Filesystem = typeof filesystem; 