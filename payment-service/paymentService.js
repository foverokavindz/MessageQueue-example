import amqp from 'amqplib';

export class PaymentService {
	static instance;
	static connection;
	static channel;
	static queueName;

	constructor() {
		if (PaymentService.instance) {
			return PaymentService.instance;
		}
		PaymentService.instance = this;
	}

	static getInstance() {
		if (!PaymentService.instance) {
			PaymentService.instance = new PaymentService();
		}
		return PaymentService.instance;
	}

	async init() {
		if (!PaymentService.connection) {
			PaymentService.connection = await amqp.connect('amqp://rabbitmq');
			console.log('✅ Connected to RabbitMQ');
		}
		if (!PaymentService.channel) {
			PaymentService.channel = await PaymentService.connection.createChannel();
			console.log('✅ Channel created');
		}

		await this.setupExchangeAndQueues();
	}

	async setupExchangeAndQueues() {
		await PaymentService.channel.assertExchange('order-process-exchange', 'direct');
		const q = await PaymentService.channel.assertQueue('payment.queue');
		await PaymentService.channel.bindQueue(q.queue, 'order-process-exchange', 'order.payment');
		PaymentService.queueName = q.queue;
		console.log('✅ Exchange and queues configured');
	}

	getConnection() {
		return PaymentService.connection;
	}

	getChannel() {
		return PaymentService.channel;
	}

	getQueueName() {
		return PaymentService.queueName;
	}
}
