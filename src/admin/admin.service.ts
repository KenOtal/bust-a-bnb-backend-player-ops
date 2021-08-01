import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AllowList, AllowListDocument } from './schema/allowList.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AllowList.name)
    private allowModel: Model<AllowListDocument>,
  ) {}

  async createAllowAddress(address: string): Promise<AllowListDocument> {
    const exists = await this.allowModel.findOne({ address: address });

    if (exists) return exists;

    const record = new this.allowModel({ address });
    return record.save();
  }

  async deleteAllowAddress(address: string): Promise<AllowListDocument> {
    return await this.allowModel.findOneAndDelete({ address: address });
  }

  async getAllowAddressList(): Promise<AllowListDocument[]> {
    return await this.allowModel.find().lean();
  }

  async verifyIfAddressIsAllowed(address: string) {
    const verifiedAddress = await this.allowModel
      .findOne({ address: address })
      .lean();
    if (!verifiedAddress) throw new ForbiddenException();
    return verifiedAddress;
  }
}
