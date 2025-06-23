import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';

const config: KafkaConfig = {
    brokers: ['0.0.0.0:9092']
};

const kafka = new Kafka(config);

const bancada1: Producer = kafka.producer();
const bancada2: Producer = kafka.producer();
const bancada3: Producer = kafka.producer();

const cliente: Consumer = kafka.consumer({ groupId: "cliente1" });
const web: Consumer = kafka.consumer({ groupId: "web1"});

export {
    bancada1,
    bancada2,
    bancada3,
    cliente,
    web
}


// export async function createConsumer(groupId: string): Promise<Consumer> {
    // const consumer: Consumer = kafka.consumer({ groupId: groupId });
    // await consumer.connect();
    // return consumer;
// };

// export const createProducer = async (): Promise<Producer> => {
    // const producer = kafka.producer();
    // await producer.connect();
    // return producer;
// };

// // Tópicos criados e exportados para uso em outros módulos
// export const TOPICS = {
    // TEMPERATURA: 'hidroponia_temperatura',
    // UMIDADE: 'hidroponia_umidade',
    // CONDUTIVIDADE: 'hidroponia_condutividade'
// };