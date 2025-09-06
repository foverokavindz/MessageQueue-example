import amqp from 'amqplib';

export class EmailService {
	static instance;
	static connection;
	static channel;
	static queueName;

	constructor() {
		if (EmailService.instance) {
			return EmailService.instance;
		}
		EmailService.instance = this;
	}

	static getInstance() {
		if (!EmailService.instance) {
			EmailService.instance = new EmailService();
		}
		return EmailService.instance;
	}

	async init() {
		if (!EmailService.connection) {
			EmailService.connection = await amqp.connect('amqp://rabbitmq');
			console.log('✅ Connected to RabbitMQ');
		}
		if (!EmailService.channel) {
			EmailService.channel = await EmailService.connection.createChannel();
			console.log('✅ Channel created');
		}

		await this.setupExchangeAndQueues();
	}

	async setupExchangeAndQueues() {
		await EmailService.channel.assertExchange('order-process-exchange', 'direct');
		const q = await EmailService.channel.assertQueue('email.queue');
		await EmailService.channel.bindQueue(q.queue, 'order-process-exchange', 'order.complete');
		EmailService.queueName = q.queue;
		console.log('✅ Exchange and queues configured');
	}

	getConnection() {
		return EmailService.connection;
	}

	getChannel() {
		return EmailService.channel;
	}

	getQueueName() {
		return EmailService.queueName;
	}
}
