// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { ConsumerService } from './consumer.service';

// @Injectable()
// export class CreateConsumer implements OnModuleInit {
//   constructor(private readonly consumerService: ConsumerService) {}

//   async onModuleInit() {
//     console.log('IN CONSUMER CREATION');
//     await this.consumerService.consume({
//       topic: { topic: 'live_feed' },
//       config: { groupId: 'live-feed-consumer' },
//       onMessage: async (message) => {
//         console.log({
//           value: message.value,
//         });
//         // throw new Error('Test error!');
//       },
//     });
//   }
// }
