export class Consumer {
	constructor(channel, queueName, producer) {
		// Store the message queue channel
		this.channel = channel;
		// Store the queue name to consume from
		this.queueName = queueName;
		// Store the producer for publishing messages
		this.producer = producer;
	}

	async consumeMessage() {
		// Start consuming messages from the queue
		this.channel.consume(this.queueName, (msg) => {
			if (msg) {
				// Parse the message content from JSON
				const data = JSON.parse(msg.content.toString());
				console.log('📨 Received message:', data);

				setTimeout(() => {
					console.log('Simulating delay for order inventory update:', data.orderId);
				}, 3000);

				// Forward the message to the payment queue
				this.producer.publishInventoryMessage('order.payment', data);

				// Acknowledge the message as processed
				this.channel.ack(msg);
			}
		});
	}
}
