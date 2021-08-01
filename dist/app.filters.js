"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogAndEmitWSExceptionsFilter = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
let LogAndEmitWSExceptionsFilter = class LogAndEmitWSExceptionsFilter extends websockets_1.BaseWsExceptionFilter {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger('AppGateway');
    }
    catch(exception, host) {
        super.catch(exception, host);
        const ctx = host.switchToWs();
        const client = ctx.getClient();
        this.logger.log(`Client ${client.id}: ${exception.getError()}`);
    }
};
LogAndEmitWSExceptionsFilter = __decorate([
    common_1.Catch()
], LogAndEmitWSExceptionsFilter);
exports.LogAndEmitWSExceptionsFilter = LogAndEmitWSExceptionsFilter;
//# sourceMappingURL=app.filters.js.map