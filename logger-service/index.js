const amqp = require('amqplib');

async function consumeMessages() {
	const connection = await amqp.connect('amqp://rabbitmq');

	const channel_one = await connection.createChannel();

	await channel_one.assertExchange('order-process-exchange', 'direct');

	const que_one = await channel_one.assertQueue('logger.queue');

	await channel_one.bindQueue(que_one.queue, 'order-process-exchange', 'order.status');

	channel_one.consume(que_one.queue, (msg) => {
		const data = JSON.parse(msg.content);

		console.log('[Logger Service] [Message received] : ', JSON.stringify(data));

		channel_one.ack(msg);
	});
}

consumeMessages();
