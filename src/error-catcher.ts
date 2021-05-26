process.on('uncaughtException', (error) => {
	// eslint-disable-next-line no-console
	console.error('Caught exception', error);
});
