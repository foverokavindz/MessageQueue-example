export class Consumer {
	constructor(channel, queueName, producer) {
		this.channel = channel;
		this.queueName = queueName;
		this.producer = producer;
	}

	async consumeMessage() {
		this.channel.consume(this.queueName, (msg) => {
			if (msg) {
				const data = JSON.parse(msg.content.toString());
				console.log('📨 Received message:', data);

				this.producer.publishStatusMessage(data.orderId, 'order.status', 'SMS_SENT');

				this.channel.ack(msg);
			}
		});
	}
}
