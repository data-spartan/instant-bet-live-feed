import { RpcException } from '@nestjs/microservices';

export interface KafkaErrorCount {
  pattern: string;
  count: number;
}

export interface KafkaErrorObject {
  error: RpcException;
  errIndex: number;
}
