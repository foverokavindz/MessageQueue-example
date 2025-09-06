import amqp from 'amqplib';

export class SmsService {
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
			SmsService.connection = await amqp.connect('amqp://rabbitmq');
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
