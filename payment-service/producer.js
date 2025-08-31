export class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	async publishPaymentMessage(routingKey, orderData) {
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
