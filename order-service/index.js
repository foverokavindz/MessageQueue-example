import express from 'express';
import bodyParser from 'body-parser';
import { OrderService } from './orderService.js';
import { Producer } from './producer.js';
import { Consumer } from './consumer.js';

// Create Express app instance
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json('application/json'));

// Wrap the initialization in an async function
async function startServer() {
	try {
		// Initialize order service and get message queue channel
		const orderService = OrderService.getInstance();
		await orderService.init();
		const channel = orderService.getChannel();

		// Set up message queue consumer and producer
		const consumer = new Consumer(channel, orderService.getQueueName());
		const producer = new Producer(channel, consumer);

		// Route to handle order placement
		app.post('/place-order', async (req, res, next) => {
			const orderData = req.body;

			try {
				// Publish message to update inventory
				await producer.publishUpdateInventoryMessage('order.inventory', orderData);
				res.status(200).send('Order is being processed');
			} catch (error) {
				console.log(error);
				res.status(500).send('Error processing order');
			}
		});

		// Start the server
		app.listen(3000, () => {
			console.log('✅ Server is listening on port 3000');
		});
	} catch (error) {
		console.error('💥 Failed to start Order Service:', error);
		process.exit(1);
	}
}

// Start the application
startServer();
