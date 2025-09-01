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
					console.log('Simulating delay for order completion:', data.orderId);
				}, 3000);

				this.producer.publishPaymentMessage('order.complete', data);

				this.channel.ack(msg);
			}
		});
	}
}
