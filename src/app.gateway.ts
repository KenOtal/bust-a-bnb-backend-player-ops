import { Logger, UseFilters } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LogAndEmitWSExceptionsFilter } from './app.filters';
import { AppService } from './app.service';
import gameEngineClient from './client/gameEngine.client';
import {
  CLIENT_DISCONNECTED,
  GAME_CRASHED,
  GAME_EVENTS,
  GAME_STARTED,
  ROUND_IN_PROGRESS,
} from './constants/messages';
import { GameData, State } from './models/game.model';

const eventsToForward: State[] = [
  State.GAME_STARTED,
  State.TAKING_BETS,
  State.GAME_CRASHED,
];

@WebSocketGateway()
@UseFilters(new LogAndEmitWSExceptionsFilter())
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  constructor(private readonly appService: AppService) {}

  afterInit() {
    this.logger.log('Gateway ready');
    this.appService.setServer(this.server);

    GAME_EVENTS.forEach((event) => {
      gameEngineClient.on(event, async (data: GameData) => {
        // Update state on appService and forward to game-client
        this.appService.setCurrentGameState(State[event], data);

        if (event === GAME_STARTED) {
          this.appService.startCountdown();
        }

        if (event === ROUND_IN_PROGRESS) {
          this.appService.handleBatchExitsForTargetAndMaxMultiplier(
            data.currentMultiplier,
          );

          if (data.tickNumber === 0) {
            this.server.emit(event, data);
          }
        }

        if (event === GAME_CRASHED) {
          this.appService.handleGameCrash();
        }

        if (eventsToForward.includes(event as State)) {
          if (data.jackpot && event === State.GAME_CRASHED) {
            // Jackpot event will be triggered in appService
            return;
          }

          this.server.emit(event, data);
        }
      });
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const currentGameState = this.appService.getCurrentGameState();
    client.emit(currentGameState.state, {
      ...currentGameState.data,
      acceptedBets: this.appService.acceptedBets,
      countdown: this.appService.countdown,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server.emit(CLIENT_DISCONNECTED, client.id);
  }
}
