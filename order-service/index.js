const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

class OrderService {
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

class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	async publishUpdateInventoryMessage(routingKey, orderData) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		const inventoryMessage = {
			...orderData,
			orderStatus: 'PLACED',
			timestamp: new Date().toISOString(),
		};

		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(inventoryMessage)));
		console.log(`Message published to exchange order-process-exchange with routing key ${routingKey}`);

		await this.publishStatusMessage(orderData.orderId, 'order.status', 'ORDER_PLACED');

		const consumer = new Consumer(this.channel, 'order.complete.queue');
		consumer.consumeMessage();
	}

	async publishStatusMessage(orderId, routingKey, status) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');
		const statusMessage = {
			orderId,
			service: 'ORDER',
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

				this.channel.ack(msg);
			}
		});
	}
}

const app = express();

app.use(bodyParser.json('application/json'));

// Wrap the initialization in an async function
async function startServer() {
	try {
		const orderService = OrderService.getInstance();
		await orderService.init();
		const producer = new Producer(orderService.getChannel());

		app.post('/place-order', async (req, res, next) => {
			const orderData = req.body;

			try {
				await producer.publishUpdateInventoryMessage('order.inventory', orderData);
				res.status(200).send('Order is being processed');
			} catch (error) {
				console.log(error);
				res.status(500).send('Error processing order');
			}
		});

		app.listen(3000, () => {
			console.log('✅ Server is listening on port 3000');
		});
	} catch (error) {
		console.error('💥 Failed to start Order Service:', error);
		process.exit(1);
	}
}

startServer();
