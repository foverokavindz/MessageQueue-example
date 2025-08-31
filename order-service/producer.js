export class Producer {
	constructor(channel, consumer) {
		this.channel = channel;
		this.consumer = consumer;
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

		this.consumer.consumeMessage('order.complete.queue');
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
