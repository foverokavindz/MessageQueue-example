import { Consumer } from './consumer.js';
import { InventoryService } from './inventoryService.js';
import { Producer } from './producer.js';

async function main() {
	try {
		// Initialize the inventory service singleton
		const inventoryService = InventoryService.getInstance();
		await inventoryService.init();

		// Get the message queue channel
		const channel = inventoryService.getChannel();

		// Create producer and consumer instances
		const producer = new Producer(channel);
		const consumer = new Consumer(channel, inventoryService.getQueueName(), producer);

		// Start consuming messages from the queue
		await consumer.consumeMessage();

		console.log('🏪 Inventory Service running...');
	} catch (error) {
		// Handle any startup errors
		console.error('💥 Failed to start Inventory Service:', error);
		process.exit(1);
	}
}

// Start the application
main();
