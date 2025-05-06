const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'env-dev',
  brokers: ['192.168.1.7:9193']
});

const producer = kafka.producer();

const runProducer = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      {
        key: 'order-123',
        value: JSON.stringify({
          type: 'SEND_NOTIFICATION',
          orderId: 'order-123',
          request: { customer: 'Alice', items: ['itemA', 'itemB'], total: 200 }
        })
      },
    ],
  })
};

// sẽ thêm vào 1 cách randoms
const runProducerRandom = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      { value: JSON.stringify({ message: 'Hello KafkaJS user1!' }) }
    ],
  })
};

// runProducerWithSpecificTopic sẽ hash theo 1 hàm hash nào đó nếu cùng một key auto vào chung 1 partition
const runProducerWithSpecificTopic = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [{
      key: 'order-123',
      value: JSON.stringify({
        type: 'ORDER_CREATED',
        orderId: 'order-123',
        request: { customer: 'Alice', items: ['itemA', 'itemB'], total: 200 }
      })
    },
    {
      key: 'order-123',
      value: JSON.stringify({
        type: 'PAYMENT_CREATED',
        orderId: 'order-123',
        request: { method: 'credit_card', status: 'paid', amount: 200 }
      })
    },
    ],
  })
};
runProducerRandom().catch(error => console.error(error))
runProducerWithSpecificTopic().catch(error => console.error(error));
runProducer().catch(error => console.error(error));





// Thứ tự
// 1. send messsage cho 1 partition / mul partitions khÔng có key -> random
// 2. send nhiều message theo key -> sẽ vào 1 partitions
// 3. setup cho producer với custom partitioner ->  custom partitioners
// 4. Consumer với 1 con trong 1 group / nhiều con trong 1 group -> phân chia partition random cho các con, mô tả là ko nhận message  
// từ partition mà nó không được nhận / nếu như nhiều group mới nó sẽ chạy lại dữ liệu từ ban đầu nó chưa được ghi nhớ -> chạy runProducer trong producer-ưith-custom
// 5. custom phân chia partition cho các con -> partitionAssigners
// 6. show chạy lần lượt trên message và concurrency trên partition 
// -> chir caanf chayj producer -> 