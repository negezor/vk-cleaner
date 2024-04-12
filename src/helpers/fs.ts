import { lstatSync, readdirSync } from 'node:fs';
import { join as pathJoin } from 'node:path';

export const getDirectories = (srcPath: string): string[] =>
    readdirSync(srcPath).filter(file => lstatSync(pathJoin(srcPath, file)).isDirectory());

export const getFiles = (srcPath: string): string[] =>
    readdirSync(srcPath).filter(file => lstatSync(pathJoin(srcPath, file)).isFile());
