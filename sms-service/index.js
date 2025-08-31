// sms-service.js
const amqp = require('amqplib');

class SmsService {
	static instance;
	static connection;
	static channel;
	static queueName;

	constructor() {
		if (SmsService.instance) {
			return SmsService.instance;
		}
		SmsService.instance = this;
	}

	static getInstance() {
		if (!SmsService.instance) {
			SmsService.instance = new SmsService();
		}
		return SmsService.instance;
	}

	async init() {
		if (!SmsService.connection) {
			SmsService.connection = await amqp.connect('amqp://localhost');
			console.log('✅ Connected to RabbitMQ');
		}
		if (!SmsService.channel) {
			SmsService.channel = await SmsService.connection.createChannel();
			console.log('✅ Channel created');
		}

		await this.setupExchangeAndQueues();
	}

	async setupExchangeAndQueues() {
		await SmsService.channel.assertExchange('order-process-exchange', 'direct');
		const q = await SmsService.channel.assertQueue('sms.queue');
		await SmsService.channel.bindQueue(q.queue, 'order-process-exchange', 'order.complete');
		SmsService.queueName = q.queue;
		console.log('✅ Exchange and queues configured');
	}

	getConnection() {
		return SmsService.connection;
	}

	getChannel() {
		return SmsService.channel;
	}

	getQueueName() {
		return SmsService.queueName;
	}
}

class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	async publishStatusMessage(orderId, routingKey, status) {
		const statusMessage = {
			orderId,
			service: 'SMS',
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
				producer.publishStatusMessage(data.orderId, 'order.status', 'SMS_SENT');

				this.channel.ack(msg);
			}
		});
	}
}

// START THE SERVICE
async function main() {
	try {
		const smsService = SmsService.getInstance();
		await smsService.init();

		const consumer = new Consumer(smsService.getChannel(), smsService.getQueueName());

		await consumer.consumeMessage();

		console.log('📱 SMS Service running...');
	} catch (error) {
		console.error('💥 Failed to start SMS Service:', error);
		process.exit(1);
	}
}

main();
