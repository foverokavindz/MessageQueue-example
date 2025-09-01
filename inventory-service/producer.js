export class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	// Publishes inventory confirmation message and status update
	async publishInventoryMessage(routingKey, orderData) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		// Create inventory message with confirmed status
		const inventoryMessage = {
			...orderData,
			inventoryStatus: 'CONFIRMED',
			timestamp: new Date().toISOString(),
		};

		// Publish inventory message to exchange
		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(inventoryMessage)));
		console.log(`Message published to exchange order-process-exchange with routing key ${routingKey}`);

		// Send status update message
		await this.publishStatusMessage(orderData.orderId, 'order.status', 'INVENTORY_CONFIRMED');
	}

	// Publishes status update messages
	async publishStatusMessage(orderId, routingKey, status) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		// Create status message
		const statusMessage = {
			orderId,
			service: 'INVENTORY',
			status,
			timestamp: new Date().toISOString(),
		};

		// Publish status message to exchange
		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(statusMessage)));
		console.log('Status update published:', status, 'for', orderId);
	}
}
