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

				setTimeout(() => {
					console.log('Simulating delay for sms:', data.orderId);
				}, 3000);

				this.producer.publishStatusMessage(data.orderId, 'order.status', 'SMS_SENT');

				this.channel.ack(msg);
			}
		});
	}
}
