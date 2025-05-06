const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'env-dev',
  brokers: ['192.168.1.7:9193']
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
// test thông qua 1 user bình thường { partition: 0, offset: '0', value: 'Hello KafkaJS user!' } còn đang chứa log
// const consumer = kafka.consumer({ groupId: 'test-group'})
const consumer = kafka.consumer({ groupId: 'test-group' })
const runConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({
    topic: 'test-topic',
    fromBeginning: true
  })

  //  sử dụng với seek
  // consumer.on(consumer.events.GROUP_JOIN, async (event) => {
  //   console.log('Joined group, now seeking to offset 0...');
  //   await consumer.seek({
  //     topic: 'test-topic',
  //     partition: 0,
  //     offset: 0,
  //   });
  // });
  // consumer.run({ eachMessage: async ({ topic, message }) => true })
  // consumer.seek({ topic: 'test-topic', partition: 0, offset: 0 })

  await consumer.run({
    // partitionsConsumedConcurrently: 3, // sử dụng đồng thời 2 partition
    eachMessage: async ({ topic, partition, message }) => {
      await delay(2000); // giả sử là xử lý logic mất 2s
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
    //  sẽ là xử lý logic các message theo batch
    // eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
    //   await delay(2000);
    //   for (let message of batch.messages) {
    //     console.log({
    //       topic: batch.topic,
    //       partition: batch.partition,
    //       highWatermark: batch.highWatermark,
    //       message: {
    //         offset: message.offset,
    //         // key: message.key.toString(),
    //         value: message.value.toString(),
    //         headers: message.headers,
    //       }
    //     })
    //     await resolveOffset(message.offset);
    //     await heartbeat();
    //   }
    // }
  });
}
runConsumer().catch(error => console.error(error));