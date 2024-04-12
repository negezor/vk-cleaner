import { input, password as promptPassword } from '@inquirer/prompts';

import { DirectAuthorization, officialAppCredentials } from '@vk-io/authorization';
import { API, type APIError, APIErrorCode } from 'vk-io';

import { writeFileSync } from 'node:fs';

import { callbackService } from './callback-service';
import { AuthMethodType } from './constants';

export interface IAuthMethod {
    name: string;
    value: AuthMethodType;
    handler(): Promise<string>;
}

export const authMethods: IAuthMethod[] = [
    {
        name: 'Access token',
        value: AuthMethodType.AccessToken,
        async handler(): Promise<string> {
            console.info(
                'You can get a token here: https://oauth.vk.com/authorize?client_id=6287487&scope=1073737727&redirect_uri=https://oauth.vk.com/blank.html&display=page&response_type=token&revoke=1',
            );

            while (true) {
                const accessToken = await input({
                    message: 'Write your token (required)',
                });

                const api = new API({
                    token: accessToken,
                });

                try {
                    const response = await api.users.get({});

                    if (response.length === 0) {
                        throw new Error('Passed group or service token');
                    }

                    return accessToken;
                } catch (error) {
                    if ((error as APIError).code === APIErrorCode.AUTH) {
                        console.error('Invalid access token');

                        continue;
                    }

                    console.error(`Another error: ${(error as Error).message}`);
                }
            }
        },
    },
    {
        name: 'Login and password',
        value: AuthMethodType.Credential,
        async handler(): Promise<string> {
            const login = await input({
                message: 'Your login (phone number or email) (required)',
            });

            const password = await promptPassword({
                message: 'Your password (required)',
            });

            const direct = new DirectAuthorization({
                callbackService,

                scope: 'all',
                apiVersion: '5.131',

                ...officialAppCredentials.android,

                login,
                password,
            });

            const response = await direct.run();

            writeFileSync(`${process.cwd()}/access-token.txt`, response.token);

            console.info('We wrote your token in the access-token.txt file in case something goes wrong');

            return response.token;
        },
    },
];
