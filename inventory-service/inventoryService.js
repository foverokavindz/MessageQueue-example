import amqp from 'amqplib';

export class InventoryService {
	static instance;
	static connection;
	static channel;
	static queueName;

	constructor() {
		if (InventoryService.instance) {
			return InventoryService.instance;
		}
		InventoryService.instance = this;
	}

	static getInstance() {
		if (!InventoryService.instance) {
			InventoryService.instance = new InventoryService();
		}
		return InventoryService.instance;
	}

	async init() {
		if (!InventoryService.connection) {
			InventoryService.connection = await amqp.connect('amqp://localhost');
			console.log('✅ Connected to RabbitMQ');
		}
		if (!InventoryService.channel) {
			InventoryService.channel = await InventoryService.connection.createChannel();
			console.log('✅ Channel created');
		}

		await this.setupExchangeAndQueues();
	}

	async setupExchangeAndQueues() {
		await InventoryService.channel.assertExchange('order-process-exchange', 'direct');
		const q = await InventoryService.channel.assertQueue('inventory.queue');
		await InventoryService.channel.bindQueue(q.queue, 'order-process-exchange', 'order.inventory');
		InventoryService.queueName = q.queue;
		console.log('✅ Exchange and queues configured');
	}

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
