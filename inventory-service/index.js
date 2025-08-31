// inventory-service.js
const amqp = require('amqplib');

class InventoryService {
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

class Producer {
	constructor() {
		this.channel = InventoryService.channel;
	}

	async publishInventoryMessage(routingKey, orderData) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		const inventoryMessage = {
			...orderData,
			inventoryStatus: 'CONFIRMED',
			timestamp: new Date().toISOString(),
		};

		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(inventoryMessage)));
		console.log(`Message published to exchange order-process-exchange with routing key ${routingKey}`);

		await this.publishStatusMessage(orderData.orderId, 'order.status', 'PAYMENT_CONFIRMED');
	}

	async publishStatusMessage(orderId, routingKey, status) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');
		const statusMessage = {
			orderId,
			service: 'INVENTORY',
			status,
			timestamp: new Date().toISOString(),
		};
		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(statusMessage)));
		console.log('Status update published:', status, 'for', orderId);
	}
}

class Consumer {
	constructor(channel, queueName) {
		this.channel = channel;
		this.queueName = queueName;
	}

	async consumeMessage() {
		this.channel.consume(this.queueName, (msg) => {
			if (msg) {
				const data = JSON.parse(msg.content.toString());
				console.log('📨 Received message:', data);

				const producer = new Producer();
				producer.publishInventoryMessage('order.payment', data);

				this.channel.ack(msg);
			}
		});
	}
}

// START THE SERVICE
async function main() {
	try {
		const inventoryService = InventoryService.getInstance();
		await inventoryService.init();

		const consumer = new Consumer(inventoryService.getChannel(), inventoryService.getQueueName());

		await consumer.consumeMessage();

		console.log('🏪 Inventory Service running...');
	} catch (error) {
		console.error('💥 Failed to start Inventory Service:', error);
		process.exit(1);
	}
}

main();

// {
//     orderId: '12345',
//     name: 'Product Name',
//     price: 100,
//     userId : 'user-001',
// }
