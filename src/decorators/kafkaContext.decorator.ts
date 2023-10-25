import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

export const KafkaCtx = createParamDecorator(
  (data: keyof KafkaContext, ctx: ExecutionContext): Object => {
    const kafkaCtx = ctx.switchToRpc().getContext<KafkaContext>();
    const { offset } = kafkaCtx.getMessage();

    const partition = kafkaCtx.getPartition();
    const topic = kafkaCtx.getTopic();
    return { kafkaCtx, offset, partition, topic };
  },
);
