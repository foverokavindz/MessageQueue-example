import amqp from 'amqplib';

export class OrderService {
	static instance;
	static connection;
	static channel;
	static queueName;

	constructor() {
		if (OrderService.instance) {
			return OrderService.instance;
		}
		OrderService.instance = this;
	}

	static getInstance() {
		if (!OrderService.instance) {
			OrderService.instance = new OrderService();
		}
		return OrderService.instance;
	}

	async init() {
		if (!OrderService.connection) {
			OrderService.connection = await amqp.connect('amqp://localhost');
			console.log('✅ Connected to RabbitMQ');
		}
		if (!OrderService.channel) {
			OrderService.channel = await OrderService.connection.createChannel();
			console.log('✅ Channel created');
		}

		await this.setupExchangeAndQueues();
	}

	async setupExchangeAndQueues() {
		await OrderService.channel.assertExchange('order-process-exchange', 'direct');
		const q = await OrderService.channel.assertQueue('order.complete.queue');
		await OrderService.channel.bindQueue(q.queue, 'order-process-exchange', 'order.complete');
		OrderService.queueName = q.queue;
		console.log('✅ Exchange and queues configured');
	}

	getConnection() {
		return OrderService.connection;
	}

	getChannel() {
		return OrderService.channel;
	}

	getQueueName() {
		return OrderService.queueName;
	}
}
