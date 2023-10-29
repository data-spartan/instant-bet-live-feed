import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';
import { CustomKafkaContext } from 'src/interfaces/kafkaContext.interface';

export const KafkaCtx = createParamDecorator(
  (data: keyof KafkaContext, ctx: ExecutionContext): CustomKafkaContext => {
    const kafkaCtx = ctx.switchToRpc().getContext<KafkaContext>();
    const offset = (Number(kafkaCtx.getMessage().offset) + 1).toString();
    //add +1 bcs evertime consumer restarts it reads last message,
    //  Bcs kafkajs doesnt commit last arrived message
    const partition = kafkaCtx.getPartition();
    const topic = kafkaCtx.getTopic();
    const consumer = kafkaCtx.getConsumer();
    return { kafkaCtx, offset, partition, topic, consumer };
  },
);
