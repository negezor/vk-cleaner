import { join as pathJoin } from 'path';
import { readdirSync, lstatSync } from 'fs';

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
