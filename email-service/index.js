import { Consumer } from './consumer.js';
import { EmailService } from './emailService.js';
import { Producer } from './producer.js';

async function main() {
	try {
		const emailService = EmailService.getInstance();
		await emailService.init();

		const channel = emailService.getChannel();

		const producer = new Producer(channel);
		const consumer = new Consumer(channel, emailService.getQueueName(), producer);

		await consumer.consumeMessage();

		console.log('📧 Email Service running...');
	} catch (error) {
		console.error('💥 Failed to start Email Service:', error);
		process.exit(1);
	}
}

main();
