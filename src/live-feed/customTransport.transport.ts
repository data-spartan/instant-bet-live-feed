import {
  BaseRpcContext,
  CustomTransportStrategy,
  ReadPacket,
  ServerKafka,
} from '@nestjs/microservices';
import { Subject, connectable, isObservable, lastValueFrom } from 'rxjs';

export class AppServerKafka
  extends ServerKafka
  implements CustomTransportStrategy
{
  public async handleEvent(
    pattern: string,
    packet: ReadPacket,
    context: BaseRpcContext,
  ): Promise<any> {
    const handler = this.getHandlerByPattern(pattern);
    if (!handler) {
      return this.logger.error(` Event pattern: ${JSON.stringify(pattern)}.`);
    }

    const resultOrStream = await handler(packet.data, context);
    if (isObservable(resultOrStream)) {
      if (handler.extras?.durable) {
        return lastValueFrom(resultOrStream); // throw error here
      }

      const connectableSource = connectable(resultOrStream, {
        connector: () => new Subject(),
        resetOnDisconnect: false,
      });
      connectableSource.connect();
    }
  }
}
