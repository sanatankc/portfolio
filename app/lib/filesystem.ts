export interface Directory {
    [key: string]: string | Directory;
}

export const filesystem: Directory = {
  '~': {
    'about.txt': 'This is a portfolio website designed to look like a terminal.',
    'projects': {
      'project1.txt': 'A cool project I worked on.',
      'project2.txt': 'Another cool project.',
    },
    'socials.txt': 'You can find me on:\n- GitHub: ...\n- LinkedIn: ...',
  },
};

export type Filesystem = typeof filesystem; 