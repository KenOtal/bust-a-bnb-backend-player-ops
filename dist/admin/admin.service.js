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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const allowList_schema_1 = require("./schema/allowList.schema");
let AdminService = class AdminService {
    constructor(allowModel) {
        this.allowModel = allowModel;
    }
    async createAllowAddress(address) {
        const exists = await this.allowModel.findOne({ address: address });
        if (exists)
            return exists;
        const record = new this.allowModel({ address });
        return record.save();
    }
    async deleteAllowAddress(address) {
        return await this.allowModel.findOneAndDelete({ address: address });
    }
    async getAllowAddressList() {
        return await this.allowModel.find().lean();
    }
    async verifyIfAddressIsAllowed(address) {
        const verifiedAddress = await this.allowModel
            .findOne({ address: address })
            .lean();
        if (!verifiedAddress)
            throw new common_1.ForbiddenException();
        return verifiedAddress;
    }
};
AdminService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel(allowList_schema_1.AllowList.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminService);
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map