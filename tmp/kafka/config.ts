import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';

const config: KafkaConfig = {
    brokers: ['localhost:9092']
};

const kafka = new Kafka(config);

const producer: Producer = kafka.producer();

const createConsumer = async (groupId: string) => {
    const consumer = kafka.consumer({ groupId });
    return consumer;
};
export {
    producer,
    createConsumer
};

export const createProducer = async (): Promise<Producer> => {
    const producer = kafka.producer();
    await producer.connect();
    return producer;
};

// Tópicos criados e exportados para uso em outros módulos
export const TOPICS = {
    TEMPERATURA: 'hidroponia_temperatura',
    UMIDADE: 'hidroponia_umidade',
    CONDUTIVIDADE: 'hidroponia_condutividade'
};