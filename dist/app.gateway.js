"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const app_filters_1 = require("./app.filters");
const app_service_1 = require("./app.service");
const gameEngine_client_1 = require("./client/gameEngine.client");
const messages_1 = require("./constants/messages");
const game_model_1 = require("./models/game.model");
const eventsToForward = [
    game_model_1.State.GAME_STARTED,
    game_model_1.State.TAKING_BETS,
    game_model_1.State.GAME_CRASHED,
];
let AppGateway = class AppGateway {
    constructor(appService) {
        this.appService = appService;
        this.logger = new common_1.Logger('AppGateway');
    }
    afterInit() {
        this.logger.log('Gateway ready');
        this.appService.setServer(this.server);
        messages_1.GAME_EVENTS.forEach((event) => {
            gameEngine_client_1.default.on(event, async (data) => {
                this.appService.setCurrentGameState(game_model_1.State[event], data);
                if (event === messages_1.GAME_STARTED) {
                    this.appService.startCountdown();
                }
                if (event === messages_1.ROUND_IN_PROGRESS) {
                    this.appService.handleBatchExitsForTargetAndMaxMultiplier(data.currentMultiplier);
                    if (data.tickNumber === 0) {
                        this.server.emit(event, data);
                    }
                }
                if (event === messages_1.GAME_CRASHED) {
                    this.appService.handleGameCrash();
                }
                if (eventsToForward.includes(event)) {
                    if (data.jackpot && event === game_model_1.State.GAME_CRASHED) {
                        return;
                    }
                    this.server.emit(event, data);
                }
            });
        });
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        const currentGameState = this.appService.getCurrentGameState();
        client.emit(currentGameState.state, Object.assign(Object.assign({}, currentGameState.data), { acceptedBets: this.appService.acceptedBets, countdown: this.appService.countdown }));
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.server.emit(messages_1.CLIENT_DISCONNECTED, client.id);
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Object)
], AppGateway.prototype, "server", void 0);
AppGateway = __decorate([
    websockets_1.WebSocketGateway(),
    common_1.UseFilters(new app_filters_1.LogAndEmitWSExceptionsFilter()),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map