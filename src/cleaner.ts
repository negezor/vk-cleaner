import { checkbox, confirm, select } from '@inquirer/prompts';
import { stripIndents } from 'common-tags';
import { API } from 'vk-io';

import { existsSync } from 'node:fs';

import { authMethods } from './auth';

import { type IAction, commentsAction, likesAction } from './actions';

import { callbackService } from './callback-service';
import { delay, formatDuration, getDirectories } from './helpers';

const actions = {
    commentsAction,
    likesAction,
};

async function run() {
    console.info(stripIndents`
        Hello! This is a setup wizard for cleaning VK.
        We need a few things to get started.
    `);

    process.stdout.write('\n');

    let archivePath = `${process.cwd()}/Archive`;
    if (!existsSync(archivePath)) {
        const listFolders = getDirectories(process.cwd());

        if (listFolders.length === 0) {
            console.error("We didn't find the Archive folder or others");

            return;
        }

        archivePath = await select({
            message: "We didn't find the Archive folder, which folder did you unpack to?",
            choices: listFolders.map(folder => ({
                value: folder,
            })),
        });

        archivePath = `${process.cwd()}/${archivePath}`;
    }

    const archiveFolders = getDirectories(archivePath);

    if (archiveFolders.length === 0) {
        console.error('Archive is empty');

        return;
    }

    const authMethodValue = await select({
        message: 'Select an authorization method',
        choices: authMethods,
    });

    const authMethod = authMethods.find(item => item.value === authMethodValue);

    if (!authMethod) {
        console.error(`Unsupported ${authMethodValue} auth method`);

        process.exit(0);
    }

    const accessToken = await authMethod.handler();

    console.info('Successful auth');

    await delay(500);

    const api = new API({
        callbackService,

        token: accessToken,
    });

    const rawSupportedActions = await Promise.all(
        Object.values(actions).map(async action => {
            const supported = await action.canRun({
                archivePath,
                archiveFolders,

                api,
            });

            if (!supported) {
                return undefined;
            }

            return action;
        }),
    );

    const supportedActions = rawSupportedActions.filter(Boolean) as IAction[];

    if (supportedActions.length === 0) {
        console.warn('No supported cleaning methods found');

        return;
    }

    const selectedActionValues = await checkbox({
        message: 'Select the things you want to clean',
        choices: supportedActions.map(action => ({
            ...action,

            name: `${action.name} — ${action.description}`,
        }))
    });

    const selectedActions = Object.values(actions).filter(action => selectedActionValues.includes(action.value));

    if (selectedActions.length === 0) {
        console.warn('You have not selected any actions');

        return;
    }

    const actionsForConfirm = selectedActions.map(action => `- ${action.name} — ${action.description}`).join('\n');

    const confirmed = await confirm({
        message: stripIndents`
            Are you sure you want to run these actions?

            ${actionsForConfirm}

            THESE ACTIONS ARE IRREVERSIBLE!
        `,
    });

    if (!confirmed) {
        console.info('Have a nice day!');

        return;
    }

    await delay(3000);

    for (const action of selectedActions) {
        console.info(`Start ${action.name.toLowerCase()}`);

        const startAt = Date.now();

        try {
            await action.handler({
                archivePath,
                archiveFolders,

                api,
            });

            const tookTime = formatDuration(Date.now() - startAt);

            console.info(`End ${action.name.toLowerCase()}, took time ${tookTime}`);
        } catch (error) {
            console.error(`An error occurred while performing actions — ${action.name}`);

            console.log(error);
        }
    }

    console.info('Completed!');

    process.exit(0);
}

run().catch(error => {
    // Ignore exit from process with active prompt
    if (error.message === 'canceled') {
        return;
    }

    console.error(error);

    process.exit(1);
});
