// inventory-service.js
const amqp = require('amqplib');

class PaymentService {
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
			PaymentService.connection = await amqp.connect('amqp://localhost');
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

class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	async publishPaymentMessage(routingKey, orderData) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		const paymentMessage = {
			...orderData,
			paymentStatus: 'CONFIRMED',
			timestamp: new Date().toISOString(),
		};

		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(paymentMessage)));
		console.log(`Message published to exchange order-process-exchange with routing key ${routingKey}`);

		await this.publishStatusMessage(orderData.orderId, 'order.status', 'PAYMENT_CONFIRMED');
	}

	async publishStatusMessage(orderId, routingKey, status) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');
		const statusMessage = {
			orderId,
			service: 'PAYMENT',
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
				producer.publishPaymentMessage('order.complete', data);

				this.channel.ack(msg);
			}
		});
	}
}

// START THE SERVICE
async function main() {
	try {
		const paymentService = PaymentService.getInstance();
		await paymentService.init();

		const consumer = new Consumer(paymentService.getChannel(), paymentService.getQueueName());

		await consumer.consumeMessage();

		console.log('🏪 Payment Service running...');
	} catch (error) {
		console.error('💥 Failed to start Payment Service:', error);
		process.exit(1);
	}
}

main();
