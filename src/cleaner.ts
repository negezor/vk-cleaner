import { existsSync } from 'fs';
import { stripIndents } from 'common-tags';
import { API } from 'vk-io';

import { authMethods } from './auth';

import {
	commentsAction, IAction
} from './actions';

import { reporter } from './reporter';
import { callbackService } from './callback-service';
import { delay, getDirectories, formatDuration } from './helpers';

const actions = {
	commentsAction
};

async function run() {
	reporter.info(stripIndents`
		Hello! This is a setup wizard for cleaning VK.
		We need a few things to get started.
	`);

	process.stdout.write('\n');

	let archivePath = `${process.cwd()}/Archive`;
	if (!existsSync(archivePath)) {
		const listFolders = getDirectories(process.cwd());

		if (listFolders.length === 0) {
			reporter.error('We didn\'t find the Archive folder or others');

			return;
		}

		archivePath = await reporter.prompt(
			'We didn\'t find the Archive folder, which folder did you unpack to?',
			listFolders,
			{
				type: 'list'
			}
		) as unknown as string;

		archivePath = `${process.cwd()}/${archivePath}`;
	}

	const archiveFolders = getDirectories(archivePath);

	if (archiveFolders.length === 0) {
		reporter.error('Archive is empty');

		return;
	}

	const authMethodValue = await reporter.prompt(
		'Select an authorization method',
		authMethods,
		{
			name: 'name',
			type: 'list'
		}
	) as unknown as string;

	const authMethod = authMethods.find(item => (
		item.value === authMethodValue
	));

	if (!authMethod) {
		reporter.error(`Unsupported ${authMethodValue} auth method`);

		process.exit(0);
	}

	const accessToken = await authMethod.handler();

	reporter.info('Successful auth');

	await delay(500);

	const api = new API({
		callbackService,

		token: accessToken
	});

	const supportedActions = await Promise.all(
		Object.values(actions)
			.map(async (action) => {
				const supported = await action.canRun({
					archivePath,
					archiveFolders,

					api
				});

				if (!supported) {
					return undefined;
				}

				return action;
			})
			.filter(Boolean)
	) as IAction[];

	if (supportedActions.length === 0) {
		reporter.warn('No supported cleaning methods found');

		return;
	}

	const selectedActionValues = await reporter.prompt(
		'Select the things you want to clean',
		supportedActions.map(action => ({
			...action,

			name: `${action.name} — ${action.description}`
		})),
		{
			name: 'name',
			type: 'checkbox'
		}
	);

	const selectedActions = Object.values(actions)
		.filter(action => (
			selectedActionValues.includes(action.value)
		));

	if (selectedActions.length === 0) {
		reporter.warn('You have not selected any actions');

		return;
	}

	for (const action of selectedActions) {
		reporter.info(`Start ${action.name.toLowerCase()}`);

		const startAt = Date.now();

		try {
			await action.handler({
				archivePath,
				archiveFolders,

				api
			});

			const tookTime = formatDuration(Date.now() - startAt);

			reporter.info(`End ${action.name.toLowerCase()}, took time ${tookTime}`);
		} catch (error) {
			reporter.error(`An error occurred while performing actions — ${action.name}`);

			// eslint-disable-next-line no-console
			console.log(error);
		}
	}

	reporter.success('Completed!');
}

run().catch((error) => {
	// Ignore exit from process with active prompt
	if (error.message === 'canceled') {
		return;
	}

	// eslint-disable-next-line no-console
	console.error(error);
});
