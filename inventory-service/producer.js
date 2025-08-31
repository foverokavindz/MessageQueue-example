export class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	async publishInventoryMessage(routingKey, orderData) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');

		const inventoryMessage = {
			...orderData,
			inventoryStatus: 'CONFIRMED',
			timestamp: new Date().toISOString(),
		};

		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(inventoryMessage)));
		console.log(`Message published to exchange order-process-exchange with routing key ${routingKey}`);

		await this.publishStatusMessage(orderData.orderId, 'order.status', 'INVENTORY_CONFIRMED');
	}

	async publishStatusMessage(orderId, routingKey, status) {
		// await this.channel.assertExchange('order-process-exchange', 'direct');
		const statusMessage = {
			orderId,
			service: 'INVENTORY',
			status,
			timestamp: new Date().toISOString(),
		};
		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(statusMessage)));
		console.log('Status update published:', status, 'for', orderId);
	}
}
