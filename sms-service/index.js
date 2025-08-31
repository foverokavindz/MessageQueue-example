// sms-service.js

import { Consumer } from './consumer.js';
import { Producer } from './producer.js';
import { SmsService } from './smsService.js';

// START THE SERVICE
async function main() {
	try {
		const smsService = SmsService.getInstance();
		await smsService.init();

		const channel = smsService.getChannel();

		const producer = new Producer(channel);
		const consumer = new Consumer(channel, smsService.getQueueName(), producer);

		await consumer.consumeMessage();

		console.log('📱 SMS Service running...');
	} catch (error) {
		console.error('💥 Failed to start SMS Service:', error);
		process.exit(1);
	}
}

main();
