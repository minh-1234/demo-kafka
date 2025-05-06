const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'env-dev',
  brokers: ['192.168.1.7:9193']
});

// config cho load-balacing các message cho producer Custom partitioner
//  hiện tại là cho lần lượt message vào từng partition round-robin
let currentPartition = 0;
const mapTypeToPartition = {
  'ORDER_CREATED': 0,
  'PAYMENT_CREATED': 1,
  'SEND_NOTIFICATION': 2
}
// đang tồn tại 2 loại loại đầu đang phân theo là mapTypeToPartition
const createRoundRobinPartitioner = () => {
  return ({ topic, partitionMetadata, message }) => {
    const object = JSON.parse(message.value)

    console.log("//21 test message.value.type) ", object)
    if (object.type) {
      return mapTypeToPartition[object.type]
    }
    const partition = currentPartition;
    currentPartition = (currentPartition + 1) % partitionMetadata.length;
    return partition;
  };
};

// const producer = kafka.producer();
const producer = kafka.producer({ createPartitioner: createRoundRobinPartitioner })

const runProducer = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      { value: JSON.stringify({ message: 'Hello KafkaJS user1!' }) }
    ],
  })
};
const runProducerWithSpecificPartition = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      // {
      //   value: JSON.stringify({
      //     type: 'ORDER_CREATED',
      //     orderId: 'order-123',
      //     request: { customer: 'Alice', items: ['itemA', 'itemB'], total: 200 }
      //   })
      // },
      {
        value: JSON.stringify({
          type: 'SEND_NOTIFICATION',
          orderId: 'order-123',
          request: { message: 'Your order has been placed successfully' }
        })
      },
      // {
      //   value: JSON.stringify({
      //     type: 'PAYMENT_CREATED',
      //     orderId: 'order-123',
      //     request: { method: 'credit_card', status: 'paid', amount: 201 }
      //   })
      // }
    ],
  })
};
runProducer().catch(error => console.error(error));
// runProducerWithSpecificPartition().catch(error => console.error(error));