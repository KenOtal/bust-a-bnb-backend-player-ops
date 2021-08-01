import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Catch, ArgumentsHost, Logger } from '@nestjs/common';

@Catch()
export class LogAndEmitWSExceptionsFilter extends BaseWsExceptionFilter {
  private logger: Logger = new Logger('AppGateway');
  catch(exception: WsException, host: ArgumentsHost) {
    super.catch(exception, host);
    const ctx = host.switchToWs();
    const client = ctx.getClient();
    this.logger.log(`Client ${client.id}: ${exception.getError()}`);
  }
}
