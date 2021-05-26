import { CallbackService } from 'vk-io';

import { reporter } from './reporter';

export const callbackService = new CallbackService();

callbackService.onCaptcha(async (payload, retry) => {
	reporter.info('Captcha needs to be solved');

	try {
		const code = await reporter.question(`Open the link and enter text from captcha: ${payload.src}`, {
			required: true
		});

		await retry(code);

		reporter.info('Captcha solved');
	} catch (error) {
		reporter.error('Incorrect captcha code');
	}
});

callbackService.onTwoFactor(async (payload, retry) => {
	reporter.info('Two-factor authentication is enabled on your account');

	try {
		const code = await reporter.question('Enter your two-factor authentication code (required)', {
			required: true
		});

		await retry(code);

		reporter.info('Two-factor solved');
	} catch (error) {
		reporter.error('Incorrect two-factor code');
	}
});
