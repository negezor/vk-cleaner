import { input } from '@inquirer/prompts';
import { CallbackService } from 'vk-io';

export const callbackService = new CallbackService();

callbackService.onCaptcha(async (payload, retry) => {
    console.info('Captcha needs to be solved');

    try {
        const code = await input({
            message: `Open the link and enter text from captcha: ${payload.src}`,
        });

        await retry(code);

        console.info('Captcha solved');
    } catch (error) {
        console.error('Incorrect captcha code');
    }
});

callbackService.onTwoFactor(async (payload, retry) => {
    console.info('Two-factor authentication is enabled on your account');

    try {
        const code = await input({
            message: 'Enter your two-factor authentication code (required)',
        });

        await retry(code);

        console.info('Two-factor solved');
    } catch (error) {
        console.error('Incorrect two-factor code');
    }
});
