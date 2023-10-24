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
            brokers: ['localhost:9092', 'localhost:9093'],
          },
          producerOnlyMode: true,
        },
      }),
    },
  ],
  exports: ['LIVE_FEED'],
})
export class GlobalModule {}
