import { join as pathJoin } from 'path';

import { IAction } from './action';

import { getFiles } from '../helpers';

export const commentsAction: IAction = {
	value: 'DELETE_COMMENTS',

	name: 'Delete comments',
	description: 'Deletes your comments',

	async canRun({ archiveFolders }) {
		return archiveFolders.includes('comments');
	},

	async handler({ api, archivePath }) {
		const commentsPath = pathJoin(archivePath, 'comments');

		const htmlFiles = getFiles(commentsPath)
			.filter(file => file.endsWith('.html'));
	}
};
