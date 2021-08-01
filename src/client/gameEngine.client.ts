import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as io from 'socket.io-client';

dotenv.config();

const { GAME_ENGINE_URL } = process.env;

Logger.log(`Connecting to game-engine ${GAME_ENGINE_URL}`);
const gameEngineClient = io(GAME_ENGINE_URL);

gameEngineClient.on('connect_error', (error) => {
  Logger.error('There was a problem connecting with game-engine', error.stack);
});

export default gameEngineClient;
