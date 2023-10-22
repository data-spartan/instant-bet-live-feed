import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './consumer.service';

@Injectable()
export class TestConsumer implements OnModuleInit {
  constructor(private readonly consumerService: ConsumerService) {}

  async onModuleInit() {
    console.log('IN CONSUMER CREATION');
    await this.consumerService.consume({
      topic: { topic: 'live_feed' },
      config: { groupId: 'test-consumer' },
      onMessage: async (message) => {
        console.log({
          value: message.value[0],
        });
        // throw new Error('Test error!');
      },
    });
  }
}
