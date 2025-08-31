import { Consumer } from './consumer.js';
import { InventoryService } from './inventoryService.js';
import { Producer } from './producer.js';

async function main() {
	try {
		const inventoryService = InventoryService.getInstance();
		await inventoryService.init();
		const channel = inventoryService.getChannel();

		const producer = new Producer(channel);
		const consumer = new Consumer(channel, inventoryService.getQueueName(), producer);

		await consumer.consumeMessage();

		console.log('🏪 Inventory Service running...');
	} catch (error) {
		console.error('💥 Failed to start Inventory Service:', error);
		process.exit(1);
	}
}

main();
