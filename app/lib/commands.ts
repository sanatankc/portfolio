import { Filesystem } from './filesystem';
import { TerminalTheme, terminalThemes as defaultTerminalThemes } from './themes';
import { getDirectoryByPath } from './path';

export interface CommandContext {
    args: string[];
    themes: { [key: string]: TerminalTheme };
    currentPath: string[];
    filesystem: Filesystem;
    addToHistory: (line: string | string[]) => void;
    clearHistory: () => void;
    prompt: (question?: string) => Promise<string>;
    setThemes: (themes: { [key: string]: TerminalTheme }) => void;
    setCurrentTheme: (theme: TerminalTheme) => void;
    commands: Commands;
}

type CommandFunction = (context: CommandContext) => Promise<void>;

export interface Commands {
  [key: string]: CommandFunction;
}

const help: CommandFunction = async ({ addToHistory, commands }) => {
    const commandList = Object.keys(commands).join(', ');
    addToHistory(`Available commands: ${commandList}`);
};

const whoami: CommandFunction = async ({ addToHistory }) => {
    addToHistory('guest');
};

const date: CommandFunction = async ({ addToHistory }) => {
    addToHistory(new Date().toString());
};

const pwd: CommandFunction = async ({ currentPath, addToHistory }) => {
    addToHistory(currentPath.join('/'));
}

const ls: CommandFunction = async ({ currentPath, filesystem, addToHistory }) => {
    const dir = getDirectoryByPath(currentPath, filesystem);
    addToHistory(Object.keys(dir).join('  '));
};

const cat: CommandFunction = async ({ args, currentPath, filesystem, addToHistory }) => {
  if (args.length === 0) {
    addToHistory('usage: cat [file]');
    return;
  }
  const filename = args[0];
  const dir = getDirectoryByPath(currentPath, filesystem);
  const file = dir[filename];

  if (file) {
    if (typeof file === 'string') {
      addToHistory(file.replace(/\n/g, '<br/>'));
    } else {
      addToHistory(`${filename}: is a directory`);
    }
  } else {
    addToHistory(`cat: ${filename}: No such file or directory`);
  }
};

const cd: CommandFunction = async () => {
    // This command needs to update state in Terminal.tsx,
    // so it will be handled specially in the main loop for now.
    // A better solution might involve event emitters or a global state manager.
};

const clear: CommandFunction = async ({ clearHistory }) => {
    clearHistory();
}

const theme: CommandFunction = async ({ args, themes, addToHistory, setCurrentTheme, setThemes, prompt }) => {
    const [subcommand, ...rest] = args;

    if (subcommand === 'list') {
        const availableThemes = {...defaultTerminalThemes, ...themes};
        addToHistory(`Available themes: ${Object.keys(availableThemes).join(', ')}`);
        return;
    }

    if (subcommand === 'set') {
        const themeOrPrompt = rest.join(' ').replace(/"/g, '');
        const availableThemes = {...defaultTerminalThemes, ...themes};

        if (availableThemes[themeOrPrompt]) {
            setCurrentTheme(availableThemes[themeOrPrompt]);
            addToHistory(`Theme set to ${themeOrPrompt}`);
            return;
        }

        // --- Theme Generation Flow ---
        let currentPrompt = themeOrPrompt;
        let tempTheme: TerminalTheme | null = null;
        
        while (true) {
            addToHistory(`Generating theme for: "${currentPrompt}"...`);
            
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newTheme: TerminalTheme = {
              name: currentPrompt.toLowerCase().replace(/\s/g, '-').slice(0, 20),
              colors: {
                background: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                foreground: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                border: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
              },
              window: {
                background: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                foreground: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                closeButton: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                border: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
              }
            };
            
            tempTheme = newTheme;
            setCurrentTheme(newTheme);

            addToHistory([
                `Theme \"${newTheme.name}\" generated.`,
                `Do you want to apply this theme? (yes/no/prompt to refine)`
            ]);
            
            const answer = await prompt();

            if (answer.toLowerCase() === 'yes') {
                const newThemes = {...themes, [tempTheme.name]: tempTheme};
                setThemes(newThemes);
                localStorage.setItem('terminalThemes', JSON.stringify(newThemes));
                addToHistory(`Theme \"${tempTheme.name}\" saved.`);
                break;
            } else if (answer.toLowerCase() === 'no') {
                // Revert to the original theme
                const originalThemeName = Object.values(themes).find(t => t.name === newTheme.name) ? newTheme.name : 'default';
                setCurrentTheme(themes[originalThemeName] || defaultTerminalThemes.default);
                addToHistory('Theme generation cancelled.');
                break;
            } else {
                currentPrompt = `${currentPrompt}, but ${answer}`;
            }
        }
        return;
    }
    
    addToHistory('usage: theme [list|set] [theme|prompt]');
}


export const commands: Commands = {
  help,
  whoami,
  date,
  ls,
  cat,
  clear,
  theme,
  pwd,
  cd
}; 