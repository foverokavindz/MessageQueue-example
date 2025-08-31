import { Consumer } from './consumer.js';
import { PaymentService } from './paymentService.js';
import { Producer } from './producer.js';

// START THE SERVICE
async function main() {
	try {
		const paymentService = PaymentService.getInstance();
		await paymentService.init();

		const channel = paymentService.getChannel();

		const producer = new Producer(channel);
		const consumer = new Consumer(channel, paymentService.getQueueName(), producer);

		await consumer.consumeMessage();

		console.log('🏪 Payment Service running...');
	} catch (error) {
		console.error('💥 Failed to start Payment Service:', error);
		process.exit(1);
	}
}

main();
