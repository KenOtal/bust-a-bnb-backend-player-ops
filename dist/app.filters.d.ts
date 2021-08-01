import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ArgumentsHost } from '@nestjs/common';
export declare class LogAndEmitWSExceptionsFilter extends BaseWsExceptionFilter {
    private logger;
    catch(exception: WsException, host: ArgumentsHost): void;
}
