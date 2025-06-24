import { Filesystem, Directory } from "./filesystem";

export const resolvePath = (path: string, currentPath: string[], filesystem: Filesystem): { newPath: string[] | null, error: string | null } => {
    const pathParts = path.split('/').filter(p => p);
    let tempPath;

    if (path.startsWith('/')) {
        tempPath = ['~'];
    } else {
        tempPath = [...currentPath];
    }

    for (const part of pathParts) {
        if (part === '.') {
            continue;
        }
        if (part === '..') {
            if (tempPath.length > 1) {
                tempPath.pop();
            }
        } else {
            let currentLevel: Directory | string = filesystem;
            for (const dir of tempPath) {
                if (typeof currentLevel === 'object') {
                    currentLevel = currentLevel[dir];
                }
            }
            if (currentLevel && typeof (currentLevel as Directory)[part] === 'object') {
                tempPath.push(part);
            } else {
                return { newPath: null, error: `cd: no such file or directory: ${path}` };
            }
        }
    }

    return { newPath: tempPath, error: null };
}

export const getDirectoryByPath = (path: string[], filesystem: Filesystem) => {
    let currentLevel: Directory | string = filesystem;
    for (const dir of path) {
        if (typeof currentLevel === 'object') {
            currentLevel = currentLevel[dir];
        }
    }
    return currentLevel as Directory;
} 