export class Producer {
	constructor(channel, consumer) {
		this.channel = channel;
		this.consumer = consumer;
	}

	// Publishes an inventory update message and triggers order completion consumption
	async publishUpdateInventoryMessage(routingKey, orderData) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		// Create inventory message with order status and timestamp
		const inventoryMessage = {
			...orderData,
			orderStatus: 'PLACED',
			timestamp: new Date().toISOString(),
		};

		setTimeout(() => {
			console.log('Simulating delay for order:', orderData.orderId);
		}, 3000);

		// Publish inventory message to exchange
		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(inventoryMessage)));
		console.log(`Message published to exchange order-process-exchange with routing key ${routingKey}`);

		setTimeout(() => {
			console.log('Simulating delay for order status update:', orderData.orderId);
		}, 3000);

		// Publish status update for order placement
		await this.publishStatusMessage(orderData.orderId, 'order.status', 'ORDER_PLACED');

		// Start consuming order completion messages
		this.consumer.consumeMessage('order.complete.queue');
	}

	// Publishes a status message for order tracking
	async publishStatusMessage(orderId, routingKey, status) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		// Create status message with service identifier
		const statusMessage = {
			orderId,
			service: 'ORDER',
			status,
			timestamp: new Date().toISOString(),
		};

		// Publish status message to exchange
		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(statusMessage)));
		console.log('Status update published:', status, 'for', orderId);
	}
}
