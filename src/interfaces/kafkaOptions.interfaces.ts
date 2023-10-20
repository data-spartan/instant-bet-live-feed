import { Deserializer, Serializer, Transport } from '@nestjs/microservices';
import {
  CompressionTypes,
  ConsumerConfig,
  KafkaConfig,
  ProducerConfig,
} from 'kafkajs';

export interface KafkaOptions {
  transport?: Transport.KAFKA;
  options?: {
    client?: KafkaConfig;
    consumer?: ConsumerConfig;
    subscribe?: {
      topics: string[];
      fromBeginning: boolean;
    };
    run?: {
      autoCommit?: boolean;
      autoCommitInterval?: number | null;
      autoCommitThreshold?: number | null;
      eachBatchAutoResolve?: boolean;
      partitionsConsumedConcurrently?: number;
    };
    producer?: ProducerConfig;
    send?: {
      acks?: number;
      timeout?: number;
      compression?: CompressionTypes;
    };
    serializer?: Serializer;
    deserializer?: Deserializer;
  };
}
