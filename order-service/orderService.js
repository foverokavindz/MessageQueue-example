import amqp from 'amqplib';

export class OrderService {
	static instance;
	static connection;
	static channel;
	static queueName;

	// Singleton constructor - ensures only one instance exists
	constructor() {
		if (OrderService.instance) {
			return OrderService.instance;
		}
		OrderService.instance = this;
	}

	// Get the singleton instance
	static getInstance() {
		if (!OrderService.instance) {
			OrderService.instance = new OrderService();
		}
		return OrderService.instance;
	}

	// Initialize RabbitMQ connection and channel
	async init() {
		// Connect to RabbitMQ server
		if (!OrderService.connection) {
			OrderService.connection = await amqp.connect('amqp://rabbitmq');
			console.log('✅ Connected to RabbitMQ');
		}
		// Create a channel for communication
		if (!OrderService.channel) {
			OrderService.channel = await OrderService.connection.createChannel();
			console.log('✅ Channel created');
		}

		await this.setupExchangeAndQueues();
	}

	// Configure exchange and queue bindings
	async setupExchangeAndQueues() {
		// Create direct exchange for order processing
		await OrderService.channel.assertExchange('order-process-exchange', 'direct');
		// Create queue for completed orders
		const q = await OrderService.channel.assertQueue('order.complete.queue');
		// Bind queue to exchange with routing key
		await OrderService.channel.bindQueue(q.queue, 'order-process-exchange', 'order.complete');
		OrderService.queueName = q.queue;
		console.log('✅ Exchange and queues configured');
	}

	// Get the RabbitMQ connection
	getConnection() {
		return OrderService.connection;
	}

	// Get the RabbitMQ channel
	getChannel() {
		return OrderService.channel;
	}

	// Get the queue name
	getQueueName() {
		return OrderService.queueName;
	}
}
