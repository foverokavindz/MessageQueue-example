export class Consumer {
	constructor(channel) {
		// Store the message queue channel for consuming messages
		this.channel = channel;
	}

	async consumeMessage(queueName) {
		// Set up message consumption from the specified queue
		this.channel.consume(queueName, (msg) => {
			if (msg) {
				// Parse the message content from buffer to JSON
				const data = JSON.parse(msg.content.toString());

				setTimeout(() => {
					console.log('Simulating delay for order completion:', data.orderId);
				}, 3000);

				console.log('📨 Received message:', data);

				// Acknowledge the message as processed
				this.channel.ack(msg);
			}
		});
	}
}
