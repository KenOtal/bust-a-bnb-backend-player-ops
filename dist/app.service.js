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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const auditories_service_1 = require("./auditories/auditories.service");
const bankroll_service_1 = require("./bankroll/bankroll.service");
const bets_service_1 = require("./bets/bets.service");
const messages_1 = require("./constants/messages");
const funds_manager_service_1 = require("./funds-manager/funds-manager.service");
const game_model_1 = require("./models/game.model");
let AppService = class AppService {
    constructor(betsService, auditoriesService, fundsManagerService, bankrollService) {
        this.betsService = betsService;
        this.auditoriesService = auditoriesService;
        this.fundsManagerService = fundsManagerService;
        this.bankrollService = bankrollService;
        this.countdown = 0;
        this.acceptedBets = [];
        this.logger = new common_1.Logger('app-service');
        this.game = {
            state: game_model_1.State[messages_1.OFF],
            data: {
                roundNumber: 0,
            },
        };
    }
    setServer(server) {
        this.server = server;
    }
    getServer() {
        return this.server;
    }
    setCurrentGameState(state, data) {
        this.game = { state, data };
    }
    getCurrentGameState() {
        return this.game;
    }
    validateSingleBet(address) {
        if (this.acceptedBets.find((bet) => bet.address === address)) {
            throw messages_1.BET_ALREADY_ACCEPTED;
        }
    }
    validateExit(address) {
        if (this.game.state !== game_model_1.State.ROUND_IN_PROGRESS) {
            throw messages_1.INVALID_STATE_FOR_EXIT;
        }
        const userBet = this.acceptedBets.find((bet) => bet.address === address);
        if (!userBet) {
            throw messages_1.PLAYER_DOESNT_HAVE_ACCEPTED_BET;
        }
        if (userBet.exitMultiplier) {
            throw messages_1.PLAYER_ALREADY_EXITED;
        }
        return userBet;
    }
    handleGameCrash() {
        this.logger.debug('Handling game crashed');
        if (this.game.data.jackpot) {
            this.handleJackpot();
        }
        this.acceptedBets = [];
        this.logger.debug('Accepted bets array cleared');
    }
    acceptBet(user, bet) {
        this.logger.debug(`Accepted bet for user ${user.address}`);
        const maxMultiplier = this.bankrollService.getMaxMultiplierForAmount(bet.amount);
        const acceptedBet = {
            address: user.address,
            amount: bet.amount,
            maxMultiplier: maxMultiplier,
            targetMultiplier: bet.targetMultiplier,
        };
        this.acceptedBets.push(acceptedBet);
        return acceptedBet;
    }
    async dispatchFundManagerOperation(user, operation) {
        const newBalance = await this.fundsManagerService.dispatchEvent(user.address, operation);
        this.server.emit(messages_1.UPDATE_BALANCE, {
            deposit: false,
            address: user.address,
            balance: newBalance.balance,
        });
        return newBalance;
    }
    async handlePlaceBet(bet, user) {
        const partialAuditory = Object.assign(Object.assign({}, bet), { gameState: this.game.state, roundNumber: this.game.data.roundNumber, address: user.address });
        try {
            if (this.game.state !== messages_1.TAKING_BETS) {
                throw messages_1.INVALID_STATE_TO_TAKE_BETS;
            }
            this.validateSingleBet(user.address);
            this.betsService.validate(bet.amount);
            if (bet.targetMultiplier) {
                this.betsService.validateTargetMultiplier(bet.targetMultiplier);
            }
            await this.dispatchFundManagerOperation(user, {
                amount: bet.amount,
                type: 'SUBSTRACT',
            });
            this.auditoriesService.recordBet(Object.assign(Object.assign({}, partialAuditory), { accepted: true, timestamp: Date.now() }));
            const acceptedBet = this.acceptBet(user, bet);
            this.server.emit(messages_1.BET_ACCEPTED, acceptedBet);
            return acceptedBet;
        }
        catch (err) {
            this.auditoriesService.recordBet(Object.assign(Object.assign({}, partialAuditory), { accepted: false, timestamp: Date.now() }));
            throw err;
        }
    }
    async handleExitRound(exitRequest, user) {
        const partialAuditory = Object.assign(Object.assign({}, exitRequest), { gameState: this.game.state, roundNumber: this.game.data.roundNumber, multiplier: this.game.data.currentMultiplier, tickNumber: this.game.data.tickNumber, address: user.address });
        try {
            const gameState = Object.assign({}, this.game.data);
            const userBet = this.validateExit(user.address);
            const winning = this.betsService.calculateWinnings(userBet.amount, gameState.currentMultiplier);
            await this.dispatchFundManagerOperation(user, {
                amount: winning,
                type: 'ADD',
            });
            userBet.exitMultiplier = gameState.currentMultiplier;
            this.auditoriesService.recordExit(Object.assign(Object.assign({}, partialAuditory), { exited: true, timestamp: Date.now() }));
            this.server.emit(messages_1.EXIT_ROUND_SUCCESS, userBet);
            return userBet;
        }
        catch (err) {
            this.auditoriesService.recordExit(Object.assign(Object.assign({}, partialAuditory), { exited: false, timestamp: Date.now() }));
            throw err;
        }
    }
    async sendExitBatchToFundsManager(exits) {
        exits.forEach((exit) => {
            const amount = this.betsService.calculateWinnings(exit.amount, exit.exitMultiplier);
            this.dispatchFundManagerOperation({ address: exit.address }, { amount, type: 'ADD' });
        });
    }
    async handleBatchExitsForTargetAndMaxMultiplier(currentMultiplier) {
        const gameSnapshot = lodash_1.cloneDeep(this.game);
        const betsToExitInBatch = this.acceptedBets.filter((bet) => !bet.exitMultiplier &&
            [bet.targetMultiplier, bet.maxMultiplier].includes(currentMultiplier));
        if (betsToExitInBatch.length) {
            betsToExitInBatch.forEach((bet) => {
                bet.exitMultiplier = currentMultiplier;
            });
            this.auditoriesService.recordExitsFromAcceptedBets(betsToExitInBatch, gameSnapshot);
            this.server.emit(messages_1.EXIT_ROUND_BATCH, betsToExitInBatch);
            this.sendExitBatchToFundsManager(betsToExitInBatch);
        }
    }
    handleJackpot() {
        this.logger.debug('Handling jackpot');
        const { currentMultiplier } = this.game.data;
        const jackpotExits = this.acceptedBets.filter((bet) => !bet.exitMultiplier);
        jackpotExits.forEach((bet) => {
            bet.exitMultiplier = currentMultiplier;
        });
        this.server.emit(messages_1.GAME_CRASHED, {
            jackpot: true,
            jackpotExits,
            currentMultiplier,
        });
        this.sendExitBatchToFundsManager(jackpotExits);
    }
    startCountdown() {
        this.countdown = 500;
        const countDownInterval = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                clearInterval(countDownInterval);
            }
        }, 10);
    }
};
AppService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [bets_service_1.BetsService,
        auditories_service_1.AuditoriesService,
        funds_manager_service_1.FundsManagerService,
        bankroll_service_1.BankrollService])
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map