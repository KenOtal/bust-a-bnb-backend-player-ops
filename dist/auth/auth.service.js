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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto = require("crypto");
const uuid_1 = require("uuid");
const hash_utils_1 = require("../utils/hash.utils");
let AuthService = class AuthService {
    constructor(jwt) {
        this.jwt = jwt;
        this.temporalHashes = new Map();
        this.refreshTokenByAddress = new Map();
        this.authSecretKey = process.env.AUTH_SECRET_KEY;
    }
    createTemporalHash(id, address) {
        const original = uuid_1.v4();
        const hash = crypto.createHash('sha256').update(original).digest('base64');
        this.temporalHashes.set(id, {
            timestamp: new Date(),
            original,
            hash,
            address,
        });
        return hash;
    }
    async getVerifiedAddress(signature, clientId) {
        const hashData = this.temporalHashes.get(clientId);
        if (!hashData) {
            throw new common_1.BadRequestException('NO_TEMPORAL_HASH');
        }
        this.temporalHashes.delete(clientId);
        const confirmedAddres = hash_utils_1.default.getAddressFromHash(signature, hashData.hash);
        if (hashData.address.toLowerCase() !== confirmedAddres) {
            throw new Error('Invalid Address');
        }
        return confirmedAddres;
    }
    getAccessToken(address) {
        const jwtData = { address };
        return this.jwt.sign(jwtData, {
            secret: this.authSecretKey,
            expiresIn: '10m',
        });
    }
    getRefeshToken(address) {
        const jwtData = { address };
        const refreshToken = this.jwt.sign(jwtData, {
            secret: this.authSecretKey,
            expiresIn: '6h',
        });
        this.refreshTokenByAddress.set(address, refreshToken);
        return refreshToken;
    }
    decodeToken(token) {
        return this.jwt.decode(token);
    }
    refreshSession(refreshToken) {
        let jwtData;
        try {
            jwtData = this.jwt.decode(refreshToken);
        }
        catch (error) {
            throw new common_1.BadRequestException('INVALID_TOKEN_EXPIRED');
        }
        const currentRefreshForAddress = this.refreshTokenByAddress.get(jwtData.address);
        if (currentRefreshForAddress !== refreshToken) {
            throw new common_1.BadRequestException('INVALID_TOKEN_EXPIRED');
        }
        return {
            accessToken: this.getAccessToken(jwtData.address),
            refreshToken: this.getRefeshToken(jwtData.address),
        };
    }
    logout(address, refreshToken) {
        if (refreshToken !== this.refreshTokenByAddress.get(address)) {
            throw new common_1.BadRequestException('INVALID_REFRESH_TOKEN');
        }
        this.refreshTokenByAddress.delete(address);
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map