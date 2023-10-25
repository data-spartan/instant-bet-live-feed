import { Global, Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

@Global()
@Module({
  providers: [
    {
      provide: 'LIVE_FEED',
      useValue: ClientProxyFactory.create({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'live-feed',
            brokers: ['localhost:9092', 'localhost:9093'],
          },
          producerOnlyMode: true,
          consumer: {
            groupId: 'live-feed-consumer',
          },
        },
      }),
    },
  ],
  exports: ['LIVE_FEED'],
})
export class GlobalModule {}
