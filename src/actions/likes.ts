import { stripIndents } from 'common-tags';
import { type API, resolveResource, type Objects } from 'vk-io';
import { WritableStream as HTMLParserStream } from 'htmlparser2/lib/WritableStream';

import { once } from 'node:events';
import { createReadStream } from 'node:fs';
import { join as pathJoin } from 'node:path';

import type { IAction } from './action';

import {
    formatDuration,
    getDirectories,
    getFiles,
    delay
} from '../helpers';
import { reporter } from '../reporter';

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
        item_id: id
    });
};

const allowResourceTypes = new Set([
    'market',
    'photo',
    'video',
    'note',
    'wall'
]);

export const likesAction: IAction = {
    value: 'DELETE_LIKES',

    name: 'Delete likes',
    description: 'Deletes your likes',

    async canRun({ archivePath, archiveFolders }) {
        if (!archiveFolders.includes('likes')) {
            return false;
        }

        const likeFolders = getDirectories(
            pathJoin(archivePath, 'likes')
        );

        return likeFolders.length !== 0;
    },

    async handler({ api, archivePath }) {
        const likesPath = pathJoin(archivePath, 'likes');

        const likeFolders = getDirectories(
            pathJoin(likesPath)
        );

        const htmlFilePaths = likeFolders
            .flatMap(likeFolder => {
                const likeFolderPath = pathJoin(likesPath, likeFolder);

                const files = getFiles(likeFolderPath)
                    .filter(filename => filename.endsWith('.html'))
                    .map(filename => pathJoin(likeFolderPath, filename));

                return files;
            });

        const likesForDelete: IDeleteLikeOptions[] = [];

        const parseCompletedChain = Promise.resolve();

        const checkFilesTick = reporter.progress(htmlFilePaths.length);

        reporter.info(`Start parsing like files. Number of files to check: ${htmlFilePaths.length}`);

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

                        resource: attributes.href
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
                            type: resouce.type as IDeleteLikeOptions['type']
                        });
                    });
                }
            });

            const parserStream = htmlFileStream.pipe(htmlParserStream);

            await once(parserStream, 'finish');
            // It can resolve before the stream ends
            await parseCompletedChain;

            checkFilesTick();
        }

        reporter.info('End parsing like files');

        if (likesForDelete.length === 0) {
            reporter.info('You have no likes to delete');

            return;
        }

        reporter.info(stripIndents`
            You like ${likesForDelete.length} items

            It will take approximately ${formatDuration(likesForDelete.length * 1.2 * 1000)} to delete likes
        `);

        const deleteLikesTick = reporter.progress(likesForDelete.length);

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

        reporter.info(stripIndents`
            Likes deleted: ${likesForDelete.length - failedDeleteLikes}
            Delete failed: ${failedDeleteLikes}
        `);
    }
};
