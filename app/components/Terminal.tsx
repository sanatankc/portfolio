'use client';

import React, { useState, useRef, useEffect } from 'react';
import { commands, CommandContext } from '../lib/commands';
import { terminalThemes as defaultTerminalThemes, TerminalTheme } from '../lib/themes';
import { filesystem } from '../lib/filesystem';
import { resolvePath } from '../lib/path';

interface TerminalProps {
  onThemeChange?: (theme: { background: string; foreground: string; closeButton: string; border: string }) => void;
}

const Terminal: React.FC<TerminalProps> = ({ onThemeChange }) => {
  const [history, setHistory] = useState([
    "Welcome to my portfolio!",
    "Type 'help' to see available commands.",
  ]);
  const [input, setInput] = useState('');
  const [themes, setThemes] = useState(defaultTerminalThemes);
  const [currentTheme, setCurrentTheme] = useState<TerminalTheme>(defaultTerminalThemes.dark);
  const [currentPath, setCurrentPath] = useState(['~']);
  const [isExecuting, setIsExecuting] = useState(false);
  const [promptState, setPromptState] = useState<{
    question?: string;
    resolve: (value: string) => void;
  } | null>(null);
  const [caretPos, setCaretPos] = useState(0);

  const endOfHistoryRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    if (
      onThemeChange &&
      currentTheme &&
      currentTheme.window &&
      currentTheme.window.background &&
      currentTheme.window.foreground &&
      currentTheme.window.closeButton &&
      currentTheme.window.border
    ) {
      onThemeChange(currentTheme.window);
    }
  }, [currentTheme, onThemeChange]);

  const addToHistory = (line: string | string[]) => {
    setHistory(prev => [...prev, ...(Array.isArray(line) ? line : [line])]);
  };

  const clearHistory = () => setHistory([]);

  const prompt = (question?: string): Promise<string> => {
    return new Promise(resolve => {
      setPromptState({ question, resolve });
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCaretPos(e.target.selectionStart || 0);
  };

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (inputRef.current) setCaretPos(inputRef.current.selectionStart || 0);
    }, 0);

    if (e.key === 'Tab' && !promptState) {
        e.preventDefault();
        const [command] = input.split(' ');
        const commandList = Object.keys(commands);
        const completedCommand = commandList.find(c => c.startsWith(command));
        if (completedCommand) {
            setInput(completedCommand + ' ');
        }
        return;
    }

    if (e.key === 'Enter') {
        if (promptState) {
            addToHistory(input);
            promptState.resolve(input);
            setPromptState(null);
            setInput('');
            return;
        }

      if (isExecuting) return;

      const fullLine = `> ${currentPath.join('/')} ${input}`;
      addToHistory(fullLine);

      const [commandName, ...args] = input.trim().split(' ');
      setInput('');

      if (commandName) {
        const command = commands[commandName];
        if (command) {
            setIsExecuting(true);
            const context: CommandContext = {
                args,
                themes,
                currentPath,
                filesystem,
                addToHistory,
                clearHistory,
                prompt,
                setThemes,
                setCurrentTheme,
                commands
            };

            if (commandName === 'cd') {
                 const { newPath, error } = resolvePath(args[0] || '~', currentPath, filesystem);
                if (error) {
                    addToHistory(error);
                } else {
                    setCurrentPath(newPath!);
                }
            } else {
                 await command(context);
            }

            setIsExecuting(false);
        } else {
          addToHistory(`command not found: ${commandName}`);
        }
      }
    }
  };

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    const savedThemes = localStorage.getItem('terminalThemes');
    if (savedThemes) {
      setThemes(JSON.parse(savedThemes));
    }
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, []);

  const handleInputClick = () => {
    if (inputRef.current) setCaretPos(inputRef.current.selectionStart || 0);
  };

  // Helper to measure text width up to caret
  const getCaretOffset = () => {
    if (!inputRef.current) return 0;
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.font = window.getComputedStyle(inputRef.current).font;
    span.style.whiteSpace = 'pre';
    span.innerText = input.slice(0, caretPos);
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  };

  const terminalStyle = {
    '--background': currentTheme.colors.background,
    '--foreground': currentTheme.colors.foreground,
    '--border': currentTheme.colors.border,
  } as React.CSSProperties;


  return (
    <div className="w-full h-full bg-[var(--background)] text-[var(--foreground)] font-mono flex flex-col" style={terminalStyle} onClick={focusInput}>
      <div className="p-2 overflow-y-auto flex-grow" onClick={focusInput}>
        {history.map((line, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: line }}></div>
        ))}
        <div className="flex items-center">
          <span>
            {promptState?.question || `${currentPath.join('/')}>`}
          </span>
          <div className="relative flex-grow">
            <input
              ref={inputRef}
              id="terminal-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onClick={handleInputClick}
              className="bg-transparent border-none text-[var(--foreground)] focus:outline-none pl-2 w-full"
              style={{ caretColor: 'transparent' }}
              disabled={isExecuting && !promptState}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <span
              className="absolute top-0 h-full w-2 bg-[var(--foreground)] animate-pulse"
              style={{ left: `calc(0.5rem + ${getCaretOffset()}px)` }}
            ></span>
          </div>
        </div>
        <div ref={endOfHistoryRef} />
      </div>
    </div>
  );
};

export default Terminal; 