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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bets_model_1 = require("../models/bets.model");
const game_model_1 = require("../models/game.model");
const bet_schema_1 = require("./schemas/bet.schema");
const player_schema_1 = require("./schemas/player.schema");
let AuditoriesService = class AuditoriesService {
    constructor(playerExitModel, betModel) {
        this.playerExitModel = playerExitModel;
        this.betModel = betModel;
    }
    recordBet(bet) {
        const record = new this.betModel(bet);
        return record.save();
    }
    recordExit(playerExit) {
        const record = new this.playerExitModel(playerExit);
        return record.save();
    }
    recordExitsFromAcceptedBets(playersExit, gameSnapshot) {
        const records = playersExit.map((exit) => ({
            gameState: gameSnapshot.state,
            roundNumber: gameSnapshot.data.roundNumber,
            multiplier: exit.exitMultiplier,
            tickNumber: gameSnapshot.data.tickNumber,
            address: exit.address,
            exited: true,
            timestamp: Date.now(),
        }));
        this.playerExitModel.insertMany(records);
    }
};
AuditoriesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel(player_schema_1.PlayerExit.name)),
    __param(1, mongoose_1.InjectModel(bet_schema_1.Bet.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AuditoriesService);
exports.AuditoriesService = AuditoriesService;
//# sourceMappingURL=auditories.service.js.map