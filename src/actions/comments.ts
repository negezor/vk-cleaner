import { stripIndents } from 'common-tags';
import { WritableStream as HTMLParserStream } from 'htmlparser2/lib/WritableStream';
import { type API, resolveResource } from 'vk-io';

import { once } from 'node:events';
import { createReadStream } from 'node:fs';
import { join as pathJoin } from 'node:path';

import type { IAction } from './action';

import { formatDuration, getFiles } from '../helpers';

export interface IDeleteCommentOptions {
    type: 'market' | 'photo' | 'video' | 'wall';

    ownerId: number;
    commentId: number;
}

const deleteComment = (api: API, options: IDeleteCommentOptions) => {
    const { type, ownerId, commentId } = options;

    const params = {
        comment_id: commentId,
        owner_id: ownerId,
    };

    if (type === 'photo') {
        return api.photos.deleteComment(params);
    }

    if (type === 'video') {
        return api.video.deleteComment(params);
    }

    if (type === 'market') {
        return api.market.deleteComment(params);
    }

    if (type === 'wall') {
        return api.wall.deleteComment(params);
    }

    throw new Error('Unsupported type for delete comment');
};

const allowResourceTypes = new Set(['market', 'photo', 'video', 'wall']);

export const commentsAction: IAction = {
    value: 'DELETE_COMMENTS',

    name: 'Delete comments',
    description: 'Deletes your comments',

    async canRun({ archiveFolders }) {
        return archiveFolders.includes('comments');
    },

    async handler({ api, archivePath }) {
        const commentsPath = pathJoin(archivePath, 'comments');

        const htmlFilePaths = getFiles(commentsPath)
            .filter(filename => filename.endsWith('.html'))
            .map(filename => pathJoin(commentsPath, filename));

        const commentsForDelete: IDeleteCommentOptions[] = [];

        const parseCompletedChain = Promise.resolve();

        let checkFilesTickTicks = 0;

        const checkFilesTick = () => {
            checkFilesTickTicks += 1;

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`Progress ${checkFilesTickTicks}/${htmlFilePaths.length}`);
        };

        console.info(`Start parsing comment files. Number of files to check: ${htmlFilePaths.length}`);

        for (const htmlFilePath of htmlFilePaths) {
            const htmlFileStream = createReadStream(htmlFilePath);

            const htmlParserStream = new HTMLParserStream({
                onopentag(name, attributes) {
                    if (name !== 'a') {
                        return;
                    }

                    if (!attributes.href || !attributes.href.startsWith('http')) {
                        return;
                    }

                    const url = new URL(attributes.href);

                    const commentId = url.searchParams.get('reply');

                    if (!commentId) {
                        return;
                    }

                    const resolvePromise = resolveResource({
                        api,

                        resource: attributes.href,
                    });

                    parseCompletedChain.then(async () => {
                        const resouce = await resolvePromise;

                        if (!allowResourceTypes.has(resouce.type)) {
                            return;
                        }

                        commentsForDelete.push({
                            commentId: Number(commentId),
                            // @ts-expect-error ts...
                            ownerId: resouce.ownerId,
                            type: resouce.type as IDeleteCommentOptions['type'],
                        });
                    });
                },
            });

            const parserStream = htmlFileStream.pipe(htmlParserStream);

            await once(parserStream, 'finish');
            // It can resolve before the stream ends
            await parseCompletedChain;

            checkFilesTick();
        }

        console.log();
        console.info('End parsing comment files');

        if (commentsForDelete.length === 0) {
            console.info('You have no comments to delete');

            return;
        }

        console.info(stripIndents`
            You wrote ${commentsForDelete.length} comments

            It will take approximately ${formatDuration(commentsForDelete.length * 1.2 * 1000)} to delete comments
        `);

        let deleteCommentsTicks = 0;

        const deleteCommentsTick = () => {
            deleteCommentsTicks += 1;

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`Progress ${deleteCommentsTicks}/${commentsForDelete.length}`);
        };

        let failedDeleteComments = 0;

        await Promise.all(
            commentsForDelete.map(async comment => {
                let retries = 0;

                while (true) {
                    if (retries === 3) {
                        failedDeleteComments += 1;

                        break;
                    }

                    try {
                        await deleteComment(api, comment);

                        break;
                    } catch (error) {
                        retries += 1;

                        if (process.env.DEBUG) {
                            console.error('Failed delete comment', error);
                        }
                    }
                }

                deleteCommentsTick();
            }),
        );

        console.log();
        console.info(stripIndents`
            Comments deleted: ${commentsForDelete.length - failedDeleteComments}
            Delete failed: ${failedDeleteComments}
        `);
    },
};
