import reporter from 'yurnalist';
import { VK, createCollectIterator } from 'vk-io';

async function run() {
	reporter.info('Test');
}

run().catch(console.error);
