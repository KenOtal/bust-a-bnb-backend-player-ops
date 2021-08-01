"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMiddleware = void 0;
const common_1 = require("@nestjs/common");
const auth_interface_1 = require("../auth/auth.interface");
let ApiMiddleware = class ApiMiddleware {
    use(req, _, next) {
        const apiKey = req.headers['admin-api-key'];
        if (apiKey !== process.env.ADMIN_API_KEY) {
            throw new common_1.UnauthorizedException();
        }
        next();
    }
};
ApiMiddleware = __decorate([
    common_1.Injectable()
], ApiMiddleware);
exports.ApiMiddleware = ApiMiddleware;
//# sourceMappingURL=api.middleware.js.map