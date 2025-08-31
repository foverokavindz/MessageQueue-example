export class Producer {
	constructor(channel) {
		this.channel = channel;
	}

	async publishStatusMessage(orderId, routingKey, status) {
		const statusMessage = {
			orderId,
			service: 'SMS',
			status,
			timestamp: new Date().toISOString(),
		};
		await this.channel.publish('order-process-exchange', routingKey, Buffer.from(JSON.stringify(statusMessage)));
		console.log('Status update published:', status, 'for', orderId);
	}
}
