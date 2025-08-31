// email-service.js
const amqp = require('amqplib');

class EmailService {
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
			EmailService.connection = await amqp.connect('amqp://localhost');
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

class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	async publishStatusMessage(orderId, routingKey, status) {
		const statusMessage = {
			orderId,
			service: 'EMAIL',
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

				const producer = new Producer(this.channel);
				producer.publishStatusMessage(data.orderId, 'order.status', 'EMAIL_SENT');

				this.channel.ack(msg);
			}
		});
	}
}

// START THE SERVICE
async function main() {
	try {
		const emailService = EmailService.getInstance();
		await emailService.init();

		const consumer = new Consumer(emailService.getChannel(), emailService.getQueueName());

		await consumer.consumeMessage();

		console.log('📧 Email Service running...');
	} catch (error) {
		console.error('💥 Failed to start Email Service:', error);
		process.exit(1);
	}
}

main();
