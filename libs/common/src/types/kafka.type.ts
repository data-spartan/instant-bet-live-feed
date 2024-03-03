import {
  Deserializer,
  KafkaContext,
  RpcException,
  Serializer,
  Transport,
} from '@nestjs/microservices';
import {
  CompressionTypes,
  Consumer,
  ConsumerConfig,
  KafkaConfig,
  Producer,
  ProducerConfig,
} from 'kafkajs';

export interface CustomKafkaContext {
  kafkaCtx: KafkaContext;
  offset: string; // Change the type to match your actual offset type
  partition: number; // Change the type to match your actual partition type
  topic: string; // Change the type to match your actual topic type
  consumer: Consumer;
  producer: Producer;
}

export interface KafkaErrorCount {
  pattern: string;
  count: number;
}

export interface KafkaErrorObject {
  error: RpcException;
  errIndex: number;
}

export interface KafkaOptions {
  name?: string;
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

export type InheritAppConfig = {
  inheritConfig: {
    inheritAppConfig: true;
  };
};
