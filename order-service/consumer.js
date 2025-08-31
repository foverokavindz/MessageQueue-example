export class Consumer {
	constructor(channel) {
		this.channel = channel;
	}

	async consumeMessage(queueName) {
		this.channel.consume(queueName, (msg) => {
			if (msg) {
				const data = JSON.parse(msg.content.toString());
				console.log('📨 Received message:', data);

				this.channel.ack(msg);
			}
		});
	}
}
