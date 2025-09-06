import amqp from 'amqplib';

export class InventoryService {
	static instance;
	static connection;
	static channel;
	static queueName;

	constructor() {
		// Ensure only one instance exists (singleton pattern)
		if (InventoryService.instance) {
			return InventoryService.instance;
		}
		InventoryService.instance = this;
	}

	static getInstance() {
		// Get or create the singleton instance
		if (!InventoryService.instance) {
			InventoryService.instance = new InventoryService();
		}
		return InventoryService.instance;
	}

	async init() {
		// Connect to RabbitMQ if not already connected
		if (!InventoryService.connection) {
			InventoryService.connection = await amqp.connect('amqp://rabbitmq');
			console.log('✅ Connected to RabbitMQ');
		}
		// Create channel if not already created
		if (!InventoryService.channel) {
			InventoryService.channel = await InventoryService.connection.createChannel();
			console.log('✅ Channel created');
		}

		await this.setupExchangeAndQueues();
	}

	async setupExchangeAndQueues() {
		// Create exchange for order processing
		await InventoryService.channel.assertExchange('order-process-exchange', 'direct');
		// Create inventory queue
		const q = await InventoryService.channel.assertQueue('inventory.queue');
		// Bind queue to exchange with routing key
		await InventoryService.channel.bindQueue(q.queue, 'order-process-exchange', 'order.inventory');
		InventoryService.queueName = q.queue;
		console.log('✅ Exchange and queues configured');
	}

	// Getter methods for accessing connection, channel, and queue name
	getConnection() {
		return InventoryService.connection;
	}

	getChannel() {
		return InventoryService.channel;
	}

	getQueueName() {
		return InventoryService.queueName;
	}
}
