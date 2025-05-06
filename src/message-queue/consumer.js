
const { Kafka, AssignerProtocol: { MemberAssignment }, AssignerProtocol: { MemberMetadata }, PartitionAssigners: { roundRobin } } = require('kafkajs')
const kafka = new Kafka({
  clientId: 'env-dev',
  brokers: ['192.168.1.7:9193']
});
const partitions = 3;
// gán trực tiếp với partition trong topic mình mong muốn
// await consumer.assign([
//   { topic: 'test-topic', partition: 0 },
// ]);
// test thông qua 1 user bình thường { partition: 0, offset: '0', value: 'Hello KafkaJS user!' } còn đang chứa log

// config partitions assigner cho consumer nhận partition nào
const CustomAssigner = ({ cluster }) => {
  const joinTimestamp = Date.now(); // Lưu lại chỉ 1 lần khi consumer khởi tạo

  return {
    name: 'CustomAssigner',
    version: 1,

    async assign({ members, topics, userData }) {
      const sortedMembers = members
        .map(member => {
          const metadata = MemberMetadata.decode(member.memberMetadata);
          let data = JSON.parse(metadata.userData.toString());
          let joinTime = data.timestamp
          // const joinTime = JSON.parse(userData.toString()).timestamp;
          // console.log("//28", member, joinTime)
          return { ...member, joinTime };
        })
        .sort((a, b) => a.joinTime - b.joinTime);

      const assignment = sortedMembers.map((member, index) => {
        const topicPartitions = {};
        topics.forEach((topic) => {
          topicPartitions[topic] = [index % partitions];
        });

        return {
          memberId: member.memberId,
          memberAssignment: MemberAssignment.encode({
            version: this.version,
            assignment: topicPartitions,
            userData
          }),
        };
      });

      return assignment;
    },

    protocol: ({ topics }) => {
      const userData = Buffer.from(JSON.stringify({ timestamp: joinTimestamp }));
      return {
        name: 'CustomAssigner',
        metadata: MemberMetadata.encode({ version: this.version, topics, userData }),
      };
    },
  };
};



const consumer = kafka.consumer({
  groupId: 'test-group', // cho vào group_id nào
  partitionAssigners: [CustomAssigner]
});

const runConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true }) //  fromBeginning: false

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // await delay(2000);
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      })
    },
  })
};
runConsumer().catch(error => console.error(error));