import { join as pathJoin } from 'node:path';
import { readdirSync, lstatSync } from 'node:fs';

export const getDirectories = (srcPath: string): string[] => (
    readdirSync(srcPath)
        .filter(file => (
            lstatSync(pathJoin(srcPath, file)).isDirectory()
        ))
);

export const getFiles = (srcPath: string): string[] => (
    readdirSync(srcPath)
        .filter(file => (
            lstatSync(pathJoin(srcPath, file)).isFile()
        ))
);
