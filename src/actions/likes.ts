import { stripIndents } from 'common-tags';
import { WritableStream as HTMLParserStream } from 'htmlparser2/lib/WritableStream';
import { type API, type Objects, resolveResource } from 'vk-io';

import { once } from 'node:events';
import { createReadStream } from 'node:fs';
import { join as pathJoin } from 'node:path';

import type { IAction } from './action';

import { delay, formatDuration, getDirectories, getFiles } from '../helpers';

export interface IDeleteLikeOptions {
    type: Objects.LikesType;

    ownerId: number;
    id: number;
}

const deleteLike = (api: API, options: IDeleteLikeOptions) => {
    const { type, ownerId, id } = options;

    return api.likes.delete({
        type,
        owner_id: ownerId,
        item_id: id,
    });
};

const allowResourceTypes = new Set(['market', 'photo', 'video', 'note', 'wall']);

export const likesAction: IAction = {
    value: 'DELETE_LIKES',

    name: 'Delete likes',
    description: 'Deletes your likes',

    async canRun({ archivePath, archiveFolders }) {
        if (!archiveFolders.includes('likes')) {
            return false;
        }

        const likeFolders = getDirectories(pathJoin(archivePath, 'likes'));

        return likeFolders.length !== 0;
    },

    async handler({ api, archivePath }) {
        const likesPath = pathJoin(archivePath, 'likes');

        const likeFolders = getDirectories(pathJoin(likesPath));

        const htmlFilePaths = likeFolders.flatMap(likeFolder => {
            const likeFolderPath = pathJoin(likesPath, likeFolder);

            const files = getFiles(likeFolderPath)
                .filter(filename => filename.endsWith('.html'))
                .map(filename => pathJoin(likeFolderPath, filename));

            return files;
        });

        const likesForDelete: IDeleteLikeOptions[] = [];

        const parseCompletedChain = Promise.resolve();

        let checkFilesTicks = 0;

        const checkFilesTick = () => {
            checkFilesTicks += 1;

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`Progress ${checkFilesTicks}/${htmlFilePaths.length}`);
        };

        console.info(`Start parsing like files. Number of files to check: ${htmlFilePaths.length}`);

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

                    const resolvePromise = resolveResource({
                        api,

                        resource: attributes.href,
                    });

                    parseCompletedChain.then(async () => {
                        const resouce = await resolvePromise;

                        if (!allowResourceTypes.has(resouce.type)) {
                            return;
                        }

                        likesForDelete.push({
                            id: resouce.id,
                            // @ts-expect-error ts...
                            ownerId: resouce.ownerId,
                            type: resouce.type as IDeleteLikeOptions['type'],
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
        console.info('End parsing like files');

        if (likesForDelete.length === 0) {
            console.info('You have no likes to delete');

            return;
        }

        console.info(stripIndents`
            You like ${likesForDelete.length} items

            It will take approximately ${formatDuration(likesForDelete.length * 1.2 * 1000)} to delete likes
        `);

        let deleteLikesTicks = 0;

        const deleteLikesTick = () => {
            deleteLikesTicks += 1;

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`Progress ${deleteLikesTicks}/${likesForDelete.length}`);
        };


        let failedDeleteLikes = 0;

        for (const like of likesForDelete) {
            let retries = 0;

            while (true) {
                if (retries === 3) {
                    failedDeleteLikes += 1;

                    break;
                }

                try {
                    await deleteLike(api, like);

                    await delay(1_000);

                    break;
                } catch (error) {
                    retries += 1;

                    if (process.env.DEBUG) {
                        console.error('Failed delete like', error);
                    }
                }
            }

            deleteLikesTick();
        }

        console.log();
        console.info(stripIndents`
            Likes deleted: ${likesForDelete.length - failedDeleteLikes}
            Delete failed: ${failedDeleteLikes}
        `);
    },
};
