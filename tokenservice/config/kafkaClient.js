// common example: kafkaClient.js
import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'tokenservice',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
});

export default kafka;
