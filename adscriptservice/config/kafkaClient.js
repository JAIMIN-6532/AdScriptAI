import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'adscriptservice',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],   //for local : localhost:29092, for docker: kafka:9092
});

export default kafka;
