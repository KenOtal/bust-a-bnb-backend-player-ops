"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
const io = require("socket.io-client");
dotenv.config();
const { GAME_ENGINE_URL } = process.env;
common_1.Logger.log(`Connecting to game-engine ${GAME_ENGINE_URL}`);
const gameEngineClient = io(GAME_ENGINE_URL);
gameEngineClient.on('connect_error', (error) => {
    common_1.Logger.error('There was a problem connecting with game-engine', error.stack);
});
exports.default = gameEngineClient;
//# sourceMappingURL=gameEngine.client.js.map